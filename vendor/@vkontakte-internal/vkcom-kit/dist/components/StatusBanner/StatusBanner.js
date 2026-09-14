import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Subhead":["Adopted",{"className":1}]} */
import { Icon24CheckCircleOutline, Icon24ErrorCircleOutline, Icon24InfoCircleOutline, Icon24WarningTriangleOutline, } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Headline, Subhead } from '../Adopted';
import { Overlay } from '../Overlay/Overlay';
import styles from './StatusBanner.module.css';
const modeModifierMap = {
    default: undefined,
    transparent: styles.rootModeTransparent,
    negative: styles.rootModeNegative,
    warning: styles.rootModeWarning,
    positive: styles.rootModePositive,
};
export const StatusBanner = ({ header, text, before, after, mode = 'default', actions, progress, className, ...restProps }) => {
    if (before === undefined) {
        switch (mode) {
            case 'negative':
                before = _jsx(Icon24ErrorCircleOutline, {});
                break;
            case 'warning':
                before = _jsx(Icon24WarningTriangleOutline, {});
                break;
            case 'positive':
                before = _jsx(Icon24CheckCircleOutline, {});
                break;
            default:
                before = _jsx(Icon24InfoCircleOutline, {});
                break;
        }
    }
    return (_jsxs("div", { className: classNames(styles.root, modeModifierMap[mode], className), ...restProps, children: [progress !== undefined && _jsx(Overlay, { className: styles.progress, style: { width: `${progress}%` } }), before && _jsx("div", { className: styles.before, children: before }), _jsxs("div", { children: [_jsx(Headline, { Component: "div", weight: "2", children: header }), !!text && _jsx(Subhead, { className: styles.text, children: text }), !!actions && _jsx("div", { className: styles.actions, children: actions })] }), after && _jsx("div", { className: styles.after, children: after })] }));
};
//# sourceMappingURL=StatusBanner.js.map