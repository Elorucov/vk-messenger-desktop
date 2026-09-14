import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Subhead":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Link, Spacing, Subhead } from '../../Adopted';
import { Overlay } from '../../Overlay/Overlay';
import styles from './VideoCardOverlay.module.css';
const alignModifiers = {
    left: styles.containerLeft,
    center: styles.containerCenter,
};
const textColorModifiers = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
};
export const VideoCardOverlay = ({ text, actionProps, textAlign = 'center', textColor = 'primary', textWeight = '2', hasBackground, }) => {
    return (_jsxs(Overlay, { className: classNames(styles.container, alignModifiers[textAlign], hasBackground && styles.containerOverlayDark), children: [_jsx(Subhead, { weight: textWeight, className: textColorModifiers[textColor], children: text }), _jsx(Spacing, { size: 8 }), !!actionProps?.children && _jsx(Link, { ...actionProps })] }));
};
//# sourceMappingURL=VideoCardOverlay.js.map