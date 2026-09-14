import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { E_ACTION } from '../../constants';
import { CallsEventType, ManagementModalView, ModalType, Mode, NotificationType, UIMode, externalIdToString, roomIdToString, isEmpty, isGroupCallByPeerAndMe, isEmptyPeerId, peerIdToVkId, ENavigateToConvoDirection, useNavigationContext, useVkmeContext, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { OneToOne } from '../../components/OneToOne/OneToOne';
import { Call } from '../../components/Call/Call';
import { CallGridNew } from '../../components/CallGridNew/CallGridNew';
import { CallOratorWidget } from '../../components/CallOrator/CallOrator';
import { CallModal } from '../../components/CallModal/CallModal';
import { Stub } from '../../components/Stub/Stub';
import { CallSubtitles } from '../../features/callSubtitles';
import { CallPhoto } from '../../components/CallPhoto/CallPhoto';
import { canPinParticipants, createSdkParticipantState, getIsHandRaised, getPeerIdDeviceInfo, isParticipantAnonym, isParticipantAnonymOrContact, } from '../../helpers/participant';
import { CallHeaderWidget } from '../../features/callHeader';
import { MediaType, ParticipantStatus } from '@vkontakte/calls-sdk';
import { getHangupStatus } from '../../services/status';
import { loadCallParticipantsAccumulate } from '../../actions/actions';
import { handleCollapseCall } from './handleCollapseCall';
import { useBoxLayerObserver, useNavGoListener } from '../../helpers/fastchat';
import { useContainerControlsVisibility } from '../../hooks/useContainerControlsVisibility';
import { useLang } from '../../hooks/useLang';
import { useCallNotifications } from '../../hooks/useCallNotifications';
import { CallReactionsColumn } from '../../components/CallReactionsColumn/CallReactionsColumn';
import { CallReactionsP2P } from '../../components/CallReactionsP2P/CallReactionsP2P';
import { isFeedbackColumnEnabled, isFeedbackEnabled, isFeedbackPanelEnabled } from '../../helpers/feedback';
import { useReactionsLastChosenIcon } from '../../components/CallReactions/hooks/useReactionsLastChosenIcon';
import { FocusTrap } from '@vkontakte-internal/vkcom-kit';
import { useCallsSDK } from '../../providers/CallsSdkProvider';
import { useScreenShare } from '../../hooks/useScreenShare';
import { getHasInCallChat, getInCallChatOpened, getMyDevice } from '../../selectors';
import { useTooltipChangeHandler } from '../../hooks/useTooltipChangeHandler';
import { ClickHouseEventType, useSendStatsService } from '../../stats/clickHouse';
import { setLocalDevice, setLocalHandState, toggleModal } from '../../actions';
import { useConfig } from '../../services/config';
import { toggleInCallChat } from '../../actions/inCallChat';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { CallProvider, useCallWidgetViewModel } from './CallWidgetViewModel';
import { ActiveParticipantsList } from './ActiveParticipantsList';
import { getVideoResolutionStatsValue } from '../../helpers/videoSettingsStat';
import { useDevicesScroll } from '../../services/devices/useScroll';
const useLegacyReduxState = () => useTypedSelector((state) => ({
    callData: state.callData,
    chatUnreadCount: state.chatUnreadCount,
    config: state.config,
    conversationOptions: state.conversationOptions,
    devices: state.devices,
    externalId: state.externalId,
    groupId: state.groupId,
    hangupType: state.hangupType,
    isOratorMode: state.isOratorMode,
    isShownParticipantsAside: state.isShownParticipantsAside,
    localDevice: state.localDevice,
    me: state.me,
    meGroup: state.meGroup,
    mode: state.mode,
    notification: state.notification,
    onlyAdminCanShareMovie: state.onlyAdminCanShareMovie,
    participants: state.participants,
    participantsChunk: state.participantsChunk,
    peer: state.peer,
    permissions: state.permissions,
    reactions: state.reactions,
    tooltips: state.tooltips,
    translation: state.translation,
    uiMode: state.uiMode,
    localVideoResolution: state.localVideoResolution,
}));
const CallView = observer(function CallView() {
    const { addToParticipantLoadingQueue, canFinishCall, canTransferAdminRights, roomId, roomChatIds, activeDevicesCount, activeParticipantsList, isAudioAllowed, isScreenSharingAllowed, isVideoAllowed, isGroupCall, isMultiView, isGridViewShown, isOratorViewShown, hasOtherDevices, hasParticipantsToShow, speakersInHeader, setFirstVisibleDevice, setDevicesVisibleCount, renderedParticipantListBoundaryIndexes, vmojiService, myExternalId, pinnedParticipant, watchTogetherPinnedParticipant, mediaSharingPinnedParticipant, adminPinnedParticipant, firstVisibleDevice, devicesVisibleCount, onPinParticipant, onPinParticipantForce, leaveCall, leaveRoom, onOpenWatchTogetherFeature, isSubtitlesEnabled: isSubtitlesStateEnabled, orator, onOratorUnpin, isMeCanManageWatchTogether, watchTogetherMovieState, watchTogetherMovieInfo, watchTogetherHint, } = useCallWidgetViewModel();
    const { navigateToConvo } = useNavigationContext();
    const SDK = useCallsSDK();
    const bridge = useCallsBridge();
    const config = useConfig();
    const { onNavigateAway } = useVkmeContext();
    const sendStats = useSendStatsService();
    const { containerRef, refCurrentParticipantsAmount, refContent } = useDevicesScroll({
        roomId,
        setDevicesVisibleCount,
        setFirstVisibleDevice,
    });
    const state = useLegacyReduxState();
    const isMeAnonymOrContact = isParticipantAnonymOrContact(state.me);
    const isMeAnonym = isParticipantAnonym(state.me);
    const isWatchTogetherEnabled = !config.sferum && !isMeAnonymOrContact;
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const refCall = useRef(null);
    const peerId = state.peer;
    const conversation = isGroupCall ? state.callData.conversation : state.participants[peerId];
    const localDevice = useTypedSelector(getMyDevice);
    const isMyHandRaised = getIsHandRaised(localDevice);
    const { mediaSettings: mySettings, statusData: myStatusData } = localDevice;
    const isSubtitlesEnabledByConfig = !config.sferum || (config.sferum && config.enableSubtitlesSferum);
    const isSubtitlesEnabled = Boolean(isSubtitlesStateEnabled && isSubtitlesEnabledByConfig);
    const isPinnedByAdmin = adminPinnedParticipant !== null;
    const isPinnedByUser = !isPinnedByAdmin && pinnedParticipant !== null;
    const isPinnedByMedia = !isPinnedByUser && !!mediaSharingPinnedParticipant;
    const isFullScreen = state.uiMode === UIMode.FULLSCREEN;
    const isServerTopology = state.callData?.topology === "SERVER" /* TransportTopology.SERVER */;
    const isScreenSharingSupported = useMemo(() => SDK.browser.isScreenCapturingSupported(), []);
    const isDeferredStreamAvailable = !!state.translation.deferredId && !state.translation.isOn;
    const [isAudioToggleProcessing, setIsAudioToggleProcessing] = useState(false);
    const [isVideoToggleProcessing, setIsVideoToggleProcessing] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const hasInCallChat = useTypedSelector(getHasInCallChat);
    const isInCallChatCanBeEnabled = isGroupCall || config.enableCallChatForPrivate;
    const isInCallChatEnabled = isInCallChatCanBeEnabled &&
        !isEmptyPeerId(state.peer) &&
        !isMeAnonym &&
        hasInCallChat &&
        config.enableInCallChat;
    const isInCallChatOpened = useTypedSelector(getInCallChatOpened);
    const isChainControls = state.callData.conversation?.canAddMembers !== false && !isMeAnonymOrContact;
    useEffect(() => {
        vmojiService.loadMultipleSvg(activeParticipantsList.map((device) => device.externalId));
    }, [activeParticipantsList, vmojiService]);
    /**
     * В случае перехода из fullscreen в collapse - делаем это асинхронно,
     * чтобы viewport успел обновиться.
     */
    const handleCollapsedCall = useCallback(() => {
        handleCollapseCall({
            uiMode: state.uiMode,
            bridge,
        });
    }, [state.uiMode]);
    // слушатели для перехода в collapsed, при различных событиях
    useNavGoListener(handleCollapsedCall);
    useBoxLayerObserver(handleCollapsedCall);
    const onToggleOratorMode = useCallback(() => {
        dispatch({
            type: E_ACTION.TOGGLE_ORATOR_MODE,
            isOratorMode: !state.isOratorMode,
        });
    }, [state.isOratorMode]);
    const onToggleParticipantsAside = useCallback(() => {
        dispatch({
            type: E_ACTION.TOGGLE_PARTICIPANTS_ASIDE,
            isShownParticipantsAside: !state.isShownParticipantsAside,
        });
    }, [state.isShownParticipantsAside]);
    const onParticipantsClick = useCallback(() => {
        dispatch(toggleModal(ModalType.MANAGEMENT, { view: ManagementModalView.MAIN }));
    }, []);
    const onChainClick = useCallback(() => {
        dispatch(toggleModal(ModalType.MANAGEMENT, { view: ManagementModalView.CALL_LINK }));
    }, []);
    const onToggleVideo = useCallback(() => {
        if (isVideoToggleProcessing || isAudioToggleProcessing) {
            return;
        }
        setIsVideoToggleProcessing(true);
        const isTurningOn = !mySettings.isVideoEnabled;
        SDK.toggleLocalVideo(isTurningOn)
            .catch(() => {
            /** падаем тихо, тк получим сообщение в коллбек
             * onPermissionsError при попытке включить камеру */
        })
            .finally(() => {
            setIsVideoToggleProcessing(false);
        });
        if (isTurningOn) {
            sendStats(ClickHouseEventType.VIDEO_ENABLED);
            sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                reason: getVideoResolutionStatsValue(config.enableHDVideo, state.localVideoResolution),
            });
        }
        else {
            sendStats(ClickHouseEventType.VIDEO_DISABLED, {
                reason: 'manual',
            });
        }
    }, [
        mySettings,
        isVideoToggleProcessing,
        isAudioToggleProcessing,
        state.callData.callId,
        state.peer,
        sendStats,
        state.localVideoResolution,
    ]);
    const onChatClick = useCallback(() => {
        let peer = peerIdToVkId(state.peer);
        if (roomId) {
            const strRoomId = roomIdToString(roomId);
            const chatId = roomChatIds[strRoomId];
            if (chatId === undefined) {
                return;
            }
            peer = chatId;
        }
        if (navigateToConvo(peer) === ENavigateToConvoDirection.Messenger) {
            // Когда переход идет в звонке в Electron'е, внутри десктоп приложения мессенджера,
            // нужно закрывать модалку истории звонков и посылать уведомление об этом
            if (state.mode !== Mode.READY && onNavigateAway) {
                onNavigateAway();
            }
            else {
                handleCollapsedCall();
            }
        }
    }, [state.peer, state.uiMode, roomId, roomChatIds, handleCollapsedCall]);
    const onInCallChatClick = useCallback(() => {
        dispatch(toggleInCallChat());
    }, []);
    const onToggleAudio = useCallback(() => {
        if (isAudioToggleProcessing || isVideoToggleProcessing) {
            return;
        }
        setIsAudioToggleProcessing(true);
        const isTurningOn = !mySettings.isAudioEnabled;
        if (state.notification?.type === NotificationType.SPEAKING_ON_MUTE) {
            dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: null,
            });
        }
        SDK.toggleLocalAudio(isTurningOn)
            .catch(() => {
            /** падаем тихо, тк получим сообщение в коллбек
             * onPermissionsError при попытке включить микрофон */
        })
            .finally(() => {
            setIsAudioToggleProcessing(false);
        });
    }, [mySettings, isAudioToggleProcessing, isVideoToggleProcessing]);
    const onHandClick = useCallback(() => {
        const isRaising = !isMyHandRaised;
        SDK.changeParticipantState(createSdkParticipantState(myStatusData, { hand: isRaising }));
        dispatch(setLocalHandState(myStatusData, !isMyHandRaised));
        sendStats(isRaising ? ClickHouseEventType.HAND_RAISED : ClickHouseEventType.HAND_LOWERED);
    }, [isMyHandRaised, myStatusData, state.callData.callId, state.peer, sendStats]);
    const onFullScreenToggle = useCallback(() => {
        if (isFullScreen) {
            bridge.eventBus.emit(CallsEventType.LAYOUT_NORMAL);
        }
        else {
            bridge.eventBus.emit(CallsEventType.LAYOUT_FULLSCREEN);
        }
        dispatch({
            type: E_ACTION.CHANGE_UI_MODE,
            mode: isFullScreen ? UIMode.DEFAULT : UIMode.FULLSCREEN,
        });
        dispatch({
            type: E_ACTION.SET_TOOLTIP,
            tooltips: null,
        });
    }, [state.uiMode]);
    const onTooltipChange = useTooltipChangeHandler();
    useEffect(() => {
        if (isDeferredStreamAvailable) {
            onTooltipChange('streaming', true);
        }
    }, [isDeferredStreamAvailable]);
    refCurrentParticipantsAmount.current = activeParticipantsList.length;
    const { handleStopScreenShare, handleStartScreenShare, handleStartFastScreenShare } = useScreenShare();
    useEffect(() => {
        return () => {
            dispatch({
                type: E_ACTION.SET_TOOLTIP,
                tooltips: null,
            });
        };
    }, []);
    // Старт отложенной трансляции по кнопке на панели
    const onDeferredStreamStart = () => {
        if (state.translation.deferredId) {
            const translationData = {
                isOn: false,
                startStreamParams: {
                    upcomingStreamParams: {
                        ovId: state.translation.deferredId,
                    },
                },
            };
            dispatch({
                type: E_ACTION.SET_TRANSLATION,
                data: translationData,
            });
            dispatch(toggleModal(ModalType.TRANSLATION_START_COUNTDOWN));
        }
    };
    useEffect(() => {
        if (!state.callData.localTimeStamp &&
            !isGroupCallByPeerAndMe(state.peer, state.me) &&
            !getHangupStatus(state.hangupType, getLang)) {
            const device = getPeerIdDeviceInfo(state.peer, state.devices);
            if (device?.status === ParticipantStatus.CONNECTED) {
                dispatch({
                    type: E_ACTION.LOCAL_TIME_START,
                    data: Date.now(),
                });
            }
        }
    }, [state.callData.localTimeStamp, state.devices, state.hangupType, state.me, state.peer]);
    useEffect(() => {
        if (isGroupCall) {
            setParticipantCount(activeDevicesCount);
        }
    }, [activeDevicesCount]);
    const participantsTriesCount = useRef({});
    const participantsLastUpdate = useRef({});
    // для замыканий в эффектах
    const refState = useRef(state);
    refState.current = state;
    useEffect(() => {
        const _state = refState.current;
        const peerIds = [];
        const needLoad = (deviceId) => {
            const device = _state.devices[deviceId];
            const participant = device && _state.participants[device.externalId.id];
            const status = device?.status;
            const peerId = participant ? participant.peerId : deviceId.split(':')[0];
            const isMe = peerId === _state.me;
            const isAnonym = isParticipantAnonym(peerId);
            return ((!isMe || isAnonym) &&
                (!participant || // если у нас нет такого участника в сторе
                    isEmpty(device?.mediaSettings) || // или если нет его метаданных от ok.ru
                    !participant.name) && // или если нет его метаданных от vk.com
                ((config.enableParticipantsService && (!status || status !== ParticipantStatus.HANGUP)) || // пользователь в звонке/комнате
                    ((participantsTriesCount.current[peerId] ?? 0) < 5 &&
                        // и мы делали меньше 5 попыток на загрузку данных
                        (participantsLastUpdate.current[peerId] === undefined ||
                            Date.now() - participantsLastUpdate.current[peerId] > 10000))));
        };
        const now = Date.now();
        for (const device of activeParticipantsList) {
            const deviceId = externalIdToString(device.externalId);
            const participantId = device.externalId.id;
            if (needLoad(deviceId)) {
                peerIds.push(participantId);
                participantsTriesCount.current[participantId] =
                    (participantsTriesCount.current[participantId] ?? 0) + 1;
                participantsLastUpdate.current[participantId] = now;
            }
        }
        for (const deviceId of speakersInHeader) {
            if (needLoad(deviceId) && _state.devices[deviceId]) {
                peerIds.push(_state.devices[deviceId].externalId.id);
            }
        }
        if (peerIds.length) {
            const callId = _state.callData.callId || '';
            if (config.enableParticipantsService) {
                void addToParticipantLoadingQueue(peerIds, callId);
            }
            else {
                void loadCallParticipantsAccumulate(state, dispatch, callId, peerIds);
            }
        }
    }, [bridge, state.peer, speakersInHeader, activeParticipantsList]);
    const isMovieShareMode = orator.device.streamMode === MediaType.MOVIE || orator.device.streamMode === MediaType.STREAM;
    const callControlsVisibilityController = useContainerControlsVisibility({
        isHardStop: !(isMovieShareMode && isFullScreen),
    });
    const isInRoom = !!roomId;
    const notification = useCallNotifications('CallOrator__notification');
    const handleReactionClick = useCallback((reaction) => {
        // делаем оптимистичный апдейт
        dispatch(setLocalDevice({ lastChosenReaction: { key: reaction, ts: Date.now() } }));
        SDK.feedback(reaction).then(() => {
            // в случае успеха, отправляем выбранную реакцию в статистику
            sendStats(ClickHouseEventType.REACTION_SENT, {
                reaction_type: reaction,
                session_id: state.callData.callId,
            });
        });
    }, [state.callData.callId, sendStats]);
    // сомнительно...
    bridge.leaveCall = leaveCall;
    bridge.leaveRoom = leaveRoom;
    return (_jsx(CallModal, { onClose: leaveCall, shouldConfirmClosing: !canTransferAdminRights && !canFinishCall, onBackdropClick: handleCollapsedCall, priority: "low", children: _jsx(FocusTrap, { hasFirstFocusableElement: true, autoFocus: true, children: _jsx(Call, { watchTogetherHint: watchTogetherHint, ref: refCall, info: _jsx(CallHeaderWidget, { isChainControls: isChainControls, onChainClick: onChainClick }), isVideoAllowed: mySettings.isVideoEnabled || isVideoAllowed, isAudioAllowed: mySettings.isAudioEnabled || isAudioAllowed, isVideoEnabled: !!mySettings.isVideoEnabled, isAudioEnabled: mySettings.isAudioEnabled, isScreenSharingEnabled: mySettings.isScreenSharingEnabled, isMovieStreamEnabled: Boolean(watchTogetherMovieInfo), isOratorMode: state.isOratorMode, isFullScreen: isFullScreen, onToggleVideo: onToggleVideo, onToggleAudio: onToggleAudio, onLeaveCall: leaveCall, onToggleOratorMode: onToggleOratorMode, onFullScreenToggle: onFullScreenToggle, onChat: onChatClick, onInCallChatClick: onInCallChatClick, onHandClick: onHandClick, isLayoutSwitchShown: isGroupCall && hasOtherDevices, isHandRaised: isMyHandRaised, isScreenShareControlActive: isScreenSharingAllowed && isScreenSharingSupported, isStreamingControlShown: isDeferredStreamAvailable, isInRoom: isInRoom, onLeaveRoom: leaveRoom, onDeferredStreamStart: onDeferredStreamStart, onParticipantsClick: onParticipantsClick, chatUnreadCount: state.chatUnreadCount, tooltips: state.tooltips, participantCount: participantCount, onOpenWatchTogetherFeature: onOpenWatchTogetherFeature, isWatchTogetherEnabled: isWatchTogetherEnabled, isCanManageWatchTogether: isMeCanManageWatchTogether, callControlsVisibilityController: callControlsVisibilityController, handleReactionClick: handleReactionClick, isFeedbackPanelEnabled: isFeedbackPanelEnabled(state), iconReaction: useReactionsLastChosenIcon(), refContent: refContent, onCollapseCall: handleCollapsedCall, onStopScreenShare: handleStopScreenShare, onStartFastScreenShare: handleStartFastScreenShare, onStartScreenShare: handleStartScreenShare, isSubtitlesEnabled: isSubtitlesEnabled, isInCallChatEnabled: isInCallChatEnabled, isInCallChatOpened: isInCallChatOpened, children: _jsxs(_Fragment, { children: [!isOratorViewShown && notification, !isMultiView && (_jsxs(_Fragment, { children: [_jsx(OneToOne, { isFullScreen: isFullScreen, isSubtitlesEnabled: isSubtitlesEnabled }), isFeedbackEnabled(state) && _jsx(CallReactionsP2P, {})] })), isGridViewShown && (_jsx(CallGridNew, { participnanstListLength: activeParticipantsList.length, participantsCount: activeDevicesCount, participantsShiftCount: renderedParticipantListBoundaryIndexes.start, isFullScreen: isFullScreen, isSubtitlesEnabled: isSubtitlesEnabled, containerRef: containerRef, children: _jsx(ActiveParticipantsList, { mode: "grid", participantsList: activeParticipantsList, isOratorViewShown: isOratorViewShown, startBoundaryIndex: renderedParticipantListBoundaryIndexes.start, myExternalId: myExternalId, oratorExternalId: orator.externalId, pinnedParticipant: pinnedParticipant, mediaSharingPinnedParticipant: mediaSharingPinnedParticipant, watchTogetherPinnedParticipant: watchTogetherPinnedParticipant, adminPinnedParticipant: adminPinnedParticipant, participants: state.participants, firstVisibleDevice: firstVisibleDevice, devicesVisibleCount: devicesVisibleCount, onPinParticipant: onPinParticipant, onPinParticipantForce: onPinParticipantForce }) })), isOratorViewShown && (_jsx(CallOratorWidget, { orator: orator, onStopScreenShare: handleStopScreenShare, handleShowCallControls: callControlsVisibilityController.handleShowControls, watchTogetherMovieState: watchTogetherMovieState, localExternalId: state.externalId, me: state.me, groupId: state.groupId, meGroup: state.meGroup, isPinned: isPinnedByUser, isPinnedByAdmin: isPinnedByAdmin, isPinnedByMedia: isPinnedByMedia, isUnpinAllowed: canPinParticipants(localDevice) || !isPinnedByAdmin, onUnpin: onOratorUnpin, onToggleParticipantsAside: onToggleParticipantsAside, isShownParticipantsAside: state.isShownParticipantsAside, participantsAsideCount: activeDevicesCount, firstRenderedParticipantIndex: renderedParticipantListBoundaryIndexes.start, isFullScreen: isFullScreen, isSubtitlesEnabled: isSubtitlesEnabled, onFullScreenToggle: onFullScreenToggle, isServerTopology: isServerTopology, isOratorOnly: isInCallChatEnabled && isInCallChatOpened, containerRef: containerRef, children: _jsx(ActiveParticipantsList, { mode: "orator", participantsList: activeParticipantsList, isOratorViewShown: isOratorViewShown, startBoundaryIndex: renderedParticipantListBoundaryIndexes.start, myExternalId: myExternalId, oratorExternalId: orator.externalId, pinnedParticipant: pinnedParticipant, mediaSharingPinnedParticipant: mediaSharingPinnedParticipant, watchTogetherPinnedParticipant: watchTogetherPinnedParticipant, adminPinnedParticipant: adminPinnedParticipant, participants: state.participants, firstVisibleDevice: firstVisibleDevice, devicesVisibleCount: devicesVisibleCount, onPinParticipant: onPinParticipant, onPinParticipantForce: onPinParticipantForce }) })), isMultiView && !hasParticipantsToShow && (_jsxs(_Fragment, { children: [_jsx(Stub, { children: _jsx(CallPhoto, { peerId: peerId, photo: (conversation && conversation.photo) || '', waves: true, alt: (conversation && conversation.tab) || '', className: "CallPhoto--orator", size: 200, isOrator: true }) }), isSubtitlesEnabled && _jsx(CallSubtitles, { isFullScreen: isFullScreen, isStub: true })] })), (isGridViewShown || isOratorViewShown) && isFeedbackColumnEnabled(state) && (_jsx(CallReactionsColumn, { isGridView: isGridViewShown, isShownParticipantsAside: state.isShownParticipantsAside && !(isInCallChatEnabled && isInCallChatOpened), refCall: refCall }))] }) }) }) }));
});
export const CallWidget = createWidget(CallProvider, CallView);
//# sourceMappingURL=CallWidget.js.map