import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsModal } from '../../components/CallsModal';
import styles from './AssignAdminModal.module.css';
export const AssignAdminModal = ({ title, description, onClose, actionButtons }) => {
    return (_jsx(CallsModal, { title: title, actionButtons: actionButtons, onClose: onClose, description: description, children: _jsx("div", { className: styles.content, children: description }) }));
};
//# sourceMappingURL=AssignAdminModal.js.map