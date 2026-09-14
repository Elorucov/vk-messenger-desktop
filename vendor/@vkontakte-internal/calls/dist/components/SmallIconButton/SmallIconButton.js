import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { usePlatform, Platform, Tappable } from '@vkontakte-internal/vkcom-kit';
import { classNames } from '@vkontakte/vkjs';
import styles from './SmallIconButton.module.css';
/**
 * fork https://vkcom.github.io/VKUI/#/IconButton, but this smaller
 * Removed all styles for size
 * Removed styles for FormField
 * Should be used only in Calls package
 */
const SmallIconButtonComponent = ({ children, ...restProps }) => {
    const platform = usePlatform();
    return (_jsx(Tappable, { activeEffectDelay: 200, activeMode: "background", ...restProps, Component: "button", className: classNames(styles.button, platform === Platform.IOS && styles.ios), children: children }));
};
/**
 * @see https://vkcom.github.io/VKUI/#/IconButton
 */
export const SmallIconButton = SmallIconButtonComponent;
//# sourceMappingURL=SmallIconButton.js.map