import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUILink":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Link as VKUILink } from '@vkontakte/vkui';
import styles from './Link.module.css';
const modeModifiers = {
    default: undefined,
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    subhead: styles.subhead,
    contrast: styles.contrast,
};
export const Link = ({ mode = 'default', noUnderline, before, after, className, ...restProps }) => {
    /**
     * [VKCOMKIT-1559] определяем `mode` как `'secondary'` при `appearance === 'neutral'`
     *
     * Связано с https://github.com/VKCOM/VKUI/pull/7957
     */
    const useBackwardCompatibilityForIconInChildren = before === undefined && after === undefined;
    return (_jsx(VKUILink, { ...restProps, before: before, after: after, className: classNames(styles.link, modeModifiers[mode], className, noUnderline && styles.noUnderline, useBackwardCompatibilityForIconInChildren && styles.withIconInChildren) }));
};
//# sourceMappingURL=Link.js.map