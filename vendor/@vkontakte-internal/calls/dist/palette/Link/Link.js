import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"a":["global",{"className":1}],"span":["global",{"className":1}]} */
import { classNames as cx } from '@vkontakte/vkjs';
const Link = ({ onClick, hovered, className, children, href, ...nativeProps }) => {
    const classnames = cx('Link', !!hovered && 'Link--hovered', className);
    return href ? (
    // TODO: Поменять a на Link
    // eslint-disable-next-line react/forbid-elements
    _jsx("a", { onClick: onClick, href: href, ...nativeProps, className: classnames, children: children })) : (_jsx("span", { onClick: onClick, ...nativeProps, className: classnames, children: children }));
};
export default Link;
//# sourceMappingURL=Link.js.map