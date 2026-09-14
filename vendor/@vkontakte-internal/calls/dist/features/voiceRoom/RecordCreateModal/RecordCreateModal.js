import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { Children } from 'react';
import { ModalBackdrop, ModalPortalToBody } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../hooks/useLang';
import { Button, ModalBody, ModalBox, ModalFooter, ModalHeader, ModalDismissButton, } from '@vkontakte-internal/vkcom-kit';
export function RecordCreateModal({ children, contentClassName, header, onClose, onSubmit, }) {
    const { getLang } = useLang();
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: onClose, children: _jsxs(ModalBox, { width: 545, children: [!!header ? (_jsx(ModalHeader, { closeAriaLabel: getLang('calls_close'), onClose: onClose, children: header })) : (
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                    _jsx(ModalDismissButton, { onClick: onClose })), _jsx(ModalBody, { insetLevel: 0, children: _jsx("div", { className: contentClassName, children: Children.map(children, (child, index) => (_jsx("div", { className: "CallManagementModal__section", children: child }, index))) }) }), _jsx(ModalFooter, { actions: [
                            _jsx(Button, { size: "m", onClick: onClose, mode: "tertiary", children: getLang('voicerooms_create_form_cancel_action') }, "cancel"),
                            _jsx(Button, { mode: "primary", size: "m", onClick: onSubmit, children: getLang('voicerooms_create_form_start_record_action') }, "submit"),
                        ] })] }) }) }));
}
//# sourceMappingURL=RecordCreateModal.js.map