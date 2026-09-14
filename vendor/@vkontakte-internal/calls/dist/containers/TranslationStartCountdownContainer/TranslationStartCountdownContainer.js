import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { TranslationStartCountdownModal } from '../../components/TranslationStartCountdownModal/TranslationStartCountdownModal';
import { E_ACTION } from '../../constants';
import { SECOND_JS } from '../../helpers/date';
import { handlePromiseError } from '../../helpers/logger';
import { useLang } from '../../hooks/useLang';
import { useCallsSDK } from '../../providers/CallsSdkProvider';
import { videoStartStreaming } from '../../services/backend';
import { isUndefined } from '@vkontakte/vkjs';
import { useCloseModal } from '../../hooks/useCloseModal';
import { useSendStatsService, ClickHouseEventType } from '../../stats/clickHouse';
import { getTranslationStartTime } from '../../selectors';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { TranslationStartCountdownProvider, useTranslationStartCountdownModel } from './model';
const TranslationStartCountdownView = observer(function TranslationStartCountdownView() {
    const SDK = useCallsSDK();
    const { roomId } = useTranslationStartCountdownModel();
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const startTime = useTypedSelector(getTranslationStartTime);
    const streamParams = useTypedSelector((state) => state.translation?.startStreamParams?.streamParams);
    const upcomingStreamParams = useTypedSelector((state) => state.translation?.startStreamParams?.upcomingStreamParams);
    const [counter, setCounter] = useState(3);
    const isRecord = useTypedSelector((state) => state.translation.isRecord);
    const sendStats = useSendStatsService();
    const closeModal = useCloseModal();
    const handleStop = useCallback(() => {
        const isFutureTranslation = startTime && startTime >= Date.now();
        if (isFutureTranslation) {
            SDK.stopStream(roomId).catch(handlePromiseError);
        }
        closeModal();
    }, [roomId, startTime]);
    useEffect(() => {
        const timer = setInterval(() => setCounter(counter - 1), SECOND_JS);
        return () => clearInterval(timer);
    }, [counter]);
    const handleStartStream = async (data) => {
        const statData = {};
        try {
            const videoStreamData = await videoStartStreaming(data);
            const isRecord = Boolean(data.is_call_record);
            const ovId = String(videoStreamData.stream.ov_id);
            const ownerId = Number(videoStreamData.owner_id);
            const vid = Number(videoStreamData.video_id);
            Object.assign(statData, {
                vid,
                owner_id: ownerId,
                upcoming: 0,
            });
            await SDK.startStream(isRecord, null, ovId, undefined, undefined, roomId);
            sendStats(isRecord ? ClickHouseEventType.CALL_RECORDING_STARTED : ClickHouseEventType.CALL_STREAMING_STARTED, statData);
        }
        catch (err) {
            const errorCode = err?.apiError?.error_code || err?.error?.error_code;
            if (!isUndefined(errorCode)) {
                statData.error = errorCode;
            }
            sendStats(isRecord
                ? ClickHouseEventType.CALL_RECORDING_START_FAILED
                : ClickHouseEventType.CALL_STREAMING_START_FAILED, statData);
            handlePromiseError(err);
            dispatch({
                text: getLang('calls_error_try_again_later'),
                title: isRecord
                    ? getLang('calls_recording_start_error_title')
                    : getLang('calls_translation_start_error_title'),
                type: E_ACTION.ERROR,
            });
        }
    };
    useEffect(() => {
        if (counter > 0) {
            return;
        }
        if (streamParams) {
            handleStartStream(streamParams);
        }
        else if (upcomingStreamParams?.ovId) {
            const statData = {
                vid: upcomingStreamParams?.id,
                owner_id: upcomingStreamParams?.ownerId,
                upcoming: 1,
            };
            SDK.startStream(false, null, upcomingStreamParams?.ovId, undefined, undefined, upcomingStreamParams?.roomId)
                .then(() => {
                sendStats(ClickHouseEventType.CALL_STREAMING_STARTED, statData);
            })
                .catch((err) => {
                sendStats(ClickHouseEventType.CALL_STREAMING_START_FAILED, statData);
                throw err;
            })
                .catch(handlePromiseError);
        }
        closeModal();
    }, [counter, streamParams, upcomingStreamParams, sendStats]);
    return (_jsx(TranslationStartCountdownModal, { onCloseModal: closeModal, counter: counter, onStopTranslation: handleStop, isRecord: isRecord }));
});
export const TranslationStartCountdownWidget = createWidget(TranslationStartCountdownProvider, TranslationStartCountdownView);
//# sourceMappingURL=TranslationStartCountdownContainer.js.map