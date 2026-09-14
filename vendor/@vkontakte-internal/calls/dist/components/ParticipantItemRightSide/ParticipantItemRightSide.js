import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Div":["@vkontakte-internal/vkcom-kit",{"className":1}],"IconButton":["@vkontakte-internal/vkcom-kit",{"baseClassName":2}]} */
import { Icon16CamSlash, Icon16MicrophoneSlash, Icon16Microphone, Icon16Videocam, Icon16MoreHorizontal, } from '@vkontakte/icons';
import { ButtonGroup, Div, getColorClass, IconButton, IconMicrophoneIndicator, TextTooltip, } from '@vkontakte-internal/vkcom-kit';
import CallingStatus from '../CallingStatus/CallingStatus';
import { useLang } from '../../hooks/useLang';
import { LocalMicrophoneIndicator } from '../LocalMicrophoneIndicator';
import { ParticipantItemIndicators } from './ParticipantItemIndicators';
import { ParticipantMenuWidget } from '../ParticipantMenu';
import styles from './ParticipantItemRightSide.module.css';
export function ParticipantItemRightSide({ device, hasLiveTranslation, isCameraDisabled, isCameraPermanentDisabled, isConnecting, isHandRaised, isHandRaisedTooltipEnabled, isLiveTranslationStarted, isMe, isMicrophoneDisabled, isMicrophonePermanentDisabled, isPinned, isScreenShared, isSpeaking, onClickHandRaised, onMuteCamera, onMuteMicrophone, }) {
    const { getLang } = useLang();
    const cameraText = isCameraPermanentDisabled
        ? getLang('calls_participant_management_permanent_mute_camera_hint')
        : onMuteCamera
            ? getLang('calls_participant_management_mute_camera')
            : undefined;
    const microphoneText = isMicrophonePermanentDisabled
        ? getLang('calls_participant_management_permanent_mute_microphone_hint')
        : onMuteMicrophone
            ? getLang('calls_participant_management_mute_microphone')
            : undefined;
    if (isConnecting) {
        return _jsx(CallingStatus, {});
    }
    const MenuButton = ({ hasActions, ...rest }) => (_jsx(IconButton, { "data-testid": `calls_participant_item_right_side_menu_${device.externalId?.id}`, disabled: !hasActions, label: getLang('calls_actions'), size: 28, ...rest, children: hasActions && _jsx(Icon16MoreHorizontal, { className: getColorClass('color_icon_secondary') }) }));
    return (_jsxs(Div, { className: styles.wrapper, children: [_jsx(ParticipantItemIndicators, { device: device, hasLiveTranslation: hasLiveTranslation, isHandRaised: isHandRaised, isHandRaisedTooltipEnabled: isHandRaisedTooltipEnabled, isLiveTranslationStarted: isLiveTranslationStarted, isPinned: isPinned, isScreenShared: isScreenShared, onClickHandRaised: onClickHandRaised }), _jsxs(ButtonGroup, { "data-testid": "calls_participant_list_item_indicator", gap: "s", children: [_jsx(TextTooltip, { placement: "top", text: cameraText, children: _jsx(IconButton, { baseClassName: !onMuteCamera ? styles.inactiveButton : undefined, "data-testid": `calls_participant_item_right_side_mute_camera_${device.externalId?.id}`, hasActive: !!onMuteCamera, hasHover: !!onMuteCamera, label: cameraText || ' ', onClick: onMuteCamera, size: 28, children: isCameraDisabled ? (_jsx(Icon16CamSlash, { className: getColorClass(`color_icon_${isCameraPermanentDisabled ? 'negative' : 'secondary'}`) })) : (_jsx(Icon16Videocam, { className: getColorClass('color_icon_secondary') })) }) }), _jsx(TextTooltip, { placement: "top", text: microphoneText, children: _jsx(IconButton, { baseClassName: !onMuteMicrophone ? styles.inactiveButton : undefined, "data-testid": `calls_participant_item_right_side_mute_microphone_${device.externalId?.id}`, hasActive: !!onMuteMicrophone, hasHover: !!onMuteMicrophone, label: microphoneText || ' ', onClick: onMuteMicrophone, size: 28, children: isMicrophoneDisabled ? (_jsx(Icon16MicrophoneSlash, { className: getColorClass(`color_icon_${isMicrophonePermanentDisabled ? 'negative' : 'secondary'}`) })) : isMe ? (_jsx(LocalMicrophoneIndicator, { color: "color_icon_secondary", Icon: Icon16Microphone })) : (_jsx(IconMicrophoneIndicator, { activated: isSpeaking, Icon: Icon16Microphone })) }) }), _jsx(ParticipantMenuWidget, { buttonComponent: MenuButton, externalId: device.externalId, trigger: "click" })] })] }));
}
//# sourceMappingURL=ParticipantItemRightSide.js.map