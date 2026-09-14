import '../../ui/SpaceRoomsPickerModal/SpaceRoomsPickerModal.css';
import React, { useMemo, useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { Button, Cell, Group } from '@vkontakte/vkui';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Icon24CheckCircleOff, Icon24CheckCircleOn } from '@vkontakte/icons';
import { SpaceRoomIcon } from '../../ui/SpaceRoomIcon/SpaceRoomIcon';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
export const SpaceRoomsPickerModal = ({ space, onClose, onSelect, selected, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const [selectedRooms, setSelectedRooms] = useState(selected);
    const topLevelRooms = useMemo(() => Array.from(space.rooms.values())
        .filter((room) => !room.sectionId)
        .map((room) => {
        const title = Peer.safeGet(peers, room.relatedEntity.peerId).title;
        return {
            roomId: room.id,
            roomKind: room.relatedEntity.kind,
            title,
        };
    }), [space.rooms, peers]);
    const handleChange = (roomId) => {
        if (selectedRooms.includes(roomId)) {
            setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
        }
        else {
            setSelectedRooms(selectedRooms.concat(roomId));
        }
    };
    const onSave = () => {
        onSelect(selectedRooms);
        onClose();
    };
    return (React.createElement(ModalInterface, { title: lang.use('me_space_rooms_picker_modal_title'), onClose: onClose, closeLabel: lang.use('me_close'), onBack: onClose, backLabel: lang.use('me_back'), withCustomLayout: true, contextClass: "MEConfig", buttons: [
            React.createElement(Button, { size: "m", mode: "secondary", onClick: onClose }, lang.use('me_cancel')),
            React.createElement(Button, { size: "m", onClick: onSave, disabled: selectedRooms.length === 0 }, lang.use('me_space_rooms_picker_form_button_submit')),
        ] },
        React.createElement("div", { className: "SpaceRoomsPickerModal" },
            React.createElement(ScrollbarProvider, { style: { maxHeight: '420px' }, overflowX: "hidden" },
                React.createElement(Group, { mode: "plain", separator: "auto", padding: "m", className: "SpaceRoomsPickerModal__group" }, topLevelRooms.map(({ roomId, title, roomKind }) => (React.createElement(Cell, { onClick: () => handleChange(roomId), key: roomId, title: title, Component: "label", before: React.createElement(SpaceRoomIcon, { className: "SpaceRoomsPickerModal__icon", kind: roomKind }), after: selectedRooms.includes(roomId) ? (React.createElement(Icon24CheckCircleOn, null)) : (React.createElement(Icon24CheckCircleOff, { className: "SpaceRoomsPickerModal__icon" })) }, title))))))));
};
//# sourceMappingURL=SpaceRoomsPickerModal.js.map