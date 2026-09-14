import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { Button, ButtonLayout, getColorClass, ModalBody, ModalBox, ModalDismissButton, ModalMedia, ModalTextLayout, } from '@vkontakte-internal/vkcom-kit';
import { useLangs } from '@vkontakte-internal/plugins';
import { Icon56DeleteOutline } from '@vkontakte/icons';
import { ModalBackdrop, ModalPortalToBody } from '@vkontakte-internal/calls-core';
import { createWidget } from '@vkontakte-internal/di';
import { useDeleteCallHistoryAlertModel, DeleteCallHistoryAlertModelProvider } from './models';
export const DeleteCallHistoryAlertView = observer(function DeleteCallHistoryAlertView() {
    const { fireDeletion, loading, onClose } = useDeleteCallHistoryAlertModel();
    const langs = useLangs();
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: onClose, children: _jsxs(ModalBox, { width: 420, children: [_jsx(ModalDismissButton, { onClick: onClose }), _jsxs(ModalBody, { insetLevel: 1, children: [_jsx(ModalMedia, { children: _jsx(Icon56DeleteOutline, { className: getColorClass('color_icon_secondary') }) }), _jsx(ModalTextLayout, { subheader: langs.getLang('calls_history_list_confirm_delete_modal_mass_description'), children: langs.getLang('calls_history_list_confirm_delete_modal_mass_header') }), _jsxs(ButtonLayout, { mode: "vertical", children: [_jsx(Button, { onClick: fireDeletion, mode: "primary", size: "m", appearance: "negative", loading: loading, children: langs.getLang('calls_history_list_confirm_delete_modal_mass_confirm') }), _jsx(Button, { onClick: onClose, size: "m", mode: "tertiary", appearance: "accent", children: langs.getLang('calls_history_list_confirm_delete_modal_cancel') })] })] })] }) }) }));
});
export const DeleteCallHistoryAlert = createWidget(DeleteCallHistoryAlertModelProvider, DeleteCallHistoryAlertView);
//# sourceMappingURL=DeleteCallHistoryAlert.js.map