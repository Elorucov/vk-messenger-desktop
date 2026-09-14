import { jsx as _jsx } from "react/jsx-runtime";
import { useConfig } from '../../../../services/config';
import { CallMiniViewWidget } from '../../CallMiniViewWidget';
export const CallVideoWidget = (props) => {
    const { enableMiniViewRedesign } = useConfig();
    const controls = {};
    if (!enableMiniViewRedesign) {
        controls.controlsBottomLeft = props.controlsBottomLeft ?? ['mic-toggle'];
        controls.controlsBottomRight = props.controlsBottomRight ?? ['restore'];
    }
    else {
        controls.controlsTopRight = props.controlsTopRight ?? ['settings'];
        controls.controlsBottomLeft = props.controlsBottomLeft ?? [
            'mic-toggle',
            'cam-toggle',
            'screen-share-toggle',
        ];
        controls.controlsBottomRight = props.controlsBottomRight ?? ['restore'];
    }
    return _jsx(CallMiniViewWidget, { redesign: enableMiniViewRedesign, ...controls, ...props });
};
//# sourceMappingURL=CallVideoWidget.js.map