import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { ColorSchemeProvider, AppRootProvider } from '@vkontakte-internal/vkcom-kit';
import { CallModal } from '../../../components/CallModal/CallModal';
import { setMode } from '../../../actions/mode';
import { CallsEventType, Mode, EMPTY_PEER_ID, isGroupCallByPeer, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { FeedbackRedesignScreen } from './FeedbackRedesignScreen';
import { ClickHouseEventType, useSendStatsService } from '../../../stats/clickHouse';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getConfigDeviceId, getLastCallData } from '../../../selectors';
import { uploadDebugLogs } from '@vkontakte/calls-sdk';
const MAX_CUSTOM_FEEDBACK_LENGTH = 300;
export const FeedbackRedesignContainer = () => {
    const dispatch = useTypedDispatch();
    const bridge = useCallsBridge();
    const sendStats = useSendStatsService();
    const lastCallData = useTypedSelector(getLastCallData);
    const configDeviceId = useTypedSelector(getConfigDeviceId);
    const [loading, setLoading] = useState(false);
    function closeModal() {
        dispatch(setMode(Mode.READY));
    }
    const handleSubmit = async ({ userResponse, feedback, customFeedback, uploadLogs, }) => {
        let uploadLogReason;
        if (uploadLogs) {
            try {
                setLoading(true);
                uploadLogReason = 'LogSent';
                await uploadDebugLogs();
            }
            catch (e) {
                uploadLogReason = 'LogSendFailed';
            }
            finally {
                setLoading(false);
            }
        }
        else if (userResponse <= 3 && !uploadLogs) {
            uploadLogReason = 'LogSkipped';
        }
        closeModal();
        const peerId = (lastCallData ? lastCallData.peerId : EMPTY_PEER_ID) || EMPTY_PEER_ID;
        const callId = lastCallData ? lastCallData.callId : '';
        sendStats(ClickHouseEventType.USER_FEEDBACK_RECEIVED, {
            session_id: callId,
            peer_id: peerId,
            device_id: configDeviceId,
            is_group_call: isGroupCallByPeer(peerId),
            user_response: userResponse,
            feedback: feedback,
            custom_feedback: customFeedback ? customFeedback.substring(0, MAX_CUSTOM_FEEDBACK_LENGTH) : undefined,
            is_room: lastCallData?.isVoiceRoom,
            reason: uploadLogReason,
        });
        bridge.eventBus.emit(CallsEventType.SUCCESS_FEEDBACK);
    };
    return (_jsx(AppRootProvider, { children: _jsx(ColorSchemeProvider, { value: "dark", children: _jsx(CallModal, { onClose: closeModal, onBackdropClick: closeModal, className: "FeedbackNewScreenModal", children: _jsx(FeedbackRedesignScreen, { handleClose: closeModal, handleSubmit: handleSubmit, loading: loading }) }) }) }));
};
//# sourceMappingURL=FeedbackRedesignContainer.js.map