import { jsx as _jsx } from "react/jsx-runtime";
import { DialogConfirm } from '../../../../components/DialogConfirm/DialogConfirm';
import { useLang } from '../../../../hooks/useLang';
import { useAutoDivideParticipantsModel, AutoDivideParticipantsProvider, } from './AutoDivideParticipantsModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { InnerHTML } from '@vkontakte-internal/vkcom-kit';
const AutoDivideParticipantsView = observer(function AutoDivideParticipantsView() {
    const { devicesToDivideInMainRoom, onCloseDialog, handleAutoDivide } = useAutoDivideParticipantsModel();
    const { getLang } = useLang();
    return (_jsx(DialogConfirm, { title: `${getLang('calls_room_control_auto_divide_title')} (${devicesToDivideInMainRoom.listDeviceToDivideExternalIds.length})`, description: _jsx(InnerHTML, { children: getLang('calls_room_control_auto_divide_desc') }), cancelTitle: getLang('calls_room_control_retry_cancel'), submitTitle: getLang('calls_room_control_auto_divide_submit'), onClose: onCloseDialog, onSubmit: handleAutoDivide }));
});
export const AutoDivideParticipants = createWidget(AutoDivideParticipantsProvider, AutoDivideParticipantsView);
//# sourceMappingURL=AutoDivideParticipants.js.map