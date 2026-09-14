import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AppRootProvider, Button, Search } from '@vkontakte-internal/vkcom-kit';
import { ROOM_MAIN_ID } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../../../../hooks/useLang';
import { ROOMS_MAX_COUNT } from '../../../../../../constants';
import { objectMap } from '../../../../../../helpers/helpers';
import { RoomsListItem } from '../RoomsListItem/RoomsListItem';
import styles from './RoomsList.module.css';
export const RoomsList = ({ rooms, isRoomsActivated, searchQuery, onChangeSearchQuery, onRoomCreate, setRoomIdOfDropdown, roomsCount, getCountParticipantsByRooms, ...restProps }) => {
    const { getLang } = useLang();
    const isAddRoomDisabled = roomsCount >= ROOMS_MAX_COUNT;
    const isListShown = !!searchQuery;
    return (_jsx(AppRootProvider, { children: _jsxs("div", { className: styles.root, children: [_jsx("div", { className: styles.searchWrapper, children: _jsx(Search, { "data-testid": "calls_rooms_control_search", placeholder: getLang('calls_room_control_input_search_placeholder'), value: searchQuery, onChange: (e) => onChangeSearchQuery(e.target.value) }) }), !isRoomsActivated && (_jsx("div", { className: styles.roomCreate, children: _jsx(Button, { size: "m", disabled: isAddRoomDisabled, mode: "tertiary", onClick: onRoomCreate, "data-testid": "calls_rooms_control_add_room", children: getLang('calls_room_control_add_room') }) })), _jsx("div", { className: styles.roomsList, children: !isListShown && (_jsxs(_Fragment, { children: [!!getCountParticipantsByRooms(ROOM_MAIN_ID) && (_jsx(RoomsListItem, { roomId: ROOM_MAIN_ID, roomName: getLang('calls_room_control_not_divided_counter'), countInRoom: getCountParticipantsByRooms(ROOM_MAIN_ID), isRoomsActivated: isRoomsActivated, ...restProps })), objectMap(rooms, (room) => (_jsx(RoomsListItem, { roomId: room.id, roomName: room.name, countInRoom: getCountParticipantsByRooms(room.id), isRoomsActivated: isRoomsActivated, setRoomIdOfDropdown: setRoomIdOfDropdown, ...restProps }, (room.id || room.name)?.toString())))] })) })] }) }));
};
//# sourceMappingURL=RoomsList.js.map