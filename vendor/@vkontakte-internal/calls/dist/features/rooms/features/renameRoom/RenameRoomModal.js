import { jsx as _jsx } from "react/jsx-runtime";
import { ROOMS_NAME_MAX_LENGTH } from '../../../../constants';
import { DialogSimpleInput } from '../../../../components/DialogSimpleInput/DialogSimpleInput';
import { useLang } from '../../../../hooks/useLang';
import { useRenameRoomModel, RenameRoomProvider } from './RenameRoomModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
const RenameModalView = observer(function RenameModalView() {
    const { roomName, setRoomName, handleRoomRename, inputStatus, disableSubmit, onCloseDialog } = useRenameRoomModel();
    const { getLang } = useLang();
    return (_jsx(DialogSimpleInput, { title: getLang('calls_room_control_rename_title'), placeholder: getLang('calls_room_control_rename_placeholder'), cancelTitle: getLang('calls_room_control_rename_cancel'), submitTitle: getLang('calls_room_control_rename_submit'), maxLength: ROOMS_NAME_MAX_LENGTH, minLength: 1, onChange: setRoomName, disableSubmit: disableSubmit, inputStatus: inputStatus, value: roomName, onClose: onCloseDialog, onSubmit: handleRoomRename }));
});
export const RenameRoomModal = createWidget(RenameRoomProvider, RenameModalView);
//# sourceMappingURL=RenameRoomModal.js.map