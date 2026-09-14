import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"section":["global",{"className":1}],"div":["global",{"className":9}],"footer":["global",{"className":1}]} */
import { forwardRef, useCallback, useEffect, useRef, } from 'react';
import { ChatIconButton } from '../ChatIconButton/ChatIconButton';
import { classNames as cx } from '@vkontakte/vkjs';
import { CallsAppId, participantIsAdmin, KeyboardCodes, } from '@vkontakte-internal/calls-core';
import { Icon243SquareOutline, Icon24DoorArrowRightOutline, Icon24Fullscreen, Icon24FullscreenExit, Icon24Live, Icon24PictureInPictureSquareFilled, Icon24Privacy, Icon24Square4Outline, Icon24Videocam, Icon24VideocamSlashColor, Icon28CancelOutline, } from '@vkontakte/icons';
import { ParticipantIconButton } from '../ParticipantIconButton/ParticipantIconButton';
import { MicIconButton } from '../MicIconButton/MicIconButton';
import { Icon24LogoVkVideo } from '@vkontakte-internal/icons-private';
import { CallScreenShareButton } from '../CallScreenShareButton/CallScreenShareButton';
import { CallReactionsButton } from '../CallReactionsButton/CallReactionsButton';
import { useReactionsController } from '../CallReactions/hooks/useReactionsController';
import { AppearanceProvider, AppRootProvider, Group, Appearance, SizeType, } from '@vkontakte-internal/vkcom-kit';
import { CallSettingsDropdown } from '../../features/callSettings';
import { useTooltipChangeHandler } from '../../hooks/useTooltipChangeHandler';
import { isParticipantContact } from '../../helpers/participant';
import { MiniAppWhiteboardButtonWidget } from '../../features/miniApps';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useLang } from '../../hooks/useLang';
import { CallsIconButton } from '../CallsIconButton';
import { getIsChatAttachedToCall, getMyDevice, getPeerId } from '../../selectors';
import { useConfig } from '../../services/config';
import { InCallChatContainer } from '../../features/inCallChat';
import { NotificationsWidget } from '../../features/notifications';
import { IndependentMicrophoneIndicator } from '../IndependentMicrophoneIndicator';
import { getMediaTestIdSuffix } from '../../helpers/helpers';
import { useVideoButtonHint } from './useVideoButtonHint';
export const Call = forwardRef((props, ref) => {
    const { info, chatUnreadCount = 0, isAudioAllowed = false, isVideoAllowed = false, isVideoEnabled = false, isAudioEnabled = false, isScreenSharingEnabled = false, isMovieStreamEnabled = false, isOratorMode = true, isFullScreen = false, onToggleVideo, onToggleAudio, onLeaveCall, onToggleOratorMode, onChat, onInCallChatClick, onHandClick, onFullScreenToggle, onDeferredStreamStart, isLayoutSwitchShown = false, isScreenShareControlActive = false, isHandRaised = false, isStreamingControlShown = false, onParticipantsClick, tooltips, isWaitingHall = false, participantCount = 0, children, onOpenWatchTogetherFeature, callControlsVisibilityController, handleReactionClick, isFeedbackPanelEnabled, iconReaction, isWatchTogetherEnabled, isCanManageWatchTogether, onCollapseCall, isInRoom = false, onLeaveRoom, onStopScreenShare, onStartScreenShare, onStartFastScreenShare, isSubtitlesEnabled = false, isInCallChatEnabled, isInCallChatOpened, refContent, watchTogetherHint = '', } = props;
    const { getLang } = useLang();
    const config = useConfig();
    const peerId = useTypedSelector(getPeerId);
    const localDevice = useTypedSelector(getMyDevice);
    const isChatControlShown = useTypedSelector(createIsChatAvailableSelector(config.enableAddingContactsToChats));
    /**
     * Показывать ли кнопку перехода на интерактивную доску
     * В Сферуме кнопка есть всегда для учителя
     */
    const isWhiteboardAvailable = (config.sferum || config.enableMiniAppSharing) && participantIsAdmin(localDevice);
    /** Открыто ли приложение на vkcom */
    const isAppWeb = config.appId === CallsAppId.WEB;
    const classNames = cx('Call', {
        'Call--fullscreen': isFullScreen,
        'Call--withChat': isInCallChatEnabled && isInCallChatOpened,
    });
    const classNamesContentWrapper = 'Call__contentWrapper';
    const classNamesContent = cx('Call__content', {
        'Call__content--waitingHall': isWaitingHall,
    });
    const classNamesChat = 'Call__chat';
    const leftButtonsGroupClasses = cx('Call__controlPanelButtonsGroup', 'Call__controlPanelButtonsGroup--left');
    const rightButtonsGroupClasses = cx({
        Call__controlPanelButtonsGroup: true,
        ['Call__controlPanelButtonsGroup--right']: true,
        ['Call__controlPanelButtonsGroup--rightFullScreen--web']: isFullScreen && isAppWeb,
    });
    const bottomPanelElRef = useRef(null);
    const onTooltipChange = useTooltipChangeHandler();
    const reactionsCtx = useReactionsController({
        onTooltipChange,
        onReaction: handleReactionClick,
        onHand: onHandClick,
    });
    const isShowControls = typeof callControlsVisibilityController?.isShowControls === 'boolean'
        ? callControlsVisibilityController.isShowControls
        : true;
    const videoButtonHint = useVideoButtonHint(isVideoEnabled, isVideoAllowed);
    const handleKeyPress = useCallback((event) => {
        // Комбинация клавиш Ctrl+M переключает микрофон
        if (event.code === KeyboardCodes.KeyM && event.ctrlKey) {
            onToggleAudio?.();
        }
    }, [isAudioEnabled, onToggleAudio]);
    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);
    const isWatchTogetherActive = isMovieStreamEnabled && isCanManageWatchTogether;
    return (_jsx(AppRootProvider, { sizeY: SizeType.REGULAR, children: _jsxs("section", { ref: ref, className: classNames, "data-testid": "calls_call_main_modal_root", onMouseOver: callControlsVisibilityController?.handleMouseOver, onMouseLeave: callControlsVisibilityController?.handleMouseLeave, onMouseMove: callControlsVisibilityController?.handleMouseMove, children: [info, _jsxs("div", { className: classNamesContentWrapper, children: [_jsx("div", { className: classNamesContent, ref: refContent, children: children }), _jsx("div", { className: classNamesChat, children: _jsx(InCallChatContainer, { chatId: peerId }) })] }), _jsx("footer", { className: "Call__footer", ref: bottomPanelElRef, children: isShowControls && (_jsxs(_Fragment, { children: [_jsx("div", { className: "Call__footerGroup", children: _jsx(AppearanceProvider, { value: Appearance.DARK, children: _jsx(Group, { mode: "plain", separator: "hide", children: _jsxs("div", { className: leftButtonsGroupClasses, children: [isChatControlShown && !isInCallChatEnabled && (_jsx(ChatIconButton, { "data-testid": "calls_call_footer_button_chat", unreadCount: chatUnreadCount, onClick: onChat })), !isWaitingHall && (_jsx(CallScreenShareButton, { isScreenSharingEnabled: isScreenSharingEnabled, onStopScreenShare: onStopScreenShare, onStartScreenShare: onStartScreenShare, onStartFastScreenShare: onStartFastScreenShare, isScreenShareControlActive: isScreenShareControlActive })), isWatchTogetherEnabled && (_jsx(CallsIconButton, { tooltip: watchTogetherHint, "data-testid": `calls_call_footer_button_watch_together${getMediaTestIdSuffix(isWatchTogetherActive, isCanManageWatchTogether)}`, onClick: onOpenWatchTogetherFeature, active: isWatchTogetherActive, disabled: !isCanManageWatchTogether, children: _jsx(Icon24LogoVkVideo, {}) })), isWhiteboardAvailable && _jsx(MiniAppWhiteboardButtonWidget, {}), isStreamingControlShown && (_jsx(CallsIconButton, { tooltip: getLang('calls_call_menu_translation'), "data-testid": "calls_call_footer_button_translation", onClick: onDeferredStreamStart, active: isStreamingControlShown, children: _jsx(Icon24Live, {}) }))] }) }) }) }), _jsx("div", { className: "Call__footerGroup", children: _jsx(AppearanceProvider, { value: Appearance.LIGHT, children: _jsx(Group, { mode: "plain", separator: "hide", children: _jsxs("div", { className: "Call__buttons", children: [!isFeedbackPanelEnabled && !isWaitingHall && (_jsx(CallsIconButton, { isMainButton: true, "data-testid": "calls_call_footer_button_raise_hand", active: isHandRaised, tooltip: isHandRaised
                                                        ? getLang('calls_tooltip_lower_hand')
                                                        : getLang('calls_tooltip_raise_hand'), onClick: onHandClick, children: _jsx(Icon24Privacy, {}) })), !!isFeedbackPanelEnabled && !isWaitingHall && (_jsx(CallReactionsButton, { onReaction: reactionsCtx.onReactionClick, onHand: reactionsCtx.onHandClick, onTooltipChange: reactionsCtx.onTooltipChange, tooltips: tooltips, isHand: isHandRaised, ariaLabel: getLang('calls_reactions_and_hand_raising'), tooltipTitle: isHandRaised
                                                        ? getLang('calls_tooltip_lower_hand')
                                                        : getLang('calls_tooltip_raise_hand'), iconReaction: iconReaction, isLeftPlacement: isMovieStreamEnabled || isSubtitlesEnabled })), _jsx(CallsIconButton, { isMainButton: true, active: !isVideoEnabled, disabled: !isVideoAllowed, "data-testid": `calls_call_footer_button_camera${getMediaTestIdSuffix(isVideoEnabled, isVideoAllowed)}`, tooltip: videoButtonHint, onClick: onToggleVideo, children: isVideoEnabled ? _jsx(Icon24Videocam, {}) : _jsx(Icon24VideocamSlashColor, {}) }), !!onToggleAudio && (_jsx(MicIconButton, { isAudioAllowed: isAudioAllowed, isAudioEnabled: isAudioEnabled, MicrophoneIndicator: isWaitingHall ? IndependentMicrophoneIndicator : undefined, onToggleAudio: onToggleAudio })), !isInRoom && (_jsx(CallsIconButton, { isMainButton: true, mode: "negative", tooltip: getLang('calls_exit'), "data-testid": "calls_call_footer_button_leave_call", onClick: onLeaveCall, children: _jsx(Icon28CancelOutline, {}) })), isInRoom && (_jsx(CallsIconButton, { isMainButton: true, mode: "negative", tooltip: getLang('calls_leave_room'), "data-testid": "calls_call_footer_button_leave_room", onClick: onLeaveRoom, children: _jsx(Icon24DoorArrowRightOutline, {}) }))] }) }) }) }), _jsx("div", { className: "Call__footerGroup", children: _jsx(AppearanceProvider, { value: Appearance.DARK, children: _jsx(Group, { mode: "plain", separator: "hide", children: _jsxs("div", { className: rightButtonsGroupClasses, children: [isInCallChatEnabled && (_jsx(ChatIconButton, { "data-testid": "calls_call_footer_button_chat", unreadCount: chatUnreadCount, active: isInCallChatOpened, onClick: onInCallChatClick })), onParticipantsClick && (_jsx(ParticipantIconButton, { ariaLabel: getLang('calls_participants'), onClick: onParticipantsClick, participantCount: participantCount })), isLayoutSwitchShown && (_jsx(CallsIconButton, { tooltip: isOratorMode ? getLang('calls_show_grid') : getLang('calls_show_orator'), "data-testid": "calls_call_footer_button_layout", onClick: onToggleOratorMode, children: isOratorMode ? _jsx(Icon24Square4Outline, {}) : _jsx(Icon243SquareOutline, {}) })), _jsx(CallSettingsDropdown, {}), onCollapseCall && (_jsx(CallsIconButton, { tooltip: getLang('calls_collapse'), "data-testid": "calls_call_footer_button_collapse", onClick: onCollapseCall, children: _jsx(Icon24PictureInPictureSquareFilled, {}) })), onFullScreenToggle && (_jsx(CallsIconButton, { placement: "top-end", tooltip: isFullScreen
                                                        ? getLang('calls_tooltip_fullscreen_off')
                                                        : getLang('calls_tooltip_fullscreen_on'), ariaLabel: isFullScreen
                                                        ? getLang('calls_tooltip_fullscreen_off')
                                                        : getLang('calls_fullscreen_mode'), "data-testid": "calls_call_footer_button_fullscreen", onClick: onFullScreenToggle, children: isFullScreen ? _jsx(Icon24FullscreenExit, {}) : _jsx(Icon24Fullscreen, {}) }))] }) }) }) })] })) }), _jsx(NotificationsWidget, {})] }) }));
});
function createIsChatAvailableSelector(enableAddingContactsToChats = false) {
    return (state) => getIsChatAttachedToCall(state) && (!isParticipantContact(state.me) || enableAddingContactsToChats);
}
Call.displayName = 'Call';
//# sourceMappingURL=Call.js.map