import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsModal } from '../../components/CallsModal';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const OnHangupModal = ({ onClose, title, description, btnText }) => {
    return (_jsx(CallsModal, { className: "OnHangupModal", onClose: onClose, title: title, description: description, 
        // кнопка "закрыть"
        actionButtons: _jsx(Button, { "data-testid": "calls_hangup_modal_button", mode: "primary", size: "m", onClick: onClose, children: btnText }), children: _jsx("div", { className: "OnHangupModal__description", children: description }) }));
};
//# sourceMappingURL=OnHangupModal.js.map