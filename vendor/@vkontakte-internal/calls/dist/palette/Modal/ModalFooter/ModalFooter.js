import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
export const ModalFooter = ({ className, actionButtons, hint, children }) => {
    return (_jsx("div", { className: classNames('ModalFooter', className), children: _jsxs("div", { className: "ModalFooter__inner", children: [!!hint && (_jsx("div", { className: "ModalFooter__hint", role: "presentation", children: hint })), !!children && _jsx("div", { className: "ModalFooter__content", children: children }), actionButtons] }) }));
};
//# sourceMappingURL=ModalFooter.js.map