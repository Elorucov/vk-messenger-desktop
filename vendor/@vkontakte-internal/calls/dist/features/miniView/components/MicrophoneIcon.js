import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24MicrophoneSlash, Icon24Voice, Icon24VoiceOutline } from '@vkontakte/icons';
import { Icon24MicrophoneSlashOutlineColor } from '@vkontakte-internal/icons-private';
import { LocalMicrophoneIndicator } from '../../../components/LocalMicrophoneIndicator';
export function MicrophoneIcon({ isAudioEnabled, isMiniApp, redesign }) {
    const ComponentIconVoice = redesign && !isMiniApp ? Icon24VoiceOutline : Icon24Voice;
    const ComponentIconVoiceSlash = redesign && !isMiniApp ? Icon24MicrophoneSlashOutlineColor : Icon24MicrophoneSlash;
    return isAudioEnabled ? (_jsx(LocalMicrophoneIndicator, { Icon: ComponentIconVoice })) : (_jsx(ComponentIconVoiceSlash, {}));
}
//# sourceMappingURL=MicrophoneIcon.js.map