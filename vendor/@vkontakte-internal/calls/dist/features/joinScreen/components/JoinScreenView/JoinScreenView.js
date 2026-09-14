import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":4}]} */
import { Button, Header, ModalBody, ModalBox, ModalFooter, ModalHeader, useAdaptivityMediaQueries, ButtonGroup, EllipsisText, FocusTrap, } from '@vkontakte-internal/vkcom-kit';
import { classNames } from '@vkontakte/vkjs';
import { modalFooterButtonStretchedMediaQueryHeight, modalFooterButtonStretchedMediaQueryWidth, } from '../JoinScreenPreview/constants';
import styles from './JoinScreenView.module.css';
import { useLang } from '../../../../hooks/useLang';
import { CallModal } from '../../../../components/CallModal/CallModal';
export const JoinScreenView = ({ onCallViaNativeAppClick, callViaNativeAppTitle, hideCallViaNativeApp, onJoinHandler, joinText, preview, loading, withPopup, label, title, onCloseHandler, hideJoinScreenPromptCheckbox, skipJoinCallPromptCheckbox, mediaLoading, }) => {
    const { getLang } = useLang();
    const stretchButtons = useAdaptivityMediaQueries({
        [modalFooterButtonStretchedMediaQueryWidth]: true,
        [modalFooterButtonStretchedMediaQueryHeight]: true,
    }, false);
    const footer = (
    // для чебокса можно было бы сделать скелетон, но его нет, так как для авторизованных пользователей данные по skip флагу
    // успевают подгружаться до отображения превью звонка
    _jsxs("div", { className: classNames(styles.footer, hideJoinScreenPromptCheckbox && styles.footerNoCheckbox), children: [!hideJoinScreenPromptCheckbox && skipJoinCallPromptCheckbox, _jsxs(ButtonGroup, { stretched: withPopup && stretchButtons, children: [!hideCallViaNativeApp && (_jsx(Button, { onClick: onCallViaNativeAppClick, mode: "secondary", size: "l", loading: loading, stretched: withPopup && stretchButtons, children: callViaNativeAppTitle })), _jsx(Button, { onClick: onJoinHandler, size: "l", loading: loading, disabled: mediaLoading, "data-testid": "calls_preview_join_button", stretched: withPopup && stretchButtons, children: joinText })] })] }));
    if (withPopup) {
        return (_jsx(CallModal, { onClose: onCloseHandler, onBackdropClick: onCloseHandler, children: _jsx(FocusTrap, { autoFocus: true, children: _jsxs(ModalBox, { "data-testid": "calls_preview_modal_root", stretched: true, children: [_jsx(ModalHeader, { "data-testid": "calls_preview_modal_header", onClose: onCloseHandler, closeAriaLabel: getLang('calls_close'), subtitle: label, children: _jsx(EllipsisText, { maxWidth: 620, children: title }) }), _jsx(ModalBody, { insetLevel: 1, children: preview }), _jsx(ModalFooter, { children: _jsx("div", { className: styles.modalFooter, children: footer }) })] }) }) }));
    }
    return (_jsxs("div", { className: styles.root, "data-testid": "calls_preview_card_root", children: [_jsx(Header, { "data-testid": "calls_preview_card_header", subtitle: label, children: title }), preview, _jsx("div", { className: styles.footerContainer, children: footer })] }));
};
//# sourceMappingURL=JoinScreenView.js.map