import { jsx as _jsx } from "react/jsx-runtime";
import { InnerHTML } from '@vkontakte-internal/vkcom-kit';
import { DialogConfirm } from '../../../../components/DialogConfirm/DialogConfirm';
import { useLang } from '../../../../hooks/useLang';
import { useCloseRoomsModel, CloseRoomsProvider } from './CloseRoomsModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
const CloseRoomsModalView = observer(function CloseRoomsModalView() {
    const { onCloseDialog, handleCloseRooms } = useCloseRoomsModel();
    const { getLang } = useLang();
    return (_jsx(DialogConfirm, { title: getLang('calls_room_control_close_title'), description: _jsx(InnerHTML, { children: getLang('calls_room_control_close_desc') }), cancelTitle: getLang('calls_room_control_retry_cancel'), cancelDataTestId: "calls_rooms_close_cancel", submitDataTestId: "calls_rooms_close_submit", submitTitle: getLang('calls_room_control_cancel_submit'), submitAppearance: "negative", onClose: onCloseDialog, onSubmit: handleCloseRooms }));
});
export const CloseRoomsModal = createWidget(CloseRoomsProvider, CloseRoomsModalView);
//# sourceMappingURL=CloseRoomsModal.js.map