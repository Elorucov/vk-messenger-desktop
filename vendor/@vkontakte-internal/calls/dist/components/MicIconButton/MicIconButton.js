import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24MicrophoneSlashColor } from '@vkontakte/icons';
import { CallsIconButton } from '../CallsIconButton';
import { useLang } from '../../hooks/useLang';
import { LocalMicrophoneIndicator } from '../LocalMicrophoneIndicator';
import { getMediaTestIdSuffix } from '../../helpers/helpers';
export const MicIconButton = ({ isAudioAllowed, isAudioEnabled, MicrophoneIndicator = LocalMicrophoneIndicator, onToggleAudio, }) => {
    const { getLang } = useLang();
    const icon = isAudioEnabled ? _jsx(MicrophoneIndicator, {}) : _jsx(Icon24MicrophoneSlashColor, {});
    const notAllowedHint = getLang('calls_admin_permanent_mute_audio');
    const textTooltip = isAudioEnabled ? getLang('calls_mic_turn_off') : getLang('calls_mic_turn_on');
    return (_jsx(CallsIconButton, { isMainButton: true, "data-testid": `calls_call_footer_button_microphone${getMediaTestIdSuffix(isAudioEnabled, isAudioAllowed)}`, active: !isAudioEnabled, disabled: !isAudioAllowed, tooltip: isAudioAllowed ? textTooltip : notAllowedHint, onClick: onToggleAudio, children: icon }));
};
//# sourceMappingURL=MicIconButton.js.map