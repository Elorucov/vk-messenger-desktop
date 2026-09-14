import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useMemo } from 'react';
import { browser } from '@vkontakte/calls-sdk';
import { Icon24ArrowUpRectangle, Icon24ArrowUpRectangleOutline } from '@vkontakte/icons';
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsScreenSharingEnabled } from '../../../selectors';
import { useScreenShare } from '../../../hooks/useScreenShare';
import { useLang } from '../../../hooks/useLang';
export function useCreateScreenShareToggleButton(isScreenSharingAllowed) {
    const { getLang } = useLang();
    const isScreenSharingEnabled = useTypedSelector(getIsScreenSharingEnabled);
    const isScreenSharingSupported = useMemo(() => browser.isScreenCapturingSupported(), []);
    const { handleStopScreenShare, handleStartScreenShare } = useScreenShare();
    return useCallback(() => {
        const icon = isScreenSharingEnabled ? (_jsx(Icon24ArrowUpRectangle, { className: getColorClass('color_icon_positive') })) : (_jsx(Icon24ArrowUpRectangleOutline, {}));
        return {
            dataTestId: 'calls_call_widget_button_screen_share',
            disabled: !isScreenSharingAllowed || !isScreenSharingSupported,
            tooltip: isScreenSharingEnabled
                ? getLang('calls_stop_screen_share')
                : getLang('calls_start_screen_share'),
            children: icon,
            onClick: isScreenSharingEnabled ? handleStopScreenShare : handleStartScreenShare,
        };
    }, [
        isScreenSharingAllowed,
        isScreenSharingSupported,
        isScreenSharingEnabled,
        handleStopScreenShare,
        handleStartScreenShare,
    ]);
}
//# sourceMappingURL=useCreateScreenShareToggleButton.js.map