import { jsx as _jsx } from "react/jsx-runtime";
import { classNames as cx } from '@vkontakte/vkjs';
export const ListMore = ({ children, className, ...restProps }) => {
    return (_jsx("button", { className: cx('ListMore', className), ...restProps, children: children }));
};
//# sourceMappingURL=ListMore.js.map