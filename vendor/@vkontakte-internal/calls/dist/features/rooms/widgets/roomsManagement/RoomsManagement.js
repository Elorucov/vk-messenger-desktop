import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { useSetRoomCountdown } from '../../../../hooks/useSetRoomCountdown';
import { AddRoomModal } from '../../features/addRoom/AddRoomModal';
import { RenameRoomModal } from '../../features/renameRoom/RenameRoomModal';
import { AutoDivideParticipants } from '../../features/autoDivideParticipants/AutoDivideParticipants';
import { RetryRoomsModal } from '../../features/retryRooms/RetryRoomsModal';
import { CloseRoomsModal } from '../../features/closeRooms/CloseRoomsModal';
import { SendMessageModal } from '../../features/sendMessage/SendMessageModal';
import { RoomsControl } from '../../features/roomControl/RoomsControl';
import { RoomsManagementProvider, useRoomsManagementModel } from './RoomsManagementModel';
const RoomsManagementView = observer(function RoomsManagementView() {
    const { rooms, countdownSec, setRoomsCountdown, resetRoomsTimer, autoDivideDialog, closeRoomsDialog, retryDialog, createRoomDialog, renameRoomDialog, sendMessageDialog, openAutoDivideDialog, openCloseRoomsDialog, openRetryDialog, openCreateRoomDialog, openSendMessageDialog, closeAutoDivideDialog, closeCloseRoomsDialog, closeRetryDialog, closeCreateRoomDialog, closeRenameRoomDialog, closeSendMessageDialog, renamedRoomId, renamedRoomName, closeModal, handleRenameRoom, } = useRoomsManagementModel();
    const timerController = useSetRoomCountdown({
        rooms,
        countdownSec,
        setRoomsCountdown,
        resetRoomsTimer,
    });
    return (_jsxs(_Fragment, { children: [autoDivideDialog && _jsx(AutoDivideParticipants, { onCloseDialog: closeAutoDivideDialog }), retryDialog && (_jsx(RetryRoomsModal, { onCloseDialog: closeRetryDialog, onResetTimer: () => timerController.resetTimer(true) })), closeRoomsDialog && (_jsx(CloseRoomsModal, { onCloseDialog: closeCloseRoomsDialog, onCloseRooms: closeModal })), renameRoomDialog && (_jsx(RenameRoomModal, { onCloseDialog: closeRenameRoomDialog, renamedRoomId: renamedRoomId, renamedRoomName: renamedRoomName })), createRoomDialog && _jsx(AddRoomModal, { onCloseDialog: closeCreateRoomDialog }), sendMessageDialog && _jsx(SendMessageModal, { onCloseDialog: closeSendMessageDialog }), _jsx(RoomsControl, { onCloseMainDialog: closeModal, onRoomCreate: openCreateRoomDialog, onCloseRooms: openCloseRoomsDialog, onTryAgain: openRetryDialog, onAutoDivide: openAutoDivideDialog, onShowSendMessageModal: openSendMessageDialog, onRoomRename: handleRenameRoom, timerController: timerController })] }));
});
export const RoomsManagementWidget = createWidget(RoomsManagementProvider, RoomsManagementView);
//# sourceMappingURL=RoomsManagement.js.map