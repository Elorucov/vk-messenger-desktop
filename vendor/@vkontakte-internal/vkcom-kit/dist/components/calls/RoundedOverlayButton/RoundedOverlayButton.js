import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Button } from '../../Adopted';
import { DropdownActionSheet, } from '../../DropdownActionSheet/DropdownActionSheet';
import styles from './RoundedOverlayButton.module.css';
export const RoundedOverlayButton = ({ disabled, rightControl, leftControl, onLeftControlClick, onRightControlClick, rightControlDropdownProps, rightControlAriaLabel, leftControlAriaLabel, ...restProps }) => {
    return (_jsxs("div", { className: classNames(styles.root, disabled && styles.nonAccessible), ...restProps, children: [_jsx("div", { className: classNames(styles.icon, styles.iconMain), children: _jsx(Button, { onClick: onLeftControlClick, before: leftControl, "aria-label": leftControlAriaLabel, size: "m", mode: "tertiary", appearance: "accent" }) }), _jsx("div", { className: styles.icon, children: rightControlDropdownProps ? (_jsx(DropdownActionSheet, { ...rightControlDropdownProps, children: _jsx(Button, { onClick: onRightControlClick, mode: "tertiary", before: rightControl, size: "m", appearance: "accent", "aria-label": rightControlDropdownProps['ariaLabel'], "data-testid": rightControlDropdownProps['data-testid'] }) })) : (_jsx(Button, { onClick: onRightControlClick, mode: "tertiary", before: rightControl, "aria-label": rightControlAriaLabel, size: "m", appearance: "accent" })) })] }));
};
//# sourceMappingURL=RoundedOverlayButton.js.map