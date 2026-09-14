import { jsx as _jsx } from "react/jsx-runtime";
import { CallsModal } from '../../components/CallsModal';
import { ErrorPopupText } from '../ErrorPopupText/ErrorPopupText';
export const CallError = ({ title, onClose, actionButtons, text }) => {
    return (_jsx(CallsModal, { title: title, onClose: onClose, actionButtons: actionButtons, className: "CallError", children: _jsx(ErrorPopupText, { children: text }) }));
};
//# sourceMappingURL=CallError.js.map