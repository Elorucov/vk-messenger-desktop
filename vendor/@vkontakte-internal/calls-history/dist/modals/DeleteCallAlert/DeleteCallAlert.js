import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ModalBackdrop, ModalPortalToBody } from '@vkontakte-internal/calls-core';
import { createWidget } from '@vkontakte-internal/di';
import { useLangs } from '@vkontakte-internal/plugins';
import { Button, ModalBody, ModalBox, ModalFooter, ModalHeader } from '@vkontakte-internal/vkcom-kit';
import { DeleteCallAlertModelProvider, useDeleteCallAlertModel } from './models';
// удаление единственной записи по клику через меню записи
const DeleteCallAlertView = function DeleteCallAlertView() {
    const vm = useDeleteCallAlertModel();
    const langs = useLangs();
    let actionButtons = [];
    if (vm.deleteCall?.can_finish_call) {
        actionButtons = actionButtons.concat([
            _jsx(Button, { size: "m", onClick: vm.onFinishAndDeleteCall, mode: "secondary", appearance: "accent", children: langs.getLang('calls_history_delete_and_finish_call_button') }, "finishAndDeleteCall"),
        ]);
    }
    actionButtons = actionButtons.concat([
        _jsx(Button, { size: "m", appearance: "accent", onClick: vm.onDelete, children: langs.getLang('calls_history_delete_call_button') }, "deleteCall"),
    ]);
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: vm.onClose, children: _jsxs(ModalBox, { "aria-label": langs.getLang('calls_history_delete_modal_title'), children: [_jsx(ModalHeader, { onClose: vm.onClose, closeAriaLabel: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: langs.getLang('calls_history_delete_modal_title') }), _jsx(ModalBody, { insetLevel: 2, children: vm.text }), _jsx(ModalFooter, { actions: actionButtons })] }) }) }));
};
export const DeleteCallAlert = createWidget(DeleteCallAlertModelProvider, DeleteCallAlertView);
//# sourceMappingURL=DeleteCallAlert.js.map