import { jsx as _jsx } from "react/jsx-runtime";
import { CallsModal } from '../../../components/CallsModal';
export const AsrModal = ({ children, title, actionButtons, onClose }) => {
    return (_jsx(CallsModal, { className: "CallsAsrModal", onClose: onClose, title: title, hasScroll: false, actionButtons: actionButtons, children: children }));
};
//# sourceMappingURL=AsrModal.js.map