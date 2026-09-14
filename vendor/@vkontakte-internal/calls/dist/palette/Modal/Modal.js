import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { BaseModal } from '../BaseModal/BaseModal';
import { ModalHeader } from './ModalHeader/ModalHeader';
import { ModalBody } from './ModalBody/ModalBody';
import { ModalFooter } from './ModalFooter/ModalFooter';
export const Modal = (props) => {
    const { className: classNamePassed, appearance = 'white', title, actionButtons, onClose, children, footerHint, hasScroll = false, backText, onBack, } = props;
    const className = classNames('Modal', `Modal--${appearance}`, classNamePassed);
    return (_jsxs(BaseModal, { ...props, className: className, children: [_jsx(ModalHeader, { title: title, onClose: onClose, backText: backText, onBack: onBack }), Boolean(children) && _jsx(ModalBody, { hasScroll: hasScroll, children: children }), _jsx(ModalFooter, { actionButtons: actionButtons, hint: footerHint })] }));
};
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
//# sourceMappingURL=Modal.js.map