import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsModal } from '../../components/CallsModal';
export const CallExitModal = ({ onClose, actionButtons, description, title }) => {
    return (_jsx(CallsModal, { onClose: onClose, title: title, actionButtons: actionButtons, className: "CallExitModal", description: description, dataTestId: "calls_exit_call_modal_root", children: _jsx("div", { className: "CallExitModal__content", "data-testid": "calls_exit_call_desc", children: description }) }));
};
//# sourceMappingURL=CallExitModal.js.map