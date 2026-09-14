import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"ul":["global",{"className":1}],"li":["global",{"className":1}],"Items":["global",{"className":1}]} */
import { cloneElement } from 'react';
import { AppearanceProvider, Popover } from '@vkontakte-internal/vkcom-kit';
import { DropdownItem, Separator } from './CallsDropdownItem';
import { classNames as cn } from '@vkontakte/vkjs';
const Items = ({ items, className, setOpen }) => {
    return (_jsx("ul", { className: cn('CallsDropdown', className), children: items.map((item, i, arr) => (_jsx("li", { className: "CallsDropdown__item", children: 'separator' in item ? (_jsx(Separator, { isListEdge: !i || arr.length - 1 === i })) : (_jsx(DropdownItem, { item: item, setOpen: setOpen })) }, item.key || i))) }));
};
export const CallsDropdown = ({ children, items, open = false, setOpen, placement, className, content, customMiddlewares, appearance = 'light', }) => {
    return (_jsx(AppearanceProvider, { value: appearance, children: _jsx(Popover, { placement: placement, onShownChange: setOpen, content: content || (items && _jsx(Items, { items: items, className: className, setOpen: setOpen })), shown: open, customMiddlewares: customMiddlewares, usePortal: false, children: cloneElement(children, {
                ...children.props,
                'data-active': open,
            }) }) }));
};
//# sourceMappingURL=CallsDropdown.js.map