import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useLang } from '../../../../../../hooks/useLang';
import { participantIsAdmin, findRelatedRoom, roomIdToString, isEmpty, objectForEach, ROOM_MAIN_ID, } from '@vkontakte-internal/calls-core';
import { useCallback } from 'react';
import { getColorClass, Placeholder } from '@vkontakte-internal/vkcom-kit';
import { useDevicesIndexer } from '../../../../../../hooks/useDevicesIndexer';
import { useTypedSelector } from '../../../../../../hooks/useTypedSelector';
import { ParticipantsListHeader } from '../ParticipantsListHeader/ParticipantsListHeader';
import { ParticipantsList } from '../ParticipantsList/ParticipantsList';
import styles from './ParticipantsManagement.module.css';
import { Icon20ArrowLeftOutline } from '@vkontakte/icons';
export const ParticipantsManagement = ({ rooms, devices, isRoomsActivated, participants, chosenRoomId, searchQuery, onChangeParticipantRoom, onAutoDivide, getCountParticipantsByRooms, ...restProps }) => {
    const { getLang } = useLang();
    const changedParticipantIds = useTypedSelector((state) => state.changedParticipantIds);
    const searchIndex = useDevicesIndexer(devices, {
        getParticipants: () => participants,
        getChangedParticipantIds: () => changedParticipantIds,
    });
    const hasSearchQuery = !isEmpty(searchQuery);
    const filteredDevices = hasSearchQuery ? searchIndex.search(searchQuery) : devices;
    const getParticipantActionsMore = () => {
        const roomsArray = Object.values(rooms);
        const items = [];
        const getActionItem = (roomId, text) => ({
            text,
            after: (_jsx("span", { className: getColorClass('color_text_tertiary'), children: getCountParticipantsByRooms(roomId) })),
            handleClick: (participantId) => onChangeParticipantRoom(participantId, roomId),
            dataTestId: `calls_rooms_control_participant_move_${roomId}`,
        });
        const titleAction = {
            text: getLang('calls_room_control_action_move_participant'),
            disabled: true,
        };
        if (!isRoomsActivated) {
            items.push(titleAction);
            if (chosenRoomId || searchQuery) {
                items.push(getActionItem(ROOM_MAIN_ID, 
                // переместить участника в
                getLang('calls_room_control_main_room_title')));
            }
            if (!isEmpty(roomsArray)) {
                roomsArray.forEach((room) => {
                    items.push(getActionItem(room.id, room.name));
                });
            }
        }
        else {
            if (chosenRoomId) {
                items.push({
                    ...getActionItem(ROOM_MAIN_ID, 
                    // Вызвать в основной зал
                    getLang('calls_room_control_move_to_main_room')),
                    before: _jsx(Icon20ArrowLeftOutline, {}),
                    withSeparator: true,
                    dataTestId: 'calls_rooms_control_participant_move_main_room',
                });
                items.push(titleAction);
            }
            roomsArray.forEach((room) => {
                items.push(getActionItem(room.id, room.name));
            });
        }
        return items;
    };
    const byRoomDevices = filteredDevices.reduce((acc, device) => {
        const relatedRoom = findRelatedRoom(device.externalId, rooms);
        const roomId = (isRoomsActivated ? device?.roomId : relatedRoom?.id) ?? ROOM_MAIN_ID;
        const stringRoomId = roomIdToString(roomId);
        const participant = participants[device.externalId.id];
        // отфильтровывам в зависимости от состояния залов и статуса участника
        if (participantIsAdmin(participant) &&
            (!isRoomsActivated || stringRoomId === roomIdToString(ROOM_MAIN_ID))) {
            return acc;
        }
        if (!acc[stringRoomId]) {
            acc[stringRoomId] = [];
        }
        acc[stringRoomId].push(device);
        return acc;
    }, { [roomIdToString(ROOM_MAIN_ID)]: [] });
    const handleRoomChangeToMainRoom = useCallback((participantId) => {
        onChangeParticipantRoom(participantId, ROOM_MAIN_ID);
    }, [onChangeParticipantRoom]);
    const handleRoomChangeToChosenRoom = useCallback((participantId) => {
        if (chosenRoomId) {
            onChangeParticipantRoom(participantId, chosenRoomId);
        }
    }, [onChangeParticipantRoom, chosenRoomId]);
    const blocks = [];
    if (!hasSearchQuery) {
        if (!chosenRoomId) {
            const countInMainRoom = getCountParticipantsByRooms(ROOM_MAIN_ID);
            // Если выбран основной зал
            blocks.push(_jsx(ParticipantsList, { actionsMore: getParticipantActionsMore(), header: !!countInMainRoom && (_jsx(ParticipantsListHeader, { title: getLang('calls_room_control_not_divided_counter'), count: countInMainRoom, onAutoDivide: onAutoDivide })), devices: byRoomDevices[roomIdToString(ROOM_MAIN_ID)], participants: participants, moreButtonStyle: isRoomsActivated ? 'button' : 'icon', ...restProps }, "participants_list_main"));
        }
        else {
            // Если выбрана комната
            blocks.push(_jsx(ParticipantsList, { actionsMore: getParticipantActionsMore(), header: _jsx(ParticipantsListHeader, { title: rooms[chosenRoomId]?.name, count: getCountParticipantsByRooms(chosenRoomId) }), devices: byRoomDevices[roomIdToString(chosenRoomId)], selectable: !isRoomsActivated, checked: !isRoomsActivated, participants: participants, showIfEmpty: !isRoomsActivated, withMeta: isRoomsActivated, handleChange: handleRoomChangeToMainRoom, ...restProps }, `participants_list_${chosenRoomId}`));
            if (!isRoomsActivated && !isEmpty(byRoomDevices[roomIdToString(ROOM_MAIN_ID)])) {
                blocks.push(_jsx(ParticipantsList, { actionsMore: getParticipantActionsMore(), header: _jsx(ParticipantsListHeader, { title: getLang('calls_room_control_not_divided_counter'), count: getCountParticipantsByRooms(ROOM_MAIN_ID) }), devices: byRoomDevices[roomIdToString(ROOM_MAIN_ID)], selectable: true, checked: false, participants: participants, showSeparator: true, handleChange: handleRoomChangeToChosenRoom, ...restProps }, "participants_list_main"));
            }
        }
    }
    else {
        // Результаты поиска
        let showSeparator = false;
        if (isEmpty(filteredDevices)) {
            blocks.push(_jsx(Placeholder, { children: getLang('calls_participants_not_found') }));
        }
        else {
            objectForEach(byRoomDevices, (devices, stringRoomId) => {
                if (isEmpty(devices)) {
                    return;
                }
                const roomName = stringRoomId === roomIdToString(ROOM_MAIN_ID)
                    ? getLang('calls_room_control_not_divided_counter')
                    : rooms[+stringRoomId].name;
                blocks.push(_jsx(ParticipantsList, { actionsMore: getParticipantActionsMore(), header: _jsx(ParticipantsListHeader, { title: roomName }), devices: byRoomDevices[stringRoomId], participants: participants, showSeparator: showSeparator, ...restProps }, `participants_list_${stringRoomId}`));
                showSeparator = true;
            });
        }
    }
    return _jsx("div", { className: styles.root, children: blocks });
};
//# sourceMappingURL=ParticipantsManagement.js.map