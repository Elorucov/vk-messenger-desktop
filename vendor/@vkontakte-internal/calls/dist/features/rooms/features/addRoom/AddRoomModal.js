import { jsx as _jsx } from "react/jsx-runtime";
import { ROOMS_NAME_MAX_LENGTH } from '../../../../constants';
import { DialogSimpleInput } from '../../../../components/DialogSimpleInput/DialogSimpleInput';
import { useLang } from '../../../../hooks/useLang';
import { useAddRoomModel, AddRoomProvider } from './AddRoomModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
const AddRoomModalView = observer(function AddRoomModalView() {
    const { roomName, inputStatus, disableSubmit, setRoomName, handleCloseDialog, handleRoomCreate } = useAddRoomModel();
    const { getLang } = useLang();
    return (_jsx(DialogSimpleInput, { title: getLang('calls_room_control_create_room_title'), placeholder: getLang('calls_room_control_create_room_placeholder'), cancelTitle: getLang('calls_room_control_create_room_cancel'), submitTitle: getLang('calls_room_control_create_room_submit'), onClose: handleCloseDialog, onSubmit: handleRoomCreate, value: roomName, maxLength: ROOMS_NAME_MAX_LENGTH, minLength: 1, onChange: setRoomName, disableSubmit: disableSubmit, inputStatus: inputStatus }));
});
export const AddRoomModal = createWidget(AddRoomProvider, AddRoomModalView);
//# sourceMappingURL=AddRoomModal.js.map