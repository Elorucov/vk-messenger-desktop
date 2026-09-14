import '../../ui/MediaViewer/MediaViewer.css';
import React, { useCallback, useEffect, useMemo } from 'react';
import * as Post from '../../../core/model/Post';
import * as Channel from '../../../core/model/Channel';
import * as History from '../../../core/model/History';
import { useRouter } from '../../ui/Router/Router';
import { useChannels, useDispatch } from '../../hooks/misc';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { MediaViewer } from '../../ui/MediaViewer/MediaViewer';
import { fromApiPhoto } from '../../../data/converter/AttachConverter';
import { useApiFetch } from '../../hooks/useApiFetch';
import { useMediaWrapper } from '../../ui/MediaWrapper/hooks/useMediaWrapper';
import { MediaViewerToolbar } from '../../ui/MediaViewerToolbar/MediaViewerToolbar';
export const ChannelMediaWrapper = ({ modal, contextClass, portalTarget, isHidden, }) => {
    const channels = useChannels();
    const { replace } = useRouter();
    const dispatch = useDispatch();
    const apiFetch = useApiFetch();
    const getModalContextId = useCallback((modal) => {
        if (!modal.source) {
            throw new Error('Не можем получить modal source');
        }
        return modal.source.channelId;
    }, []);
    const channel = useMemo(() => {
        const channel = channels.get(getModalContextId(modal));
        if (!channel) {
            throw new Error('Не можем получить канал');
        }
        return channel;
    }, [modal, channels, getModalContextId]);
    const fetchAttachments = useCallback(async ({ id, cmid }, modal, count, offset) => {
        if (!modal.source) {
            return null;
        }
        const response = await apiFetch('channels.getHistoryAttachments', {
            extended: 1,
            channel_id: modal.source.channelId,
            attachment_id: `${modal.source.channelId}_${id}`,
            cmid,
            count,
            offset,
            // В текущий момент поддерживаем только photo в сквозном просмотре, в будущем добавится video
            attachment_types: 'photo',
        }, { retries: 3 });
        if (!response.items) {
            return null;
        }
        return response.items
            .reverse()
            .reduce((acc, historyAttachItem) => {
            const photo = historyAttachItem.attachment.photo &&
                fromApiPhoto({
                    apiPhoto: historyAttachItem.attachment.photo,
                });
            // В текущий момент поддерживаем только photo в сквозном просмотре, в будущем добавится video
            if (photo) {
                acc.push({
                    ...photo,
                    cmid: Post.resolveCmid(historyAttachItem.cmid),
                });
            }
            return acc;
        }, []);
    }, [apiFetch]);
    const changeRoute = useCallback((mediaItem) => {
        if (!modal.source ||
            (mediaItem.id === modal.id && mediaItem.cmid === modal.source.cmid)) {
            return;
        }
        replace({
            ...modal,
            id: mediaItem.id,
            accessKey: mediaItem.accessKey,
            source: {
                ...modal.source,
                cmid: mediaItem.cmid,
                mediaViewerItemPosition: 1,
            },
        });
    }, [replace, modal]);
    const insertToMediaViewerCache = useCallback((data, channelId) => {
        dispatch({
            type: 'ChannelMediaViewerCacheInserted',
            channelId,
            data,
        });
    }, [dispatch]);
    const { mediaViewerItems, mediaViewerIndex, fetchAttachmentsWrapper, onFetchAttachmentsResolve, setMediaViewer, setPrevWithDispatch, setNextWithDispatch, closeMediaViewer, handlePrev, handleNext, hidePrev, hideNext, isMediaViewerLoading, } = useMediaWrapper({
        modal,
        getModalContextId,
        changeRoute,
        fetchAttachments,
        getMediaIndex,
        getMediaIndexByModal,
        insertToMediaViewerCache,
    });
    /**
     * Пытаемся найти и установить кеш всего MediaViewer'a
     */
    const findAndSetMediaViewerCache = (modal) => {
        if (!modal.source)
            return false;
        const channel = channels.get(modal.source.channelId);
        if (!channel || channel.kind === 'ChannelRestricted')
            return false;
        const cachedMediaViewer = Channel.findMediaViewerCacheItem(channel, modal.id, modal.source.cmid) &&
            channel.mediaViewerCache;
        if (cachedMediaViewer) {
            setMediaViewer(cachedMediaViewer.items);
            setPrevWithDispatch(cachedMediaViewer.hasPrev);
            setNextWithDispatch(cachedMediaViewer.hasNext);
            // Кеш нашли и установили
            return true;
        }
        if (!cachedMediaViewer && channel.mediaViewerCache.items.length) {
            // Очищаем кеш если не нашли вложение в кеше, но какой-то кеш при этом есть
            dispatch({ type: 'ChannelMediaViewerCacheRemoved', channel });
        }
        return false;
    };
    /**
     * Пытаемся найти и установить медиа из кеша поста,
     * на время запроса за данными, чтобы сразу показать картинку
     */
    const findAndSetMediaFromPostCache = (modal) => {
        if (!modal.source)
            return false;
        const channel = channels.get(modal.source.channelId);
        if (!channel || channel.kind === 'ChannelRestricted')
            return false;
        const cmid = Post.resolveCmid(modal.source.cmid);
        const nodeData = History.findNodeByCmid(channel.history, modal.source.cmid);
        const post = nodeData.status === 'Node' && nodeData.node.item;
        const photo = post && post.attaches.photos?.find((photo) => photo.id === modal.id);
        const mediaViewerItem = photo && { ...photo, cmid };
        if (mediaViewerItem) {
            setMediaViewer([mediaViewerItem]);
            // Кеш нашли и установили
            return true;
        }
        return false;
    };
    // Закрываем просмотрщик, если юзера забанили
    useEffect(() => {
        if (!channel || channel.kind === 'ChannelRestricted') {
            return;
        }
        if (channel.banInfo || !channel.isMember) {
            closeMediaViewer();
        }
    }, [channel, closeMediaViewer]);
    /**
     * mounted effect – внутри происходит 3 действия
     *
     * 1. Попытка найти кеш всего MediaViewer'a из Store Channel
     * 2. Если не нашли, делаем запрос в API
     * 3. На время запроса пытаемся установить медиа из кеша поста
     */
    useEffect(() => {
        if (!modal.source || !channel || channel.kind === 'ChannelRestricted') {
            return closeMediaViewer();
        }
        // Сначала пытаемся получить кеш всего MediaViewer'a из Channel
        if (findAndSetMediaViewerCache(modal)) {
            return;
        }
        // Если кеш MediaViewer'a в Channel не найден – делаем запрос
        fetchAttachmentsWrapper({
            id: modal.id,
            cmid: modal.source.cmid,
        }, modal, 'both').then(onFetchAttachmentsResolve.bind(null, 'both'));
        // Пока идет запрос в API, пытаемся достать пост из кеша
        findAndSetMediaFromPostCache(modal);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const $mediaViewerPhoto = React.useRef();
    const $mediaViewerVideo = React.useRef();
    return (React.createElement(ModalView, { onEscape: closeMediaViewer, contextClass: contextClass, portalTarget: portalTarget, isHidden: isHidden },
        React.createElement(ModalBackdrop, { onClick: closeMediaViewer, className: "MediaViewer__modalBackdrop" },
            React.createElement(MediaViewer, { mediaItems: mediaViewerItems, index: mediaViewerIndex, showCount: false, isLoading: isMediaViewerLoading, hidePrev: hidePrev, hideNext: hideNext, onPrev: handlePrev, onNext: handleNext, onClose: closeMediaViewer, mediaViewerPhotoRef: $mediaViewerPhoto, mediaViewerVideoRef: $mediaViewerVideo, toolbar: React.createElement(MediaViewerToolbar, { mediaItems: mediaViewerItems, index: mediaViewerIndex, mediaViewerPhotoRef: $mediaViewerPhoto, mediaViewerVideoRef: $mediaViewerVideo, canShare: true, canSave: true }), withPhotoContextMenu: true }))));
};
const getMediaIndex = (mediaItems, { id, cmid }) => mediaItems.findIndex((attachMedia) => attachMedia.id === id &&
    // Эти проверки необходимы, так как могут быть одинаковые аттачи в разных сообщениях
    attachMedia.cmid === cmid);
const getMediaIndexByModal = (mediaItems, modal) => modal.source
    ? getMediaIndex(mediaItems, {
        id: modal.id,
        cmid: modal.source.cmid,
    })
    : -1;
//# sourceMappingURL=ChannelMediaWrapper.js.map