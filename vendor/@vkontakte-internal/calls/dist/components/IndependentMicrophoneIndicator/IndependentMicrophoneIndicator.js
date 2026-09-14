import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24Voice } from '@vkontakte/icons';
import { IconMicrophoneIndicator } from '@vkontakte-internal/vkcom-kit';
import { useAudioOutput } from '../../hooks/useAudioOutput';
import { useBrowserMedia } from '../../features/joinScreen/hooks/useBrowserMedia';
export function IndependentMicrophoneIndicator({ color = 'color_icon_contrast', Icon = Icon24Voice, ...restProps }) {
    const { browserMedia: { isMicAvailable }, currentMicId, } = useBrowserMedia();
    const { volumeLevel } = useAudioOutput({ deviceId: currentMicId, isActive: isMicAvailable });
    return (_jsx(IconMicrophoneIndicator, { ...restProps, activated: volumeLevel > 10, color: color, Icon: Icon, level: volumeLevel }));
}
//# sourceMappingURL=IndependentMicrophoneIndicator.js.map