import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, ModalBody, ModalBox, ModalFooter, ModalHeader } from '@vkontakte-internal/vkcom-kit';
import { ModalBackdrop, ModalPortalToBody } from '@vkontakte-internal/calls-core';
import { useLang } from '../../hooks/useLang';
export const InfoModal = ({ onClose, bodyText, acceptText, titleText }) => {
    const { getLang } = useLang();
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: onClose, children: _jsxs(ModalBox, { children: [_jsx(ModalHeader, { closeAriaLabel: getLang('calls_close'), onClose: onClose, children: titleText }), _jsx(ModalBody, { insetLevel: 2, children: bodyText }), _jsx(ModalFooter, { actions: _jsx(Button, { size: "m", onClick: onClose, children: acceptText }) })] }) }) }));
};
//# sourceMappingURL=InfoModal.js.map