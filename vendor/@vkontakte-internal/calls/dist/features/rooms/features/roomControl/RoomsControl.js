import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useState } from 'react';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { Icon16DropdownOutline, Icon20ArrowUturnRightOutline, Icon20DeleteOutline, Icon20WriteOutline, Icon24GearOutline, } from '@vkontakte/icons';
import { useLang } from '../../../../hooks/useLang';
import { useConfig } from '../../../../services/config';
import { getDevices, getIsEnabledRoomTimer, getParticipants } from '../../../../selectors';
import { Button, ButtonGroup, DropdownActionSheet, getColorClass } from '@vkontakte-internal/vkcom-kit';
import { useRoomControlModel, RoomControlProvider } from './RoomControlModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { RoomTimerInput, RoomStatusTimer } from '../../shared';
import { RoomsList } from './RoomsListManagement';
import { ParticipantsManagement } from './ParticipantsManagement';
import { CallsModal } from '../../../../components/CallsModal';
import styles from './RoomsControl.module.css';
const RoomControlView = observer(function RoomControlView() {
    const { rooms, roomsCount, isRoomsActivated, getCountParticipantsByRooms, searchQuery, setSearchQuery, chosenRoomId, timerWarning, timeLeft, props, handleOpenRooms, handleChangeParticipantRoom, handleRoomChoose, handleMoveToRoom, removeRoom, handleSwitchRoom, } = useRoomControlModel();
    const { onCloseMainDialog, onRoomCreate, onCloseRooms, onTryAgain, onAutoDivide, onShowSendMessageModal, onRoomRename, timerController, } = props.current;
    const { getLang } = useLang();
    const { enableRoomRedesignMoveOption } = useConfig();
    const devices = useTypedSelector(getDevices);
    const participants = useTypedSelector(getParticipants);
    const isRoomsTimerEnabled = useTypedSelector(getIsEnabledRoomTimer);
    const [roomIdOfDropdown, setRoomIdOfDropdown] = useState(null);
    // Элементы меню для залов
    const getRoomActionsMore = () => {
        const items = [];
        if (!isRoomsActivated) {
            items.push({
                text: getLang('calls_room_control_rooms_tooltip_rename'),
                before: (_jsx("span", { className: getColorClass('color_text_accent'), children: _jsx(Icon20WriteOutline, {}) })),
                handleClick: onRoomRename,
                dataTestId: 'calls_rooms_control_room_menu_rename',
            });
        }
        items.push(enableRoomRedesignMoveOption
            ? {
                text: getLang('calls_room_control_move_button'),
                before: (_jsx("span", { className: getColorClass('color_text_accent'), children: _jsx(Icon20ArrowUturnRightOutline, {}) })),
                after: (_jsx("span", { className: getColorClass('color_icon_tertiary'), children: _jsx(Icon16DropdownOutline, {}) })),
                autoCloseDisabled: true,
                dataTestId: 'calls_rooms_control_room_menu_move',
            }
            : {
                text: getLang('calls_room_control_action_remove_room'),
                before: (_jsx("span", { className: getColorClass('color_text_negative'), children: _jsx(Icon20DeleteOutline, {}) })),
                handleClick: removeRoom,
                dataTestId: 'calls_rooms_control_room_menu_remove',
            });
        Object.values(rooms).forEach((room) => {
            if (room.id !== roomIdOfDropdown && room.id !== null) {
                items.push({
                    text: room.name,
                    after: _jsx("span", { children: !!room.participantIds.length && room.participantIds.length.toString() }),
                    handleClick: () => handleMoveToRoom(roomIdOfDropdown, room.id),
                    option: true,
                });
            }
        });
        return items;
    };
    const modalTitle = isRoomsActivated && timeLeft && timerController.countdownSec ? (_jsxs("span", { children: [getLang('calls_room_control_modal_header'), ":", ' ', _jsx(RoomStatusTimer, { warning: timerWarning, timeLeft: timeLeft })] })) : (getLang('calls_room_control_modal_header'));
    const timerSettings = (_jsx("div", { className: styles.footerSettings, children: _jsx(DropdownActionSheet, { trigger: "click", placement: "top-end", offsetByMainAxis: -5, content: _jsx(RoomTimerInput, { onTimerInput: timerController.onTimerInput, currentTimer: timerController.currentTimer, isTimerEnabled: timerController.isTimerEnabled, onTimerSwitch: timerController.onTimerSwitch }), children: _jsx(Button, { size: "m", mode: "secondary", appearance: "accent", before: _jsx(Icon24GearOutline, {}), "data-testid": "calls_rooms_control_settings", children: getLang('calls_settings') }) }) }));
    const actions = (_jsxs(ButtonGroup, { children: [!isRoomsActivated && (_jsx(Button, { size: "m", onClick: onTryAgain, mode: "secondary", "data-testid": "calls_rooms_control_recreate", children: getLang('calls_room_control_button_recreate') })), isRoomsActivated ? (_jsxs(_Fragment, { children: [_jsx(Button, { size: "m", onClick: onShowSendMessageModal, mode: "secondary", "data-testid": "calls_rooms_control_send_message", children: getLang('calls_room_control_send_message') }), _jsx(Button, { size: "m", onClick: onCloseRooms, appearance: "negative", "data-testid": "calls_rooms_control_close_rooms", children: getLang('calls_room_control_open_rooms') })] })) : (_jsx(Button, { size: "m", onClick: handleOpenRooms, "data-testid": "calls_rooms_control_open_rooms", children: getLang('calls_room_control_close_rooms') }))] }));
    return (_jsx(CallsModal, { className: styles.modal, title: modalTitle, onClose: onCloseMainDialog, onBackdropClick: onCloseMainDialog, footerBefore: !isRoomsActivated && isRoomsTimerEnabled && timerSettings, actionButtons: actions, dataTestId: "calls_rooms_control", children: _jsxs("div", { className: styles.modalBody, children: [_jsx(RoomsList, { rooms: rooms, roomsCount: roomsCount, getCountParticipantsByRooms: getCountParticipantsByRooms, isRoomsActivated: isRoomsActivated, actionsMore: getRoomActionsMore(), searchQuery: searchQuery, onRoomChoose: handleRoomChoose, onChangeSearchQuery: (query) => setSearchQuery(query), onSwitchRoom: handleSwitchRoom, onRoomCreate: onRoomCreate, setRoomIdOfDropdown: setRoomIdOfDropdown }), _jsx(ParticipantsManagement, { rooms: rooms, getCountParticipantsByRooms: getCountParticipantsByRooms, isRoomsActivated: isRoomsActivated, searchQuery: searchQuery, devices: Object.values(devices), chosenRoomId: chosenRoomId, participants: participants, onChangeParticipantRoom: handleChangeParticipantRoom, onAutoDivide: onAutoDivide })] }) }));
});
export const RoomsControl = createWidget(RoomControlProvider, RoomControlView);
//# sourceMappingURL=RoomsControl.js.map