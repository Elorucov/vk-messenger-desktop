import { jsx as _jsx } from "react/jsx-runtime";
import { TextTooltip } from '../../../../../Adopted';
import styles from './VideoCardIconControl.module.css';
export const TOOLTIP_LEFT_OFFSET = 24;
export const VideoCardIconControl = ({ icon: ActionComponent, tooltipText, onClick, offsetByMainAxis = 8, ...restProps }) => {
    if (!tooltipText) {
        return _jsx(ActionComponent, { onClick: onClick, className: styles.controlIcon, ...restProps });
    }
    return (_jsx(TextTooltip, { text: tooltipText, offsetByMainAxis: offsetByMainAxis, offsetByCrossAxis: TOOLTIP_LEFT_OFFSET, appearance: "black", placement: "bottom-end", enableInteractive: true, children: _jsx(ActionComponent, { onClick: onClick, className: styles.controlIcon, ...restProps }) }));
};
//# sourceMappingURL=VideoCardIconControl.js.map