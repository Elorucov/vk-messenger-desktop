import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const UploadBackgroundErrorModal = ({ children, onClose, onSubmit }) => {
    const { getLang } = useLang();
    return (_jsx(CallsModal, { onClose: onClose, title: getLang('calls_warning'), className: "UploadBackgroundErrorModal", actionButtons: _jsxs(_Fragment, { children: [_jsx(Button, { onClick: onClose, mode: "tertiary", size: "m", children: getLang('calls_cancel') }), _jsx(Button, { size: "m", mode: "primary", onClick: onSubmit, children: getLang('calls_retry_action') })] }), children: _jsx("div", { className: "UploadBackgroundErrorModal__content", children: children }) }));
};
//# sourceMappingURL=UploadBackgroundErrorModal.js.map