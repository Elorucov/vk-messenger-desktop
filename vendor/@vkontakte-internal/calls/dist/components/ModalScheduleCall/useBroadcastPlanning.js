import { useEffect, useMemo, useState } from 'react';
import { useFormCheckboxesValues } from '../../hooks/useFormCheckboxesValues';
import { ETranslationPlannedTimeVariant, ETranslationPrivacy, } from '@vkontakte-internal/calls-core';
import { useTranslationPlannedTimeOptions } from './useTranslationPlannedTimeOptions';
import { useUploadImage } from './useUploadImage';
import { useFetchData } from '../../hooks/useFetchData';
import { getThumbUploadUrl, videoDelete, videoGet, videoStartStreaming } from '../../services/backend';
import { handlePromiseError } from '../../helpers/logger';
import { useTranslationPrivacyOptions } from './useTranslationPrivacyOptions';
import { getMinVideoPreview } from './helpers';
import { ClickHouseEventType, useSendStatsService } from '../../stats/clickHouse';
import { isUndefined } from '@vkontakte/vkjs';
/**
 * Хукк - контроллер для управления данными по трансляции при планировании звонка
 * */
export const useBroadcastPlanning = ({ call, isGroupOwner, userId, config }) => {
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [startTimeUnix, setStartTime] = useState(0);
    const [uploadUrl, setUploadUrl] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [videoId, setVideoId] = useState('');
    const [broadcastId, setBroadcastId] = useState(call?.broadcast?.video_id);
    const baseTranslationPreview = useUploadImage({ url: uploadUrl, ownerId, videoId });
    const [hasUnrefinedImage, setHasUnrefinedImage] = useState(false);
    const translationPreview = useMemo(() => ({
        ...baseTranslationPreview,
        handleImageRemove: () => {
            if (baseTranslationPreview.imgSrc) {
                setHasUnrefinedImage(true);
            }
            baseTranslationPreview.handleImageRemove();
        },
        hasUnrefinedImage,
    }), [baseTranslationPreview, hasUnrefinedImage]);
    const sendStats = useSendStatsService();
    const translationTimeVariant = useTranslationPlannedTimeOptions({
        initialValue: ETranslationPlannedTimeVariant.EqualToCallTime,
        setOpenDatePicker,
    });
    const { userOptionsSelect, groupOptionsSelect } = useTranslationPrivacyOptions(config, true);
    const translationPrivacyView = isGroupOwner ? groupOptionsSelect : userOptionsSelect;
    const { userOptionsSelect: userOptions, groupOptionsSelect: groupOptions } = useTranslationPrivacyOptions(config, false);
    const translationPrivacyComment = isGroupOwner ? groupOptions : userOptions;
    const [translationDescription, setTranslationDescription] = useState('');
    const translationCheckbox = useFormCheckboxesValues({
        initialValue: !!call?.broadcast?.video_id,
    });
    const getVideo = useFetchData({ cb: videoGet });
    const startStreaming = useFetchData({ cb: videoStartStreaming });
    const deleteBroadcast = useFetchData({ cb: videoDelete });
    const handleDeleteBroadcast = () => {
        if (broadcastId) {
            const [ownerId, videoId] = broadcastId.split('_');
            setOpenDatePicker(false);
            return deleteBroadcast.fetchData({ video_id: Number(videoId), owner_id: Number(ownerId) });
        }
        else {
            return Promise.resolve();
        }
    };
    const createTranslation = async (ac) => {
        const groupParams = {};
        if (isGroupOwner && userId) {
            groupParams.group_id = Math.abs(userId);
        }
        const statData = {};
        try {
            await handleDeleteBroadcast();
            const { owner_id, video_id } = await startStreaming.fetchData(groupParams, {
                signal: ac.signal,
            });
            const { upload_url } = await getThumbUploadUrl({ owner_id });
            setUploadUrl(upload_url);
            setOwnerId(`${owner_id}`);
            setVideoId(`${video_id}`);
            Object.assign(statData, {
                vid: video_id,
                owner_id,
                upcoming: 1,
            });
            const broadcastVideoId = `${owner_id}_${video_id}`;
            setBroadcastId(broadcastVideoId);
        }
        catch (err) {
            const errorCode = err?.apiError?.error_code || err?.error?.error_code;
            if (!isUndefined(errorCode)) {
                statData.error = errorCode;
            }
            sendStats(ClickHouseEventType.CALL_STREAMING_START_FAILED, statData);
            handlePromiseError(err);
        }
    };
    // При смене владельца звонка необходимо чистить данные по изображению
    useEffect(() => {
        setUploadUrl('');
        translationPreview.handleImageRemove();
    }, [userId]);
    /*
     * Немного о магии происходящей ниже:
     * Есть 2 варианта развития событий
     *  1) Создание нового звонка с трансляцией
     *  2) Редактирование звонка с трансляцией
     * */
    useEffect(() => {
        if (call && call.broadcast?.video_id) {
            return;
        }
        const ac = new AbortController();
        /*
         * Кейс работает для СОЗДАНИЯ нового звонка
         * При включении свитча о необходимости создать трансляцию мы идем в бекенд видео и создаем пустой ролик 'video.save'
         * Далее необходимо вызвать 'video.startStreaming' c полученным выше videoId, и передать флаг call: 1
         * Путем этих манипуляций мы получаем трансляцию, ее video_id, и адрес для загрузки превью (thumb_upload_url)
         * */
        if (translationCheckbox.checked && userId) {
            createTranslation(ac).catch(handlePromiseError);
        }
        if (!translationCheckbox.checked) {
            ac.abort();
        }
        return () => ac.abort();
    }, [translationCheckbox.checked, isGroupOwner, userId, call]);
    useEffect(() => {
        /*
         * Кейс работает для РЕДАКТИРОВАНИЯ звонка с имеющейся в нем трансляцией
         * */
        if (call?.broadcast?.video_id) {
            const [ownerId, videoId] = call.broadcast?.video_id.split('_');
            getVideo.fetchData({ videos: call.broadcast?.video_id }).then((res) => {
                const [video] = res.items;
                if (video) {
                    if (video.live_start_time) {
                        setStartTime(video.live_start_time);
                    }
                    setTranslationDescription(video.description || '');
                    translationPreview.setImgSrc(getMinVideoPreview(video.image));
                    /**
                     * Тут странная логика, но видео пока не отдает приватно byLink в свойствах видео
                     * Потому определяем по вторичным признакам: если у видео есть access_key - значит
                     * оно доступно по ссылке
                     */
                    const privacyView = video.access_key && video.privacy_view?.category === ETranslationPrivacy.OnlyMe
                        ? ETranslationPrivacy.ByLink
                        : video.privacy_view?.category;
                    translationPrivacyView.setValue(privacyView || ETranslationPrivacy.OnlyMe);
                    translationPrivacyComment.setValue(video.privacy_comment?.category || ETranslationPrivacy.OnlyMe);
                    translationTimeVariant.setValue(call?.schedule.time === video.live_start_time || !video.live_start_time
                        ? ETranslationPlannedTimeVariant.EqualToCallTime
                        : ETranslationPlannedTimeVariant.Custom);
                }
            });
            getThumbUploadUrl({ owner_id: Number(ownerId) }).then(({ upload_url }) => setUploadUrl(upload_url));
            setOwnerId(ownerId);
            setVideoId(videoId);
        }
    }, [call]);
    return {
        translationCheckbox,
        translationPreview,
        translationTimeVariant,
        translationPrivacyView,
        translationPrivacyComment,
        translationDescription,
        setTranslationDescription,
        isBroadcastLoading: startStreaming.loading || getVideo.loading,
        broadcastId,
        startTimeUnix,
        hasData: Boolean(translationCheckbox.checked && broadcastId),
        openDatePicker,
        deleteBroadcast: handleDeleteBroadcast,
    };
};
//# sourceMappingURL=useBroadcastPlanning.js.map