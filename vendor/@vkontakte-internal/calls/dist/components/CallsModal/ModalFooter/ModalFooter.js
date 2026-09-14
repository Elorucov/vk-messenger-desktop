import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
export const ModalFooter = ({ className, actionButtons, hint, children }) => {
    return (_jsx("div", { className: classNames('CallsModalFooter', 'vkui__root', className), children: _jsxs("div", { className: "CallsModalFooter__inner", children: [!!hint && (_jsx("div", { className: "CallsModalFooter__hint", role: "presentation", children: hint })), !!children && _jsx("div", { className: "CallsModalFooter__content", children: children }), actionButtons] }) }));
};
//# sourceMappingURL=ModalFooter.js.map