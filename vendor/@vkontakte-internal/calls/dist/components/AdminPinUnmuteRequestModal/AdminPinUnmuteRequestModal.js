import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsModal } from '../../components/CallsModal';
export const AdminPinUnmuteRequestModal = ({ onClose, actionButtons, title, description, }) => {
    return (_jsx(CallsModal, { title: title, actionButtons: actionButtons, onClose: onClose, description: description, isAlertDialog: true, children: _jsx("div", { className: "AdminPinUnmuteRequestModal__content", children: description }) }));
};
//# sourceMappingURL=AdminPinUnmuteRequestModal.js.map