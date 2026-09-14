import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Tappable } from '../../../Adopted';
import styles from './VideoCardOwnerItem.module.css';
export const VideoCardOwnerItem = ({ owner, disabled, withComma, onClick, }) => {
    return (_jsxs(_Fragment, { children: [_jsx(Tappable, { href: owner.href, onClick: onClick, activeMode: "opacity", hoverMode: "opacity", disabled: disabled, Component: owner.href ? 'a' : 'span', className: classNames(styles.link, withComma && styles.linkWithComma), children: owner.name }), !!owner.badge && _jsx("div", { className: styles.badgeWrapper, children: owner.badge })] }));
};
//# sourceMappingURL=VideoCardOwnerItem.js.map