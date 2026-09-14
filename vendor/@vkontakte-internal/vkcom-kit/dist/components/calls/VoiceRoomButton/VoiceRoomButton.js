import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"IconButton":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { IconButton, TextTooltip } from '../../Adopted';
import { RoundedGroup } from '../../RoundedGroup/RoundedGroup';
import styles from './VoiceRoomButton.module.css';
const TOOLTIP_DELAY = 300;
export const VoiceRoomButton = ({ children, tooltip, className, disabled, getRootRef, tooltipPlacement = 'top', tooltipOffsetSkidding, badge, mode, appearance, ...restProps }) => {
    const stringTooltip = typeof tooltip === 'string' ? tooltip : '';
    const iconButton = (_jsxs("div", { className: styles.buttonContainer, children: [_jsx(RoundedGroup.Item, { mode: mode, appearance: appearance, className: classNames(disabled && styles.disabled), children: _jsx(IconButton, { label: restProps['aria-label'] || stringTooltip, className: className, getRootRef: getRootRef, disabled: disabled, ...restProps, children: children }) }), !!badge && _jsx("div", { className: styles.badge, children: badge })] }));
    if (!tooltip) {
        return iconButton;
    }
    return (_jsx(TextTooltip, { text: tooltip, hoverDelay: TOOLTIP_DELAY, placement: tooltipPlacement, offsetByCrossAxis: tooltipOffsetSkidding, enableInteractive: true, children: iconButton }));
};
//# sourceMappingURL=VoiceRoomButton.js.map