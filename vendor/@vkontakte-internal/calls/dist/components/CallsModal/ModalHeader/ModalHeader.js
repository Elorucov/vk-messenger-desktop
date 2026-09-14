import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon24Cancel, Icon28ChevronLeftOutline } from '@vkontakte/icons';
import { useLang } from '../../../hooks/useLang';
export const ModalHeader = ({ className, title, onClose, backText, onBack, }) => {
    const classNames = cx('CallsModalHeader', className);
    const { getLang } = useLang();
    return (_jsxs("div", { className: classNames, "data-testid": "calls_modal_header", children: [backText && (_jsxs("button", { className: "CallsModalHeader__back", "data-testid": "calls_modal_header_back_button", type: "button", onClick: onBack, children: [_jsx(Icon28ChevronLeftOutline, { className: "CallsModalHeader__backIcon" }), backText] })), _jsx("h1", { className: "CallsModalHeader__title", "data-testid": "calls_modal_header_title", children: title }), _jsxs("button", { className: "CallsModalHeader__cross", type: "button", "data-testid": "calls_modal_header_close_button", onClick: onClose, "aria-label": getLang('calls_close'), children: [_jsx(Icon24Cancel, { width: 22, height: 22 }), getLang('calls_close')] })] }));
};
//# sourceMappingURL=ModalHeader.js.map