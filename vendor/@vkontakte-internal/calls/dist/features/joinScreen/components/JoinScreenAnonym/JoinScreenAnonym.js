import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}],"Text":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { Button, Spacing, TextSeparator, Header, ModalBox, ModalHeader, ModalBody, ModalFooter, Input, FormItem, FocusTrap, Interpolate, Link, Text, getColorClass, } from '@vkontakte-internal/vkcom-kit';
import { classNames as cn } from '@vkontakte/vkjs';
import { useLang } from '../../../../hooks/useLang';
import { KeyboardCodes } from '@vkontakte-internal/calls-core';
import { CallModal } from '../../../../components/CallModal/CallModal';
import styles from './JoinScreenAnonym.module.css';
import { isLocationCallsStandalone } from '../../../../helpers/url';
const ANONYM_NAME_MAX_LENGTH = 25;
const SPACING_SIZE = 8;
export const JoinScreenAnonym = ({ title, label, onChangeName, namePlaceholder, onJoinHandler, isButtonDisabled, onCallViaNativeAppClick, callViaNativeAppTitle, name, inputDisabled, preview, joinText, loading, isValueIncorrect, withPopup, onCloseHandler, }) => {
    const { getLang } = useLang();
    const footer = (_jsxs("div", { className: styles.footer, children: [_jsx(Spacing, { size: 16 }), _jsx(Text, { className: cn(getColorClass('color_text_secondary'), styles.agreement), children: _jsx(Interpolate, { values: {
                        agreementLink: ({ children }) => (_jsx(Link, { href: "https://vk.com/terms/vkcalls_terms", children: children })),
                        policyLink: ({ children }) => _jsx(Link, { href: "https://vk.com/legal/vkcalls_privacy", children: children }),
                    }, children: getLang('calls_preview_anonym_policy') }) }), _jsx(Spacing, { size: 16 }), _jsxs("div", { className: styles.form, children: [_jsx("div", { children: _jsx(FormItem, { status: Boolean(name) && isValueIncorrect ? 'error' : 'default', noPadding: true, children: _jsx(Input, { onInput: onChangeName, placeholder: namePlaceholder, value: name, disabled: inputDisabled, maxLength: ANONYM_NAME_MAX_LENGTH, onKeyDown: (e) => {
                                    if (e.key === KeyboardCodes.Enter && !isButtonDisabled && !loading) {
                                        onJoinHandler();
                                    }
                                } }) }) }), _jsx("div", { children: _jsx(Button, { disabled: isButtonDisabled, onClick: onJoinHandler, size: "l", stretched: true, loading: loading, "data-testid": "calls_preview_join_button_anonym", children: joinText }) })] }), !isLocationCallsStandalone() && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: SPACING_SIZE }), _jsx("div", { className: styles.textSeparatorContainer, children: _jsx(TextSeparator, { children: getLang('calls_or') }) }), _jsxs(_Fragment, { children: [_jsx(Spacing, { size: SPACING_SIZE * 2 }), _jsx(Button, { onClick: onCallViaNativeAppClick, mode: "secondary", size: "l", children: callViaNativeAppTitle })] })] }))] }));
    if (withPopup) {
        return (_jsx(CallModal, { onClose: onCloseHandler, onBackdropClick: onCloseHandler, children: _jsx(FocusTrap, { autoFocus: true, children: _jsxs(ModalBox, { "data-testid": "calls_preview_modal_root_anonym", children: [_jsx(ModalHeader, { "data-testid": "calls_preview_modal_header_anonym", onClose: onCloseHandler, closeAriaLabel: getLang('calls_close'), subtitle: label, children: title }), _jsx(ModalBody, { insetLevel: 1, children: _jsx("div", { className: styles.preview, children: preview }) }), _jsx(ModalFooter, { children: footer })] }) }) }));
    }
    return (_jsxs("div", { className: styles.root, "data-testid": "calls_preview_card_root_anonym", children: [_jsx(Header, { "data-testid": "calls_preview_card_header_anonym", subtitle: label, children: title }), preview, footer] }));
};
//# sourceMappingURL=JoinScreenAnonym.js.map