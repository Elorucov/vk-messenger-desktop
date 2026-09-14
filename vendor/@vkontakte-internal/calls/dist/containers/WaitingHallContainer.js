import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { E_ACTION, HANGUP_TYPE_REMOVED } from '../constants';
import { CallsEventType, NotificationType, UIMode, getUserName, peerIdToVkId, useNavigationContext, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { Call } from '../components/Call/Call';
import { CallModal } from '../components/CallModal/CallModal';
import { checkPermissions } from '../permissions';
import { getSingleLetter } from '../helpers/participant';
import { pause } from '@vkontakte-internal/vkjs/lib/PromiseUtils';
import { WaitingHall } from '../components/WaitingHall/WaitingHall';
import { MediaOption } from '@vkontakte/calls-sdk';
import { WaitingHallInfo } from '../components/WaitingHallInfo/WaitingHallInfo';
import { useCallNotifications } from '../hooks/useCallNotifications';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { useLang } from '../hooks/useLang';
import { FocusTrapWrapper } from '../components/FocusTrapWrapper/FocusTrapWrapper';
export function WaitingHallContainer() {
    const { navigateToConvo } = useNavigationContext();
    const SDK = useCallsSDK();
    const bridge = useCallsBridge();
    const state = useSelector((state) => state);
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const mySettings = state.localDevice.mediaSettings;
    const isFullScreen = state.uiMode === UIMode.FULLSCREEN;
    const [isAudioToggleProcessing, setIsAudioToggleProcessing] = useState(false);
    const [isVideoToggleProcessing, setIsVideoToggleProcessing] = useState(false);
    const changeUIMode = (mode) => dispatch({ type: E_ACTION.CHANGE_UI_MODE, mode });
    /**
     * В случае перехода из fullscreen в collapse - делаем это асинхронно,
     * чтобы viewport успел обновиться.
     */
    const onCollapseCall = useCallback(() => {
        if (state.uiMode === UIMode.FULLSCREEN) {
            pause(0.3, null).then(() => {
                changeUIMode(UIMode.COLLAPSED);
            });
            changeUIMode(UIMode.DEFAULT);
        }
        else {
            changeUIMode(UIMode.COLLAPSED);
        }
        bridge.eventBus.emit(CallsEventType.LAYOUT_COLLAPSED);
    }, [state.uiMode]);
    const onToggleAudio = useCallback(() => {
        if (isAudioToggleProcessing) {
            return;
        }
        const isTurningOn = !mySettings.isAudioEnabled;
        const permissionPromise = isTurningOn ? checkPermissions(SDK, [MediaOption.AUDIO]) : Promise.resolve();
        permissionPromise.then(() => {
            setIsAudioToggleProcessing(true);
            if (state.notification?.type === NotificationType.SPEAKING_ON_MUTE) {
                dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: null,
                });
            }
            SDK.toggleLocalAudio(isTurningOn).finally(() => {
                setIsAudioToggleProcessing(false);
            });
        });
    }, [mySettings, isAudioToggleProcessing]);
    const onToggleVideo = useCallback(() => {
        if (isVideoToggleProcessing) {
            return;
        }
        const isTurningOn = !mySettings.isVideoEnabled;
        const permissionPromise = isTurningOn ? checkPermissions(SDK, [MediaOption.VIDEO]) : Promise.resolve();
        permissionPromise.then(() => {
            setIsVideoToggleProcessing(true);
            SDK.toggleLocalVideo(isTurningOn).finally(() => {
                setIsVideoToggleProcessing(false);
            });
        });
    }, [mySettings, isVideoToggleProcessing]);
    const onChatClick = useCallback(() => {
        onCollapseCall();
        navigateToConvo(peerIdToVkId(state.peer));
    }, [state.peer, state.uiMode]);
    const leaveCall = useCallback(() => {
        SDK.hangup();
    }, []);
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
    useEffect(() => {
        return () => {
            dispatch({
                type: E_ACTION.SET_TOOLTIP,
                tooltips: null,
            });
        };
    }, []);
    const notifications = useCallNotifications();
    const infoMessage = state.hangupType === HANGUP_TYPE_REMOVED
        ? getLang('calls_waiting_hall_removed')
        : getLang('calls_waiting_hall_info');
    return (_jsx(CallModal, { onClose: leaveCall, onBackdropClick: onCollapseCall, children: _jsx(FocusTrapWrapper, { label: infoMessage, children: _jsx(Call, { info: null, isVideoAllowed: true, isAudioAllowed: true, isVideoEnabled: !!mySettings.isVideoEnabled, isAudioEnabled: !!mySettings.isAudioEnabled, isFullScreen: isFullScreen, onToggleAudio: onToggleAudio, onToggleVideo: onToggleVideo, onLeaveCall: leaveCall, onFullScreenToggle: onFullScreenToggle, onChat: onChatClick, chatUnreadCount: state.chatUnreadCount, tooltips: state.tooltips, isWaitingHall: true, onCollapseCall: onCollapseCall, children: _jsxs(_Fragment, { children: [!!mySettings.isVideoEnabled && state.externalId && (_jsx(WaitingHall, { name: "", letter: getSingleLetter(getUserName(state.participants[state.me])), externalId: state.externalId })), _jsx(WaitingHallInfo, { text: infoMessage }), notifications] }) }) }) }));
}
//# sourceMappingURL=WaitingHallContainer.js.map