import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const DialogConfirmClose = ({ description, onClose, onSubmit }) => {
    const { getLang } = useLang();
    return (_jsx(CallsModal, { className: "CallsDialogConfirmClose", title: getLang('calls_confirm'), onClose: onClose, description: description, dataTestId: "calls_confirmation_close_modal_root", actionButtons: _jsxs(_Fragment, { children: [_jsx(Button, { "data-testid": "calls_confirmation_close_button_cancel", size: "m", onClick: onClose, mode: "tertiary", children: getLang('calls_cancel') }), _jsx(Button, { "data-testid": "calls_confirmation_close_button_exit", size: "m", mode: "primary", onClick: onSubmit, children: getLang('calls_exit') })] }), children: _jsx("div", { "data-testid": "calls_confirmation_close_desc", children: description }) }));
};
//# sourceMappingURL=DialogConfirmClose.js.map