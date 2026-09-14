import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Icon24VideocamOutline } from '@vkontakte/icons';
import { Icon24VideocamSlashOutlineColor } from '@vkontakte-internal/icons-private';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsLocalVideoEnabled } from '../../../selectors';
import { useToggleVideo } from '../../../hooks/useToggleVideo';
import { useLang } from '../../../hooks/useLang';
export function useCreateVideoToggleButton(isVideoAllowed) {
    const { getLang } = useLang();
    const isLocalVideoEnabled = useTypedSelector(getIsLocalVideoEnabled);
    const isLocalVideoAllowed = isVideoAllowed || isLocalVideoEnabled;
    const { handleToggleVideo, isVideoToggleProcessing } = useToggleVideo();
    return useCallback(() => {
        const icon = isLocalVideoEnabled ? _jsx(Icon24VideocamOutline, {}) : _jsx(Icon24VideocamSlashOutlineColor, {});
        return {
            dataTestId: 'calls_call_widget_button_video',
            tooltip: isLocalVideoEnabled ? getLang('calls_camera_turn_off') : getLang('calls_camera_turn_on'),
            disabled: !isLocalVideoAllowed || isVideoToggleProcessing,
            children: icon,
            onClick: handleToggleVideo,
        };
    }, [isLocalVideoEnabled, isLocalVideoAllowed, handleToggleVideo, isVideoToggleProcessing]);
}
//# sourceMappingURL=useCreateVideoToggleButton.js.map