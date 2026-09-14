import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIBanner":["@vkontakte/vkui",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Banner as VKUIBanner } from '@vkontakte/vkui';
import styles from './Banner.module.css';
export const Banner = ({ header, subheader, text, asideMode, title, subtitle, extraSubtitle, after, noPadding, stretched, mode, className, ...restProps }) => {
    const isTransparent = mode === 'transparent';
    return (_jsx(VKUIBanner, { subtitle: subheader || subtitle, extraSubtitle: text || extraSubtitle, title: header || title, after: asideMode || after, mode: isTransparent ? 'tint' : mode, ...restProps, className: classNames(!noPadding && styles.rootPadding, stretched && styles.rootStretched, isTransparent && styles.rootTransparent, className) }));
};
//# sourceMappingURL=Banner.js.map