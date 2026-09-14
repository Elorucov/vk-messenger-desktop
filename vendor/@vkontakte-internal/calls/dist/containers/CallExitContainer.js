import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { CallExitModal } from '../components/CallExitModal/CallExitModal';
import { onForceCallFinish } from '../actions/call';
import { getActiveParticipantsCount } from '../helpers/participant';
import { participantIsAdmin, ClickHouseEventType, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { isMiniAppSource } from '../helpers/apps';
import { ModalBox, ModalCardBase, Button, ButtonGroup, ModalDismissButton, } from '@vkontakte-internal/vkcom-kit';
import { Icon56PhoneOutline } from '@vkontakte/icons';
import { useLang } from '../hooks/useLang';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useSendStatsService } from '../stats/clickHouse';
import { useCloseModal } from '../hooks/useCloseModal';
import { getCallId, getConversationOptions, getDevices, getEntryPoint, getMyDevice, getMyId, getParticipants, getPeerId, getPeerIdToDevices, } from '../selectors';
import { ConversationOption } from '@vkontakte/calls-sdk';
export const CallExitContainer = ({ additionalStatsData, isLeaveCallButtonHidden, }) => {
    const SDK = useCallsSDK();
    const bridge = useCallsBridge();
    const callId = useTypedSelector(getCallId);
    const devices = useTypedSelector(getDevices);
    const peerIdToDevices = useTypedSelector(getPeerIdToDevices);
    const peer = useTypedSelector(getPeerId);
    const entryPoint = useTypedSelector(getEntryPoint);
    const participants = useTypedSelector(getParticipants);
    const me = useTypedSelector(getMyId);
    const localDevice = useTypedSelector(getMyDevice);
    const conversationOptions = useTypedSelector(getConversationOptions);
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const { VKComKitModal } = bridge;
    const sendStats = useSendStatsService();
    const closeModal = useCloseModal();
    const isMiniApp = useMemo(() => isMiniAppSource(entryPoint?.source), [entryPoint?.source]);
    const canFinishCall = useMemo(() => participantIsAdmin(localDevice), [localDevice]);
    const isRepeatedCall = conversationOptions.some((option) => option === ConversationOption.RECURRING);
    const logHangupEvent = () => {
        sendStats(ClickHouseEventType.CALL_DECLINED_OR_HANGED_LOCALLY, {
            ...additionalStatsData,
            reason: 'none',
            group_call_users_count: getActiveParticipantsCount({
                devices,
                maps: { peerIdToDevices },
                me,
                participants,
            }),
        });
    };
    const onFinishCall = () => {
        closeModal();
        logHangupEvent();
        onForceCallFinish(SDK, bridge, callId || '', peer, dispatch, getLang);
    };
    const onLeaveCall = () => {
        closeModal();
        logHangupEvent();
        return SDK.hangup();
    };
    const textBtnForceFinish = (() => {
        if (isRepeatedCall) {
            return getLang('calls_exit_call_disconnect_all');
        }
        return getLang('calls_force_call_finish_v2');
    })();
    const textDescription = (() => {
        if (isRepeatedCall) {
            return getLang('calls_exit_call_desc');
        }
        return getLang('calls_sure_leave_call_v2');
    })();
    return isMiniApp && VKComKitModal ? (_jsx(VKComKitModal, { onDestroy: closeModal, children: ({ onClose }) => {
            return (
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
            _jsxs(ModalBox, { children: [_jsx(ModalCardBase, { icon: _jsx(Icon56PhoneOutline, {}), header: getLang('calls_leave_call_title'), actions: _jsxs(ButtonGroup, { mode: "vertical", stretched: true, children: [canFinishCall && (_jsx(ButtonGroup, { mode: "horizontal", gap: "s", stretched: true, children: _jsx(Button, { size: "l", mode: "tertiary", appearance: "accent", onClick: onFinishCall, stretched: true, "data-testid": "calls_exit_call_button_force_finish", children: textBtnForceFinish }) })), _jsxs(ButtonGroup, { mode: "horizontal", gap: "s", stretched: true, children: [_jsx(Button, { size: "l", mode: "secondary", onClick: onClose, stretched: true, "data-testid": "calls_exit_call_button_cancel", children: getLang('calls_cancel') }), !isLeaveCallButtonHidden && (_jsx(Button, { size: "l", mode: "primary", onClick: onLeaveCall, stretched: true, "data-testid": "calls_exit_call_button_exit", children: getLang('calls_exit') }))] })] }) }), _jsx(ModalDismissButton, { onClick: onClose })] }));
        } })) : (_jsx(CallExitModal, { onClose: closeModal, actionButtons: [
            _jsx(Button, { "data-testid": "calls_exit_call_button_force_finish", onClick: onFinishCall, size: "m", "data-focus-first": true, mode: "secondary", children: textBtnForceFinish }, "forceCallFinish"),
            ...(!isLeaveCallButtonHidden
                ? [
                    _jsx(Button, { size: "m", "data-testid": "calls_exit_call_button_exit", onClick: onLeaveCall, children: getLang('calls_exit') }, "leave"),
                ]
                : []),
        ], description: textDescription, title: getLang('calls_exit_call') }));
};
//# sourceMappingURL=CallExitContainer.js.map