import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon56PhoneOutline, Icon24LockOutline } from '@vkontakte/icons';
import { useLang } from '../../hooks/useLang';
import { Button, Input, getColorClass, FormLayoutGroup, FormItem, ModalCardBase, Spacing, ModalBox, AppRootProvider, } from '@vkontakte-internal/vkcom-kit';
import { KeyboardCodes, ModalBackdrop, ModalPortalToBody } from '@vkontakte-internal/calls-core';
export const ModalJoinCallByLink = ({ handleClose, handleContinue, handleInputJoinLink, handleInputPassword, joinLink, password, isPasswordInputActive, isLoading, }) => {
    const { getLang } = useLang();
    const isContinueDisabled = !joinLink || (!password && isPasswordInputActive);
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: handleClose, children: _jsx(AppRootProvider, { disablePortal: true, children: _jsx(ModalBox, { focusTrap: true, width: 400, children: _jsxs(ModalCardBase, { actions: _jsx(Button, { "data-testid": "calls_join_call_by_link_modal_continue_btn", stretched: true, size: "l", onClick: handleContinue, disabled: isContinueDisabled, loading: isLoading, children: getLang('calls_join_call_by_link_modal_continue') }), header: getLang('calls_join_call_by_link_modal_join_call'), onClose: handleClose, modalDismissButtonTestId: "calls_join_call_by_link_modal_dismiss_btn", icon: _jsx(Icon56PhoneOutline, { className: getColorClass('color_icon_accent') }), children: [_jsx(Spacing, { size: 16 }), _jsxs(FormLayoutGroup, { mode: "vertical", segmented: true, children: [_jsx(FormItem, { noPadding: true, htmlFor: "calls_join_call_by_link_modal_input_link", children: _jsx(Input, { id: "calls_join_call_by_link_modal_input_link", "data-testid": "calls_join_call_by_link_modal_input_link", placeholder: getLang('calls_join_call_by_link_modal_insert_link'), value: joinLink, onChange: handleInputJoinLink, onKeyDown: (e) => {
                                                if (e.key === KeyboardCodes.Enter && !isContinueDisabled && !isLoading) {
                                                    handleContinue();
                                                }
                                            } }) }), isPasswordInputActive && (_jsx(FormItem, { noPadding: true, htmlFor: "calls_join_call_by_link_modal_input_password", children: _jsx(Input, { "data-testid": "calls_join_call_by_link_modal_input_password", placeholder: getLang('calls_join_call_by_link_modal_insert_password'), before: _jsx(Icon24LockOutline, { className: getColorClass('color_icon_secondary') }), value: password, onChange: handleInputPassword, onKeyDown: (e) => {
                                                if (e.key === KeyboardCodes.Enter && !isContinueDisabled && !isLoading) {
                                                    handleContinue();
                                                }
                                            } }) }))] })] }) }) }) }) }));
};
//# sourceMappingURL=ModalJoinCallByLink.js.map