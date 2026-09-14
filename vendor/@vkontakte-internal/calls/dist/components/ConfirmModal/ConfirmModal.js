import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, ModalBody, ModalBox, ModalFooter, ModalHeader } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import { ModalBackdrop, ModalPortalToBody } from '@vkontakte-internal/calls-core';
export const ConfirmModal = ({ onClose, onSubmit, bodyText, acceptText, modalTitle, }) => {
    const { getLang } = useLang();
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: onClose, children: _jsxs(ModalBox, { children: [_jsx(ModalHeader, { closeAriaLabel: getLang('calls_close'), onClose: onClose, children: modalTitle }), _jsx(ModalBody, { insetLevel: 2, children: bodyText }), _jsx(ModalFooter, { actions: _jsxs(_Fragment, { children: [_jsx(Button, { mode: "tertiary", size: "m", onClick: onClose, children: getLang('calls_cancel') }), _jsx(Button, { size: "m", onClick: onSubmit, children: acceptText })] }) })] }) }) }));
};
//# sourceMappingURL=ConfirmModal.js.map