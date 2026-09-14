import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Footnote":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Footnote } from '../../Adopted';
import styles from './RoundedGroupItem.module.css';
const modeModifiersMap = {
    border: styles.rootBorder,
    shadow: styles.rootShadow,
    overlay: styles.rootOverlay,
    avatarOverlay: styles.rootAvatarOverlay,
    negative: styles.rootModeNegative,
    accent: styles.rootAccent,
    transparent: undefined,
    contrast: styles.rootContrast,
    secondary: styles.rootSecondary,
    outline: styles.rootOutline,
};
const wrapperModeModifiersMap = {
    border: undefined,
    shadow: undefined,
    overlay: undefined,
    avatarOverlay: undefined,
    negative: undefined,
    accent: undefined,
    transparent: styles.wrapperTransparent,
    contrast: undefined,
    secondary: undefined,
    outline: undefined,
};
const appearanceModifiersMap = {
    negative: styles.rootNegative,
    default: undefined,
};
const wrapperAppearanceModifiersMap = {
    negative: styles.rootNegative,
    default: undefined,
};
export const RoundedGroupItem = ({ mode = 'shadow', appearance = 'default', spacing = 0, bottom, stretched, getRootRef, children, className, }) => {
    const style = {
        '--rounded-spacing': `${spacing}px`,
    };
    const item = (_jsx("div", { ref: getRootRef, className: classNames(styles.root, modeModifiersMap[mode], appearanceModifiersMap[appearance], stretched && styles.rootStretched, className), style: style, children: children }));
    if (!bottom) {
        return item;
    }
    return (_jsxs("div", { "data-testid": "roundedgroupitem", className: classNames(styles.wrapper, wrapperModeModifiersMap[mode], wrapperAppearanceModifiersMap[appearance]), children: [item, _jsx(Footnote, { "data-testid": "roundedgroupitem-bottom", className: styles.bottom, weight: "1", children: bottom })] }));
};
//# sourceMappingURL=RoundedGroupItem.js.map