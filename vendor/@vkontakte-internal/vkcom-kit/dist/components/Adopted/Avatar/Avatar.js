import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Avatar as VKUIAvatar } from '@vkontakte/vkui';
import { vkuiCssVars } from '../../../tokens/cssVars';
import { Overlay } from '../../Overlay/Overlay';
import styles from './Avatar.module.css';
const appearanceTokensMap = {
    blue: vkuiCssVars.colorAccentBlue.normal.value,
    gray: vkuiCssVars.colorAccentGray.normal.value,
    red: vkuiCssVars.colorAccentRed.normal.value,
    green: vkuiCssVars.colorAccentGreen.normal.value,
    orange: vkuiCssVars.colorAccentOrange.normal.value,
    orange_peach: vkuiCssVars.colorAccentOrangePeach.normal.value,
    orange_fire: vkuiCssVars.colorAccentOrangeFire.normal.value,
    purple: vkuiCssVars.colorAccentPurple.normal.value,
    violet: vkuiCssVars.colorAccentViolet.normal.value,
    raspberry_pink: vkuiCssVars.colorAccentRaspberryPink.normal.value,
};
const ColorPlaceholder = ({ appearance, className, style, children, ...restProps }) => {
    const color = appearanceTokensMap[appearance];
    return (_jsxs("div", { className: classNames(styles.root, className), style: { color, ...style }, ...restProps, children: [_jsx(Overlay, { className: styles.overlay, style: { background: color } }), children] }));
};
export const Avatar = Object.assign(VKUIAvatar, { ColorPlaceholder });
//# sourceMappingURL=Avatar.js.map