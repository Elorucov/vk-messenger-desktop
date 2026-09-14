import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon28ChevronRightOutline } from '@vkontakte/icons';
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
const ListItem = ({ icon, aside, chevron = false, selectable = true, border = true, className, children, active, canBeHovered = true, ...nativeProps }) => {
    const modifiers = {
        'ListItem--chevron': chevron,
        'ListItem--selectable': selectable,
        'ListItem--border': border,
        'ListItem--active': active,
        'ListItem--can-be-hovered': canBeHovered,
    };
    return (_jsxs("li", { ...nativeProps, className: cx('ListItem', modifiers, className), children: [icon && _jsx("div", { className: "ListItem__icon", children: icon }), _jsx("div", { className: "ListItem__main", children: children }), aside && _jsx("div", { className: "ListItem__aside", children: aside }), chevron && (_jsx(Icon28ChevronRightOutline, { className: getColorClass('color_icon_tertiary'), width: 26, height: 26 }))] }));
};
export default ListItem;
//# sourceMappingURL=ListItem.js.map