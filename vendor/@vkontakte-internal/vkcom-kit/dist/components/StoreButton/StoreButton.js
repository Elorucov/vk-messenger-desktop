import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":2}]} */
import { Icon20QrCodeOutline, Icon24Qr } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '../Adopted';
import styles from './StoreButton.module.css';
const sizeModifiersMap = {
    m: styles.rootSizeMedium,
    l: styles.rootSizeLarge,
};
const appearanceModifiersMap = {
    secondary: undefined,
    overlay: styles.rootAppearanceOverlay,
};
export const StoreButton = ({ children, showQR, className, onClick, size = 'm', appearance = 'secondary', onQRClick, qrLabel, stretched, ...restProps }) => {
    return (_jsxs("div", { className: classNames(styles.root, sizeModifiersMap[size], appearanceModifiersMap[appearance], stretched && styles.rootStretch, className), children: [_jsx(Tappable, { Component: restProps.href ? 'a' : 'button', onClick: onClick, className: styles.button, ...restProps, children: children }), showQR && (_jsx(Tappable, { className: styles.code, Component: "button", onClick: onQRClick, "aria-label": qrLabel, children: size === 'l' ? _jsx(Icon24Qr, {}) : _jsx(Icon20QrCodeOutline, {}) }))] }));
};
//# sourceMappingURL=StoreButton.js.map