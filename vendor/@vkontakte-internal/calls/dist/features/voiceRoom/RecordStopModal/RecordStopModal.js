import { jsx as _jsx } from "react/jsx-runtime";
import { ModalBackdrop, ModalPortalToBody } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../hooks/useLang';
import { ModalCardBase, ButtonGroup } from '@vkontakte-internal/vkcom-kit';
export function RecordStopModal({ actions, onClose }) {
    const { getLang } = useLang();
    const actionsLayout = actions ? (_jsx(ButtonGroup, { align: "center", stretched: true, children: actions })) : undefined;
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: onClose, children: _jsx(ModalCardBase, { actions: actionsLayout, header: getLang('voicerooms_stop_record_form_header'), onClose: onClose, subheader: getLang('voicerooms_stop_record_form_subheader') }) }) }));
}
//# sourceMappingURL=RecordStopModal.js.map