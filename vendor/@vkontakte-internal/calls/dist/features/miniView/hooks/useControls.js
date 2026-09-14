import { useCreateMicToggleButton } from './useCreateMicToggleButton';
import { useCreateVideoToggleButton } from './useCreateVideoToggleButton';
import { useCreateRestoreButton } from './useCreateRestoreButton';
import { useCreateScreenShareToggleButton } from './useCreateScreenShareToggleButton';
import { useCreateSettingsButton } from './useCreateSettingsButton';
export function useControls({ controls, redesign, isAudioAllowed, isScreenSharingAllowed, isVideoAllowed, }) {
    function controlIsButtonProps(control) {
        return typeof control === 'object';
    }
    const createMicToggleButton = useCreateMicToggleButton(redesign, isAudioAllowed);
    const createCamToggleButton = useCreateVideoToggleButton(isVideoAllowed);
    const createRestoreButton = useCreateRestoreButton();
    const createScreenShareToggleButton = useCreateScreenShareToggleButton(isScreenSharingAllowed);
    const createSettingsButton = useCreateSettingsButton();
    function processControls(controls, firstTooltipPlacement, nextTooltipPlacement) {
        const buttons = [];
        for (const control of controls) {
            const placement = buttons.length ? nextTooltipPlacement : firstTooltipPlacement;
            const focusAttrs = buttons.length ? {} : { dataFocusFirst: true };
            if (controlIsButtonProps(control)) {
                buttons.push({ ...control, ...focusAttrs, placement });
            }
            else {
                let button;
                switch (control) {
                    case 'cam-toggle':
                        button = createCamToggleButton();
                        break;
                    case 'mic-toggle':
                        button = createMicToggleButton();
                        break;
                    case 'restore':
                        button = createRestoreButton();
                        break;
                    case 'screen-share-toggle':
                        button = createScreenShareToggleButton();
                        break;
                    case 'settings':
                        button = createSettingsButton();
                        break;
                }
                if (button) {
                    buttons.push({ ...button, ...focusAttrs, placement });
                }
            }
        }
        if (!buttons.length) {
            return;
        }
        return buttons;
    }
    return {
        topLeft: !!controls.controlsTopLeft
            ? processControls(controls.controlsTopLeft, 'bottom-start', 'bottom')
            : undefined,
        topRight: !!controls.controlsTopRight
            ? processControls(controls.controlsTopRight, 'bottom-end', 'bottom')
            : undefined,
        bottomLeft: !!controls.controlsBottomLeft
            ? processControls(controls.controlsBottomLeft, 'top-start', 'top')
            : undefined,
        bottomRight: !!controls.controlsBottomRight
            ? processControls(controls.controlsBottomRight, 'top-end', 'top')
            : undefined,
    };
}
//# sourceMappingURL=useControls.js.map