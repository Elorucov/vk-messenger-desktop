import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@vkontakte-internal/vkcom-kit';
import { CallsModal } from '../../components/CallsModal';
export const DialogConfirm = ({ title, description, submitAppearance, cancelTitle, submitTitle, cancelDataTestId = '', submitDataTestId = '', onClose, onSubmit, }) => {
    return (_jsx(CallsModal, { className: "CallsDialogConfirm", title: title, onClose: onClose, actionButtons: _jsxs(_Fragment, { children: [_jsx(Button, { size: "m", onClick: onClose, mode: "tertiary", "data-testid": cancelDataTestId, children: cancelTitle }), _jsx(Button, { size: "m", onClick: onSubmit, appearance: submitAppearance, "data-testid": submitDataTestId, children: submitTitle })] }), children: description }));
};
//# sourceMappingURL=DialogConfirm.js.map