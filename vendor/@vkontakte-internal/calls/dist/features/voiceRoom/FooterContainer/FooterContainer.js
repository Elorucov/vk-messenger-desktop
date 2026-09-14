import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { Icon24Videocam, Icon24Privacy, Icon24CancelOutline, Icon24Like, Icon24VideocamSlashColor, Icon24MicrophoneSlashColor,
// Icon24Fullscreen,
 } from '@vkontakte/icons';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useToggleAudio, useRequestPromotion, useToggleVideo, useReactionClick } from '../hooks';
import { getMyMediaSettings, getTooltips } from '../../../selectors';
import { getVoiceRoomIsAudioMode, getIsMeListener } from '../selectors';
import { VoiceRoomMenuWidget } from '../VoiceRoomMenuWidget';
import { CallReactionsButton } from '../../../components/CallReactionsButton/CallReactionsButton';
import { LocalMicrophoneIndicator } from '../../../components/LocalMicrophoneIndicator';
import { useTooltipChangeHandler } from '../../../hooks/useTooltipChangeHandler';
import { useReactionsController } from '../../../components/CallReactions/hooks/useReactionsController';
import { useReactionsLastChosenIcon } from '../../../components/CallReactions/hooks/useReactionsLastChosenIcon';
import { VoiceRoomButton, ButtonGroup } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useModel, Provider } from './FooterModel';
const FooterView = observer(function FooterView() {
    const { activeDevicesCount, leaveCall } = useModel();
    const { getLang } = useLang();
    const isAudioMode = useTypedSelector(getVoiceRoomIsAudioMode);
    const tooltips = useTypedSelector(getTooltips);
    const isMeListener = useTypedSelector(getIsMeListener);
    const { isVideoEnabled, isAudioEnabled } = useTypedSelector(getMyMediaSettings);
    const micIcon = isAudioEnabled ? _jsx(LocalMicrophoneIndicator, {}) : _jsx(Icon24MicrophoneSlashColor, {});
    const requestPromotion = useRequestPromotion();
    const toggleAudio = useToggleAudio();
    const toggleVideo = useToggleVideo();
    const handleReactionClick = useReactionClick();
    const lastReactionIcon = useReactionsLastChosenIcon();
    const onTooltipChange = useTooltipChangeHandler();
    const reactionsCtx = useReactionsController({
        onTooltipChange,
        onReaction: handleReactionClick,
    });
    // todo Раскоментить код когда будет доделан фуллскрин
    // const toggleFullScreen = useToggleFullScreen();
    return (_jsxs("div", { className: "CallsVoiceRoomCall__FooterContainer", children: [_jsx(ButtonGroup, { mode: "horizontal", gap: "m", children: _jsx(VoiceRoomMenuWidget, {}) }), _jsxs(ButtonGroup, { mode: "horizontal", gap: "m", align: "center", children: [!isAudioMode && !isMeListener && (_jsx(VoiceRoomButton, { tooltip: isVideoEnabled ? getLang('calls_camera_turn_off') : getLang('calls_camera_turn_on'), mode: isVideoEnabled ? 'secondary' : 'contrast', onClick: toggleVideo, children: isVideoEnabled ? _jsx(Icon24Videocam, {}) : _jsx(Icon24VideocamSlashColor, {}) })), !isMeListener && (_jsx(VoiceRoomButton, { tooltip: isAudioEnabled ? getLang('calls_mic_turn_off') : getLang('calls_mic_turn_on'), mode: isAudioEnabled ? 'secondary' : 'contrast', onClick: toggleAudio, children: micIcon })), isMeListener && (_jsx(VoiceRoomButton, { tooltip: !activeDevicesCount
                            ? getLang('voicerooms_request_promotion_button_hint_disabled')
                            : requestPromotion.isHandUp
                                ? getLang('voicerooms_request_promotion_button_hint_active')
                                : getLang('voicerooms_request_promotion_button_hint'), mode: requestPromotion.isHandUp ? 'contrast' : 'secondary', onClick: requestPromotion.toggle, disabled: !activeDevicesCount, children: _jsx(Icon24Privacy, {}) })), _jsx(CallReactionsButton, { onTooltipChange: reactionsCtx.onTooltipChange, onReaction: reactionsCtx.onReactionClick, tooltips: tooltips, iconReaction: lastReactionIcon, disabled: isMeListener && !activeDevicesCount, iconButton: _jsx(Icon24Like, {}), className: "VoiceRoom__reactionsButton", customRenderButton: (children) => (_jsx(VoiceRoomButton, { mode: "secondary", disabled: isMeListener && !activeDevicesCount, tooltip: isMeListener && !activeDevicesCount
                                ? getLang('voicerooms_reactions_button_hint_disabled')
                                : '', children: children })) })] }), _jsx(ButtonGroup, { mode: "horizontal", gap: "m", children: _jsx(VoiceRoomButton, { tooltip: getLang('calls_leave_room'), mode: "negative", onClick: leaveCall, children: _jsx(Icon24CancelOutline, {}) }) })] }));
});
export const FooterWidget = createWidget(Provider, FooterView);
//# sourceMappingURL=FooterContainer.js.map