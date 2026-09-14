import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon24Cancel } from '@vkontakte/icons';
export const ModalHeader = ({ className, title, onClose, backText, onBack, }) => {
    const classNames = cx('ModalHeader', className);
    return (_jsxs("div", { className: classNames, children: [backText && (_jsx("button", { className: "ModalHeader__back", onClick: onBack, children: backText })), _jsx("h1", { className: "ModalHeader__title", children: title }), _jsxs("button", { className: "ModalHeader__cross", type: "button", onClick: onClose, children: [_jsx(Icon24Cancel, { width: 22, height: 22 }), "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"] })] }));
};
//# sourceMappingURL=ModalHeader.js.map