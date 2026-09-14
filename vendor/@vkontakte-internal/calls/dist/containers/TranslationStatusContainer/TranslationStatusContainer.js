import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20ShareOutline":["@vkontakte/icons",{"className":1}],"Icon20Cancel":["@vkontakte/icons",{"className":1}]} */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalType, isCreator, isAdmin, vkIdToPeerId } from '@vkontakte-internal/calls-core';
import { TranslationStatus, TranslationStatusRecord, } from '../../components/TranslationStatus/TranslationStatus';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { CallTimer } from '../../components/CallTimer/CallTimer';
import { formatDuration } from '@vkontakte/vkjs';
import { Icon20Cancel, Icon20ShareOutline } from '@vkontakte/icons';
import { DAY, SECOND_JS } from '../../helpers/date';
import { videoLiveHeartbeat } from '../../services/backend';
import { canStopTranslation } from '../../helpers/translation';
import { isParticipantGroup } from '../../helpers/participant';
import { handlePromiseError } from '../../helpers/logger';
import { useFetchData } from '../../hooks/useFetchData';
import { useDialogController } from '../../hooks/useDialogController';
import { useLang } from '../../hooks/useLang';
import { useSendStatsService, ClickHouseEventType } from '../../stats/clickHouse';
import { useConfig } from '../../services/config';
import { toggleModal } from '../../actions';
import { useVideoRecordData } from '../../hooks/useVideoRecordData';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { publishStream } from '@vkontakte/calls-sdk';
import { TranslationStatusContainerProvider, useTranslationStatusContainerModel } from './model';
const useLegacyReduxState = () => useTypedSelector((state) => ({
    groupId: state.groupId,
    localDevice: state.localDevice,
    me: state.me,
    participants: state.participants,
    translation: state.translation,
}));
const TranslationStatusView = observer(function TranslationStatusView() {
    const { getLang, langNumeric } = useLang();
    const { enableSpectatorsCount } = useConfig();
    const { roomId } = useTranslationStatusContainerModel();
    const state = useLegacyReduxState();
    const dispatch = useTypedDispatch();
    const sendStats = useSendStatsService();
    const [host, setHost] = useState(null);
    const [translationTimer, setTranslationTimer] = useState('');
    const [timeDiff, setTimeDiff] = useState(() => calculateTimeDiff(state.translation.startTime));
    const [isUpcoming, setIsUpcoming] = useState(isUpcomingByTimeDiff(timeDiff));
    const [tooltipText, setTooltipText] = useState('');
    const [isShowCountdown, setIsShowCountdown] = useState(false);
    const [viewersCount, setViewersCount] = useState(undefined);
    const { isOpened: isOpenStartNowModal, handleCloseDialog: handleCloseStartNowModal, handleOpenDialog: handleOpenStartNowModal, } = useDialogController();
    const isCanManage = useMemo(() => {
        return isAdmin(state.localDevice) || isCreator(state.localDevice);
    }, [state.localDevice]);
    const publishTranslation = useFetchData({ cb: publishStream });
    const handlePublishTranslation = () => {
        if (!publishTranslation.loading) {
            publishTranslation
                .fetchData(roomId)
                .then(() => {
                sendStats(ClickHouseEventType.SCHEDULED_CALL_LIVE_STARTED, { reason: 'StartedManualy' });
            })
                .catch(handlePromiseError)
                .finally(handleCloseStartNowModal);
        }
    };
    const videoRecordData = useVideoRecordData({
        isRecord: state.translation.isRecord,
        ownerId: state.translation.ownerId,
        videoId: state.translation.videoId,
    });
    const isMeAuthor = (() => {
        if (isParticipantGroup(state.groupId)) {
            return state.groupId === state.translation.ownerId;
        }
        return ((state.translation.ownerId && state.me === vkIdToPeerId(state.translation.ownerId)) ||
            state.me === state.translation.host?.id);
    })();
    /** открывает модалку "Завершить запись звонка" */
    const openStopRecordModal = useCallback(() => {
        dispatch(toggleModal(ModalType.TRANSLATION_STOP));
    }, []);
    const hasTranslationPermission = useMemo(() => canStopTranslation(state), [state.translation, state.localDevice]);
    useEffect(() => {
        if (!enableSpectatorsCount) {
            return () => { };
        }
        const { ownerId, videoId } = state.translation;
        let timer;
        if (ownerId && videoId && !isUpcoming) {
            const updateSpectatorsCount = () => {
                const data = {
                    owner_id: ownerId,
                    video_id: videoId,
                };
                videoLiveHeartbeat(data)
                    .then((response) => {
                    setViewersCount(response.spectators?.count ?? 0);
                })
                    .catch(handlePromiseError);
            };
            updateSpectatorsCount();
            timer = setInterval(updateSpectatorsCount, 15 * SECOND_JS);
        }
        return () => clearInterval(timer);
    }, [isUpcoming, state.translation.ownerId, state.translation.videoId, enableSpectatorsCount]);
    useEffect(() => {
        if (state.translation.host?.id) {
            const participant = state.participants[state.translation.host?.id];
            const name = participant?.shortName || participant?.name;
            if (name !== host) {
                setHost(name);
            }
            return;
        }
        if (host) {
            setHost(null);
        }
    }, [state.translation, state.participants]);
    const actions = useMemo(() => {
        const actions = [];
        if (hasTranslationPermission) {
            if (isUpcoming) {
                actions.push({
                    text: getLang('calls_info_translation_will_start_soon'),
                });
            }
            actions.push({
                before: _jsx(Icon20ShareOutline, { className: "TranslationStatus__actionsIcon" }),
                text: getLang('calls_info_translation_share_menu_item'),
                handleClick: () => dispatch(toggleModal(ModalType.TRANSLATION_SHARE)),
            });
            actions.push({
                before: _jsx(Icon20Cancel, { className: "TranslationStatus__actionsIcon" }),
                text: getLang('calls_translation_stop_menu_item'),
                handleClick: openStopRecordModal,
            });
        }
        return actions;
    }, [hasTranslationPermission, isUpcoming]);
    useEffect(() => {
        const isUpcoming = isUpcomingByTimeDiff(timeDiff);
        if (isUpcoming && timeDiff > -4 && hasTranslationPermission && !isShowCountdown) {
            sendStats(ClickHouseEventType.SCHEDULED_CALL_LIVE_STARTED, { reason: 'StartedByTimer' });
            setIsShowCountdown(true);
            dispatch(toggleModal(ModalType.TRANSLATION_START_COUNTDOWN));
        }
        setIsUpcoming(isUpcoming);
    }, [timeDiff]);
    useEffect(() => {
        const timeDiff = calculateTimeDiff(state.translation.startTime);
        setTimeDiff(timeDiff);
        const timer = setInterval(() => setTimeDiff(calculateTimeDiff(state.translation.startTime)), SECOND_JS);
        return () => clearInterval(timer);
    }, [state.translation.startTime]);
    useEffect(() => {
        let timer = '';
        const timerLabel = state.translation.isRecord
            ? getLang('calls_record_duration')
            : getLang('calls_translation_duration');
        const timerDataTestid = `calls_${state.translation.isRecord ? 'record' : 'translation'}_timer`;
        if (isUpcoming) {
            const timeDiffLocal = Math.abs(timeDiff);
            if (timeDiffLocal > DAY) {
                const countOfDays = Math.floor(timeDiffLocal / DAY);
                timer = langNumeric(countOfDays, 'calls_translation_upcoming_time_more_day_short', getLang('calls_translation_upcoming_time_more_day_short', countOfDays)).replace('%s', countOfDays);
            }
            else {
                timer = getTranslationTimer('-' + formatTranslationDuration(timeDiffLocal), timerLabel, timerDataTestid);
            }
        }
        else {
            timer = getTranslationTimer(formatTranslationDuration(timeDiff), timerLabel, timerDataTestid);
        }
        setTranslationTimer(timer);
    }, [timeDiff, isUpcoming]);
    useEffect(() => {
        if (!hasTranslationPermission) {
            let tooltipText = '';
            if (isUpcoming) {
                tooltipText = getLang('calls_info_translation_will_start_soon');
            }
            else {
                if (host) {
                    tooltipText = getLang('calls_translation_host_info').replace('{name}', host);
                }
                else {
                    tooltipText = getLang('calls_translation_host_info_unknown');
                }
            }
            setTooltipText(tooltipText);
        }
    }, [isUpcoming, host, hasTranslationPermission]);
    if (!!state.translation.isRecord) {
        if (isMeAuthor) {
            return (_jsx(TranslationStatusRecord, { onStopRecord: openStopRecordModal, recordStartTimeMs: state.translation.startTime, isMeAuthor: isMeAuthor, translationTimer: translationTimer }));
        }
        return (_jsx(TranslationStatusRecord, { onStopRecord: openStopRecordModal, recordStartTimeMs: state.translation.startTime, isCanStopRecord: isCanManage, recordAuthorDisplayName: videoRecordData.recordAuthorDisplayName }));
    }
    return (_jsx(TranslationStatus, { translationTimer: translationTimer, viewersCount: viewersCount, isLiveIndicatorOff: isUpcoming, actions: actions, tooltipText: tooltipText, onTranslationPublish: handlePublishTranslation, isOpenStartNowModal: isOpenStartNowModal, onOpenStartNowModal: handleOpenStartNowModal, onCloseStartNowModal: handleCloseStartNowModal, isCanManage: isCanManage }));
});
function getTranslationTimer(duration, label, dataTestId) {
    return _jsx(CallTimer, { duration: duration, label: label, dataTestId: dataTestId });
}
function formatTranslationDuration(diff) {
    const PADDING_THRESHOLD = 9 * 60 + 59;
    if (diff === 0) {
        return '00:00';
    }
    return diff <= PADDING_THRESHOLD ? '0' + formatDuration(diff) : formatDuration(diff);
}
function isUpcomingByTimeDiff(timeDiff) {
    return timeDiff < 0;
}
function calculateTimeDiff(upcomingTime) {
    const now = Date.now();
    const diff = Math.floor((now - upcomingTime) / 1000);
    return diff;
}
export const TranslationStatusWidget = createWidget(TranslationStatusContainerProvider, TranslationStatusView);
//# sourceMappingURL=TranslationStatusContainer.js.map