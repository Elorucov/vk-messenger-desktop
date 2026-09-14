import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useLang } from '../hooks/useLang';
import { useFetchData } from '../hooks/useFetchData';
import { CallButton, CallButtonTypes } from '../components/CallButton/CallButton';
import { IncomingCall } from '../components/IncomingCall/IncomingCall';
import { CallModal } from '../components/CallModal/CallModal';
import { CallType, E_ACTION } from '../constants';
import { CallsEventType, UIMode, isGroupCallByPeer, useCallsBridge } from '@vkontakte-internal/calls-core';
import { Icon24Cancel, Icon24Phone, Icon24Videocam } from '@vkontakte/icons';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
import { isParticipantContact } from '../helpers/participant';
import { FocusTrapWrapper } from '../components/FocusTrapWrapper/FocusTrapWrapper';
export const IncomingCallContainer = () => {
    const SDK = useCallsSDK();
    const bridge = useCallsBridge();
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const declineCall = useFetchData({ cb: SDK.declineCall });
    const acceptCall = useFetchData({ cb: bridge.acceptCall });
    const me = useTypedSelector((state) => state.me);
    const peer = useTypedSelector((state) => state.peer);
    const callData = useTypedSelector((state) => state.callData);
    const participants = useTypedSelector((state) => state.participants);
    const sendStats = useSendStatsService();
    let conversation = useTypedSelector((state) => state.caller);
    if (!conversation) {
        // TODO CALL-21629 add comment or modify, incoming will be always from creator for contact while toggle is off
        conversation = isGroupCallByPeer(peer) ? callData.conversation : participants[peer];
    }
    const isCallToContact = isParticipantContact(me);
    const isVideoCall = callData.type === CallType.VIDEO;
    const callDescription = isCallToContact
        ? getLang('calls_incoming_call_to_contact')
        : isVideoCall
            ? getLang('calls_incoming_videocall')
            : getLang('calls_incoming_audiocall');
    const pickUpWithAudioText = isVideoCall ? getLang('calls_reply_with_audio') : getLang('calls_reply');
    const declineCallText = isVideoCall ? getLang('calls_reject_call') : getLang('calls_reject');
    const onDeclineCall = () => {
        declineCall.fetchData();
        sendStats(ClickHouseEventType.CALL_DECLINED_OR_HANGED_LOCALLY, {
            reason: 'none',
        });
    };
    const collapseCall = () => {
        dispatch({
            type: E_ACTION.CHANGE_UI_MODE,
            mode: UIMode.COLLAPSED,
        });
        bridge.eventBus.emit(CallsEventType.LAYOUT_COLLAPSED);
    };
    return (_jsx(CallModal, { onClose: onDeclineCall, isIncoming: true, shouldConfirmClosing: true, children: _jsx(FocusTrapWrapper, { isAlertDialog: true, label: `${conversation?.tab || ''} ${callDescription}`, children: _jsx(IncomingCall, { id: peer, title: decodeHTMLEntities(conversation?.tab || ''), description: callDescription, photo: conversation?.photo || '', onCollapseCall: collapseCall, isNFT: conversation?.is_nft, children: _jsxs(_Fragment, { children: [isVideoCall && (_jsx(CallButton, { "data-testid": "calls_incoming_call_reply_video", text: getLang('calls_reply_with_video'), type: CallButtonTypes.POSITIVE, icon: _jsx(Icon24Videocam, {}), onClick: () => acceptCall.fetchData(true, true), disabled: acceptCall.loading })), _jsx(CallButton, { text: pickUpWithAudioText, "data-testid": "calls_incoming_call_reply_audio", type: isVideoCall ? CallButtonTypes.REGULAR : CallButtonTypes.POSITIVE, icon: _jsx(Icon24Phone, {}), onClick: () => acceptCall.fetchData(false, true), disabled: acceptCall.loading, "data-focus-first": true }), _jsx(CallButton, { text: declineCallText, "data-testid": "calls_incoming_call_decline", type: CallButtonTypes.NEGATIVE, icon: _jsx(Icon24Cancel, {}), onClick: onDeclineCall, disabled: declineCall.loading })] }) }) }) }));
};
//# sourceMappingURL=IncomingCallContainer.js.map