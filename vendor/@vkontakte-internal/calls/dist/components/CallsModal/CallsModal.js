import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames as cx } from '@vkontakte/vkjs';
import { BaseModal } from '../../palette/BaseModal/BaseModal';
import { ModalBody, ModalFooter, ModalHeader } from '../../components/CallsModal';
import { Modal as PaletteModal } from '../../palette/Modal/Modal';
import { AppRootProvider } from '@vkontakte-internal/vkcom-kit';
import { FocusTrap } from '../FocusTrap/FocusTrap';
const Modal = (props) => {
    const { className, disableBackdropClick, disableBodyScroll, disableEscapeClose, title, footerBefore, actionButtons, onBackdropClick, onClose, children, footerHint, backText, onBack, hasScroll, description = '', isAlertDialog, dataTestId, } = props;
    const classNames = cx('CallsModal', className);
    const isModalBodyLegacy = !!(children && hasScroll);
    const needFooter = !!(actionButtons || footerHint || footerBefore);
    return (_jsx(BaseModal, { className: cx(classNames, 'vkui__root'), disableBackdropClick: disableBackdropClick, disableBodyScroll: disableBodyScroll, disableEscapeClose: disableEscapeClose, onBackdropClick: onBackdropClick, onClose: onClose, children: _jsx(AppRootProvider, { children: _jsx(FocusTrap, { hasFirstFocusableElement: true, autoFocus: true, isAlertDialog: isAlertDialog, children: _jsxs("div", { role: "dialog", "data-testid": dataTestId, "aria-label": `${title} ${description}`, "aria-modal": "true", children: [_jsx(ModalHeader, { title: title, onClose: onClose, backText: backText, onBack: onBack }), isModalBodyLegacy && (_jsx(PaletteModal.Body, { hasScroll: hasScroll, className: "CallsModalBody", children: children })), !isModalBodyLegacy && _jsx(ModalBody, { children: children }), needFooter && (_jsx(ModalFooter, { actionButtons: actionButtons, hint: footerHint, children: footerBefore }))] }) }) }) }));
};
export default Modal;
//# sourceMappingURL=CallsModal.js.map