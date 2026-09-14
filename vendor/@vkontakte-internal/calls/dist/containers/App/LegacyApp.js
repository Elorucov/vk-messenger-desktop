import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo } from 'react';
import { ScreenSpinner } from '@vkontakte-internal/vkcom-kit';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { E_ACTION } from '../../constants';
import { IncomingCallContainer } from '../IncomingCallContainer';
import { CallWidget } from '../CallWidget';
import { getIsMeListener, VoiceRoomCallWidget } from '../../features/voiceRoom';
import { CollapsedCallWidget } from '../../features/miniView/collapsed';
import { SystemSounds } from '../../features/systemSounds';
import { GroupCallSetupWidget } from '../GroupCallSetupContainer';
import { SettingsContainer } from '../SettingsContainer';
import { CallsErrorBoundary } from '../CallsErrorBoundary';
import { CallManagementWidget } from '../../features/callManagement';
import { ChangeParticipantNameContainer } from '../ChangeParticipantNameContainer';
import { ErrorContainer } from '../ErrorContainer';
import { CallExitContainer } from '../CallExitContainer';
import { useFullScreen } from '../../services/hooks';
import { CautionContainer } from '../CautionContainer';
import { MuteParticipantWidget } from '../MuteParticipantWidget';
import { UnmuteRequestContainer } from '../UnmuteRequestContainer';
import { AssignAdminContainer } from '../AssignAdminContainer';
import { wakeLockRelease, wakeLockRequest } from '../../services/wakelock';
import { TranslationContainer } from '../TranslationContainer';
import { TranslationStopWidget } from '../TranslationStopContainer';
import { TranslationShareWidget } from '../TranslationShareContainer';
import { AdminPinUnmuteRequestContainer } from '../AdminPinUnmuteRequestContainer';
import { TransferAdminRightsContainer } from '../TransferAdminRightsContainer';
import { TranslationStartCountdownWidget } from '../TranslationStartCountdownContainer';
import { KickParticipantContainer } from '../KickParticipantContainer';
import { FeedbackContainer } from '../FeedbackContainer';
import { UnbanParticipantContainer } from '../UnbanParticipantContainer';
import { StartCallContainer } from '../StartCallContainer';
import { CallByNameContainer } from '../CallByNameContainer/CallByNameContainer';
import { CallsEventType, modalHasType, ModalType, Mode, UIMode, participantIsAdmin, CallsBridgeProvider, } from '@vkontakte-internal/calls-core';
import { CollapsedWaitingHallContainer } from '../CollapsedWaitingHallContainer';
import { WaitingHallContainer } from '../WaitingHallContainer';
import { VirtualBackgroundSettingsContainer } from '../VirtualBackgroundSettingsContainer';
import { VmojiSettingsWidget } from '../../features/vmoji';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { getCallsCount, increaseCallsCount } from '../../helpers/call';
import { CreateCallByLinkContainer } from '../CreateCallByLinkContainer';
import { isSupported as isVideoVirtualBackgroundSupported } from '@vkontakte/calls-video-effects';
import { isBrowserSupported as isVideoVmojiSupported } from '@vkontakte/calls-vmoji';
import { OnHangupContainer } from '../OnHangupContainer';
import { SendLinkContainer } from '../SendLinkContainer';
import { ModalAddToCalendarContainer } from '../ModalAddToCalendarContainer';
import { ModalPlanCalendarEventContainer } from '../ModalPlanCalendarEventContainer';
import { ModalQRCodeContainer } from '../ModalQRCodeContainer';
import { MovieChooseWidget } from '../../features/watchTogether';
import { RoomTimeoutWidget, RoomsManagementWidget, RoomsCreateWidget, RoomChooseWidget, RoomHelpRequestedWidget, RoomRequestHelp, } from '../../features/rooms';
import { AsrModalWidget } from '../../features/asr';
import { CallsSdkProvider } from '../../providers/CallsSdkProvider';
import { useSetEffectsLsAppType } from '../../hooks/useSetEffectsLsAppType';
import { useCallReactions } from '../../hooks/useCallReactions';
import { isParticipantAnonymOrContact } from '../../helpers/participant';
import { useScreenShareNotVisibleStat } from '../../stats/ScreenShareNotVisible';
import { PiPWidget } from '../../features/simplePiP';
import { useMyTrackerHandler } from '../../hooks/useMyTrackerHandler';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getEntryPoint, getIsMeCommunity, getJoin, getModal, getShouldShowCloseTabWarning, getStartCallModalOptions, } from '../../selectors';
import { useHandleMediaFocusChannel } from '../../services/mediaFocusChannel';
import { FeedbackRedesignContainer } from '../../features/feedbackRedesign';
import { AdminMessagesWidget } from '../../features/adminMessages';
import { JoinScreenContainer } from '../../features/joinScreen/JoinScreenContainer';
import { RoomLeaveRemoveMediaTranslationModalWidget } from '../RoomLeaveRemoveMediaTranslationModalContainer';
import { RoomLeaveAdminRemovedMediaTranslationModalContainer } from '../RoomLeaveAdminRemovedMediaTranslationModalContainer';
import { useDOMElementsSize } from '../../services/shared/DOMElementsSizeService';
import { ModalEditCalendarEventContainer } from '../ModalEditCalendarEventContainer';
const useLegacyReduxState = () => useTypedSelector((state) => ({
    callByName: state.callByName,
    isVoiceRoom: state.isVoiceRoom,
    cautionShown: state.cautionShown,
    config: state.config,
    error: state.error,
    errorShown: state.errorShown,
    groupId: state.groupId,
    isIncoming: state.isIncoming,
    isLoaderVisible: state.isLoaderVisible,
    join: state.join,
    lastCallData: state.lastCallData,
    localDevice: state.localDevice,
    me: state.me,
    mode: state.mode,
    restrictedConversation: state.restrictedConversation,
    uiMode: state.uiMode,
}));
export const LegacyApp = ({ SDK, bridge, onBeforeCallStart, onAfterCallFinish, tabIsMaster, callSounds, config, streamUrlExtractor, pip, viewMode, updateDimensions, clearUpdateDimensions, }) => {
    const { enableVmoji, sferum, enableRoomAdminMessageCollapsed, showFeedbackRedesignScreen, enableScreenShareNotVisibleStat, } = config;
    const state = useLegacyReduxState();
    const { isVoiceRoom, mode } = state;
    const dispatch = useTypedDispatch();
    // Не удалось внести проверку getIsMeListener внутрь селектора
    // Похоже из-за кольцевых зависимостей, при старте звонка в некоторых модулях отсутствуют экспорты из constants
    const shouldShowCloseTabWarning = useTypedSelector(getShouldShowCloseTabWarning) && (!isVoiceRoom || !getIsMeListener(state));
    useMyTrackerHandler();
    useHandleMediaFocusChannel();
    const onClose = useCallback(() => {
        dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
    }, []);
    const onReset = useCallback(() => dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY }), []);
    useEffect(() => {
        if (mode === Mode.CALL) {
            wakeLockRequest();
            return () => {
                wakeLockRelease();
            };
        }
        return () => { };
    }, [mode]);
    useFullScreen(state.uiMode === UIMode.FULLSCREEN && mode === Mode.CALL, () => {
        if (window?.reforgedME?.setCollapsed) {
            window.reforgedME.setCollapsed(true, 'call');
        }
    }, () => {
        /* выключаем фулскрин UI, если был выключен браузерный фулскрин */
        if (state.uiMode === UIMode.FULLSCREEN) {
            dispatch({
                type: E_ACTION.CHANGE_UI_MODE,
                mode: UIMode.DEFAULT,
            });
            bridge.eventBus.emit(CallsEventType.LAYOUT_NORMAL);
        }
        if (window?.reforgedME?.setCollapsed) {
            window.reforgedME.setCollapsed(false, 'call');
        }
    }, [state.uiMode, mode]);
    useEffect(() => {
        if (mode === Mode.CALL) {
            increaseCallsCount();
            if (getCallsCount() % 3 === 0) {
                const timer = setTimeout(() => dispatch({
                    type: E_ACTION.SET_SHOW_DESKTOP_NOTIFICATION,
                    data: true,
                }), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [mode]);
    useEffect(() => {
        // Show confirmation when user closes tab with active call
        if (shouldShowCloseTabWarning) {
            const handler = (e) => {
                // browsers don't show custom message, we should return not empty string
                const message = 'You have active call';
                e.returnValue = message;
                return message;
            };
            window.addEventListener('beforeunload', handler);
            return () => window.removeEventListener('beforeunload', handler);
        }
    }, [shouldShowCloseTabWarning]);
    useDOMElementsSize({ viewMode, update: updateDimensions, clear: clearUpdateDimensions });
    const isMeAdmin = useMemo(() => {
        const participantMe = state.localDevice;
        return participantIsAdmin(participantMe);
    }, [state.localDevice]);
    const isVirtualBackgroundSupported = useMemo(() => {
        return isVideoVirtualBackgroundSupported();
    }, []);
    const isVmojiSupported = isVideoVmojiSupported() &&
        Boolean(enableVmoji) &&
        !sferum &&
        !isParticipantAnonymOrContact(state.me) &&
        !getIsMeCommunity(state);
    useSetEffectsLsAppType();
    useCallReactions();
    useScreenShareNotVisibleStat(mode === Mode.CALL, enableScreenShareNotVisibleStat);
    const isExpandedCall = state.localDevice.status !== ParticipantStatus.WAITING_HALL &&
        mode === Mode.CALL &&
        state.uiMode !== UIMode.COLLAPSED;
    const isRegularCall = !isVoiceRoom && isExpandedCall;
    const isVoiceRoomCall = isVoiceRoom && isExpandedCall;
    const withSimplePiP = pip.enabled && state.localDevice.status !== ParticipantStatus.WAITING_HALL && mode === Mode.CALL;
    const hideCollapsedContainerWhenPipEnabled = pip.enabled &&
        pip.supportApi &&
        state.localDevice.status !== ParticipantStatus.WAITING_HALL &&
        mode === Mode.CALL;
    const modal = useTypedSelector(getModal);
    const startCallModalOptions = useTypedSelector(getStartCallModalOptions);
    const join = useTypedSelector(getJoin);
    const hideCallViaNativeApp = startCallModalOptions?.hideCallViaNativeApp ?? join?.hideCallViaNativeApp;
    const showCallMessages = enableRoomAdminMessageCollapsed && (pip.running || state.uiMode === UIMode.COLLAPSED);
    const entryPoint = useTypedSelector(getEntryPoint);
    return (_jsx(CallsErrorBoundary, { SDK: SDK, eventBus: bridge.eventBus, mode: mode, onReset: onReset, children: _jsx(CallsBridgeProvider, { bridge: bridge, children: _jsxs(CallsSdkProvider, { SDK: SDK, children: [tabIsMaster() && (_jsx(SystemSounds, { onBeforeCallStart: onBeforeCallStart, onAfterCallFinish: onAfterCallFinish, callSounds: callSounds })), withSimplePiP && _jsx(PiPWidget, {}), isRegularCall && _jsx(CallWidget, {}), isVoiceRoomCall && _jsx(VoiceRoomCallWidget, {}), state.localDevice.status === ParticipantStatus.WAITING_HALL &&
                        mode === Mode.CALL &&
                        state.uiMode !== UIMode.COLLAPSED && _jsx(WaitingHallContainer, {}), mode === Mode.INCOMING && state.uiMode !== UIMode.COLLAPSED && _jsx(IncomingCallContainer, {}), state.localDevice.status !== ParticipantStatus.WAITING_HALL &&
                        mode !== Mode.READY &&
                        state.uiMode === UIMode.COLLAPSED &&
                        !hideCollapsedContainerWhenPipEnabled && _jsx(CollapsedCallWidget, {}), state.localDevice.status === ParticipantStatus.WAITING_HALL &&
                        mode !== Mode.READY &&
                        state.uiMode === UIMode.COLLAPSED && _jsx(CollapsedWaitingHallContainer, {}), mode === Mode.START && state.uiMode !== UIMode.COLLAPSED && _jsx(StartCallContainer, {}), !state.lastCallData?.isVoiceRoom && !showFeedbackRedesignScreen && mode === Mode.FEEDBACK && (_jsx(FeedbackContainer, {})), !state.lastCallData?.isVoiceRoom && showFeedbackRedesignScreen && mode === Mode.FEEDBACK && (_jsx(FeedbackRedesignContainer, {})), mode === Mode.CALL_BY && !state.callByName?.withPopup && _jsx(CallByNameContainer, {}), (mode === Mode.JOIN || (mode === Mode.CALL_BY && state.callByName?.withPopup)) && (_jsx(JoinScreenContainer, { ...state.join, anonymousCreateBridge: () => Promise.resolve(), hideCallViaNativeApp: hideCallViaNativeApp, 
                        // TODO: CALL-24881 Разобраться почему не можеть быть undefined, но приходит undefined
                        // @ts-expect-error TS2322: Type CallStatSource | undefined is not assignable to type CallStatSource
                        entryPoint: entryPoint?.source, withPopup: true, onClose: onClose, skipJoinCallPrompt: undefined })), mode === Mode.CREATE_CALL && _jsx(CreateCallByLinkContainer, {}), state.errorShown && (_jsx(ErrorContainer, { title: state.error?.title, text: state.error?.text, handleType: state.error?.handleType, callId: state.error?.callId, onCloseFatal: onClose })), state.cautionShown && _jsx(CautionContainer, { isIncoming: state.isIncoming }), modalHasType(modal, ModalType.GROUP_CALL_SETUP) && _jsx(GroupCallSetupWidget, {}), modalHasType(modal, ModalType.MANAGEMENT) && _jsx(CallManagementWidget, { view: modal.details.view }), modalHasType(modal, ModalType.CHANGE_NAME) && (_jsx(ChangeParticipantNameContainer, { ...modal.details })), modalHasType(modal, ModalType.SETTINGS) && _jsx(SettingsContainer, {}), modalHasType(modal, ModalType.TRANSLATION) && _jsx(TranslationContainer, {}, ModalType.TRANSLATION), modalHasType(modal, ModalType.RECORD) && _jsx(TranslationContainer, { isRecord: true }, ModalType.RECORD), modalHasType(modal, ModalType.TRANSLATION_START_COUNTDOWN) && _jsx(TranslationStartCountdownWidget, {}), modalHasType(modal, ModalType.TRANSLATION_STOP) && _jsx(TranslationStopWidget, {}), modalHasType(modal, ModalType.TRANSLATION_SHARE) && (_jsx(TranslationShareWidget, { linkExtractor: streamUrlExtractor })), modalHasType(modal, ModalType.EXIT) && (_jsx(CallExitContainer, { additionalStatsData: modal.details?.additionalStatsData, isLeaveCallButtonHidden: modal.details?.isLeaveCallButtonHidden })), modalHasType(modal, ModalType.TRANSFER_ADMIN_RIGHTS) && _jsx(TransferAdminRightsContainer, {}), modalHasType(modal, ModalType.UNMUTE) && (_jsx(UnmuteRequestContainer, { requestType: modal.details.requestType })), modalHasType(modal, ModalType.ADMIN_PIN_UNMUTE_REQUEST) && _jsx(AdminPinUnmuteRequestContainer, {}), modalHasType(modal, ModalType.HANGUP) && (_jsx(OnHangupContainer, { hangupType: modal.details.hangupType, isWaitingHall: modal.details.isWaitingHall })), modalHasType(modal, ModalType.SEND_LINK) && (_jsx(SendLinkContainer, { title: modal.details?.title, initialText: modal.details?.initialText, attachment: modal.details?.attachment, onClose: modal.details?.onClose, onSendFinish: modal.details?.onSendFinish })), modalHasType(modal, ModalType.SHARE_PLANNED_CALL) && !!modal.details?.calendarEvent && (_jsx(ModalAddToCalendarContainer, { event: modal.details.calendarEvent })), modalHasType(modal, ModalType.QR_CODE) && (_jsx(ModalQRCodeContainer, { textToEncode: modal.details.textToEncode, qrFileName: modal.details.qrFileName, onClose: modal.details.onClose, isSferum: modal.details.isSferum, detailedDescription: modal.details.detailedDescription, callId: modal.details.callId })), modalHasType(modal, ModalType.PLAN_CALENDAR_EVENT) && _jsx(ModalPlanCalendarEventContainer, {}), modalHasType(modal, ModalType.MOVIE_CHOOSE) && _jsx(MovieChooseWidget, {}), modalHasType(modal, ModalType.ROOM_REQUEST_HELP) && _jsx(RoomRequestHelp, {}), modalHasType(modal, ModalType.ROOM_TIMEOUT) && _jsx(RoomTimeoutWidget, {}), isMeAdmin && modalHasType(modal, ModalType.ROOM_CHOOSE) && _jsx(RoomChooseWidget, {}), isMeAdmin && modalHasType(modal, ModalType.ROOM_CONTROL_CREATE) && _jsx(RoomsCreateWidget, {}), isMeAdmin && modalHasType(modal, ModalType.ROOM_CONTROL) && _jsx(RoomsManagementWidget, {}), isMeAdmin && modalHasType(modal, ModalType.ROOM_HELP_REQUESTED) && (_jsx(RoomHelpRequestedWidget, { externalId: modal.details.externalId })), modalHasType(modal, ModalType.ASR) && _jsx(AsrModalWidget, {}), isVirtualBackgroundSupported && _jsx(VirtualBackgroundSettingsContainer, {}), isVmojiSupported && _jsx(VmojiSettingsWidget, {}), modalHasType(modal, ModalType.ROOM_LEAVE_REMOVE_MEDIA_TRANSLATION) && (_jsx(RoomLeaveRemoveMediaTranslationModalWidget, {})), modalHasType(modal, ModalType.ROOM_LEAVE_ADMIN_REMOVED_MEDIA_TRANSLATION) && (_jsx(RoomLeaveAdminRemovedMediaTranslationModalContainer, {})), modalHasType(modal, ModalType.KICK_PARTICIPANT) && _jsx(KickParticipantContainer, { ...modal.details }), modalHasType(modal, ModalType.MEMBERS_UNBAN) && (_jsx(UnbanParticipantContainer, { members: modal.details.members, showChatHistory: modal.details.showChatHistory })), modalHasType(modal, ModalType.MUTE_PARTICIPANT) && _jsx(MuteParticipantWidget, { ...modal.details }), modalHasType(modal, ModalType.ADMIN_ASSIGNMENT) && (_jsx(AssignAdminContainer, { peerId: modal.details.peerId })), modalHasType(modal, ModalType.EDIT_CALENDAR_EVENT) && (_jsx(ModalEditCalendarEventContainer, { ...modal.details })), state.isLoaderVisible && _jsx(ScreenSpinner, { mode: "overlay" }), showCallMessages && _jsx(AdminMessagesWidget, {})] }) }) }));
};
//# sourceMappingURL=LegacyApp.js.map