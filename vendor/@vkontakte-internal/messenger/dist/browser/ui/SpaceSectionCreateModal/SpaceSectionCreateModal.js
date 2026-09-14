import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import '../../ui/SpaceSectionCreateModal/SpaceSectionCreateModal.css';
import React, { useCallback, useMemo, useState } from 'react';
import * as Space from '../../../core/model/Space';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, usePeers } from '../../hooks/misc';
import { Button, Cell, CellButton, FormItem, Group, Input, List, Separator, Spacing, Spinner, } from '@vkontakte/vkui';
import { useSnackbar } from '../../hooks/useSnackbar';
import { fromApiSection } from '../../../data/converter/SpaceConverter';
import { getLengthWithEmoji } from '../../../core/utils/emoji';
import { Icon24Add, Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { useModal } from '../../hooks/useModal';
import { SpaceRoomsPickerModal } from '../../ui/SpaceRoomsPickerModal/SpaceRoomsPickerModal';
import { SpaceRoomIcon } from '../../ui/SpaceRoomIcon/SpaceRoomIcon';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { SpaceRoomFormInputLabel } from '../../ui/SpaceRoomUpsertForm/SpaceRoomUpsertFormWrapper';
import { useApiFetch } from '../../hooks/useApiFetch';
export const getNameLength = (v) => getLengthWithEmoji(v.trim());
export const SpaceSectionCreateModal = ({ spaceId, space, onClose, onBack, onSubmit, withRoomsSelector, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const roomsPickerModal = useModal();
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const handleClose = () => {
        if (name.length > 0 || selectedRooms.length > 0) {
            setShowExitConfirmation(true);
            return;
        }
        onClose();
    };
    function onChangeName(value) {
        const length = getNameLength(value);
        if (length > Space.SECTION_NAME_MAX_LENGTH) {
            return;
        }
        setName(value.trimStart());
    }
    async function submit() {
        try {
            setLoading(true);
            const rooms = selectedRooms.map((roomId, i) => ({
                room_id: roomId,
                position: i,
            }));
            const response = await apiFetch('spaces.createSection', {
                name: name.trim(),
                space_id: spaceId,
                rooms: JSON.stringify(rooms),
            });
            const section = fromApiSection({
                id: response.section_id,
                name,
                ...response,
            });
            dispatch({
                type: 'UserCreatedSpaceSection',
                spaceId,
                section,
            });
            onSubmit?.(section.id);
            onClose();
        }
        catch {
            snackbar({
                message: lang.use('me_space_section_form_submit_error'),
                autoClose: true,
                duration: 4000,
                before: (React.createElement(Icon24ErrorCircleOutline, { className: "SpaceSectionCreateModal__errorIcon" })),
                mode: 'dark',
            });
        }
        finally {
            setLoading(false);
        }
    }
    const topLevelRooms = space?.kind === 'Space'
        ? Array.from(space.rooms.values()).filter((room) => !room.sectionId)
        : [];
    if (showExitConfirmation) {
        return (React.createElement(SpaceSectionCreateExitModal, { onClose: onClose, onCancel: () => setShowExitConfirmation(false) }));
    }
    if (!space || space.kind === 'Incomplete') {
        return React.createElement(Spinner, null);
    }
    if (roomsPickerModal.isActive) {
        return (React.createElement(SpaceRoomsPickerModal, { space: space, onClose: roomsPickerModal.close, onSelect: setSelectedRooms, selected: selectedRooms }));
    }
    return (React.createElement(ModalInterface, { title: lang.use('me_space_section_create_form_title'), onClose: handleClose, closeLabel: lang.use('me_close'), onBack: onBack, backLabel: lang.use('me_back'), withCustomLayout: true, contextClass: "MEConfig", buttons: [
            React.createElement(Button, { key: "cancel", size: "m", mode: "secondary", onClick: handleClose, disabled: isLoading }, lang.use('me_cancel')),
            React.createElement(Button, { key: "create", size: "m", onClick: submit, disabled: name.length === 0 || isLoading, loading: isLoading }, lang.use('me_space_section_create_form_submit')),
        ] },
        React.createElement("div", { className: "SpaceSectionCreateModal" },
            React.createElement(FormItem, { className: "SpaceSectionCreateModal__form", noPadding: true, top: React.createElement(FormItem.Top, null,
                    React.createElement(FormItem.TopLabel, { Component: "h5" },
                        React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_section_form_name_input_label'), right: lang.use('me_space_room_form_name_input_current_length', {
                                values: {
                                    currentValue: getNameLength(name).toString(),
                                    maxValue: Space.SECTION_NAME_MAX_LENGTH.toString(),
                                },
                            }) }))) },
                React.createElement(Input, { type: "text", autoFocus: true, placeholder: lang.use('me_space_section_form_name_input_placeholder'), value: name, onChange: (v) => onChangeName(v.currentTarget.value) })),
            withRoomsSelector &&
                (topLevelRooms.length > 0 ? (React.createElement(SpaceSectionCreateSelectedRooms, { selectedRooms: selectedRooms, space: space, onOpenRoomsSelector: roomsPickerModal.open, setSelectedRooms: setSelectedRooms })) : (React.createElement(Spacing, { size: 16 }))))));
};
const SpaceSectionCreateSelectedRooms = ({ selectedRooms, space, onOpenRoomsSelector, setSelectedRooms }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const reorderList = useCallback((from, to) => {
        const list = [...selectedRooms];
        const lFrom = list[from];
        if (!lFrom) {
            return;
        }
        list.splice(from, 1);
        list.splice(to, 0, lFrom);
        setSelectedRooms(list);
    }, [selectedRooms, setSelectedRooms]);
    const onRemove = (roomId) => setSelectedRooms(selectedRooms.filter((r) => r !== roomId));
    const selectedRoomsList = useMemo(() => selectedRooms.reduce((acc, roomId) => {
        const room = space.rooms.get(roomId);
        if (!room) {
            return acc;
        }
        const title = Peer.safeGet(peers, room.relatedEntity.peerId).title;
        acc.push({
            roomId,
            roomKind: room.relatedEntity.kind,
            title,
        });
        return acc;
    }, []), [peers, selectedRooms, space.rooms]);
    return (React.createElement("div", { className: "SpaceSectionCreateModal__rooms" },
        React.createElement(FormItem, { className: "SpaceSectionCreateModal__roomsButton", noPadding: true, top: React.createElement(FormItem.Top, null,
                React.createElement(FormItem.TopLabel, { Component: "h5" },
                    React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_section_create_selected_rooms_title') }))) },
            React.createElement(CellButton, { before: React.createElement(Icon24Add, null), hasHover: false, hasActive: false, multiline: true, subtitle: lang.use('me_space_section_create_add_room_button_description'), onClick: onOpenRoomsSelector }, lang.use('me_space_section_create_add_room_button'))),
        selectedRoomsList.length > 0 ? (React.createElement(React.Fragment, null,
            React.createElement(Separator, { className: "SpaceSectionCreateModal__roomsListSeparator" }),
            React.createElement(ScrollbarProvider, { style: { maxHeight: '360px' }, overflowX: "hidden" },
                React.createElement(Group, { mode: "plain", className: "SpaceSectionCreateModal__roomsList" },
                    React.createElement(List, null, selectedRoomsList.map(({ roomId, title, roomKind }) => (React.createElement(Cell, { key: roomId, mode: "removable", className: "SpaceSectionCreateModal__listItem", draggable: true, before: React.createElement(SpaceRoomIcon, { className: "SpaceSectionCreateModal__icon", kind: roomKind }), onRemove: () => onRemove(roomId), onDragFinish: ({ from, to }) => reorderList(from, to) }, title)))))))) : (React.createElement(Spacing, { size: 12 }))));
};
const SpaceSectionCreateExitModal = ({ onClose, onCancel, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalInterface, { onClose: onCancel, closeLabel: lang.use('me_close'), title: lang.use('me_space_section_create_form_exit_confirmation_title'), buttons: React.createElement(React.Fragment, null,
            React.createElement(Button, { mode: "secondary", size: "m", onClick: onCancel }, lang.use('me_cancel')),
            React.createElement(Button, { mode: "primary", size: "m", onClick: onClose }, lang.use('me_space_section_create_form_exit_confirmation_button'))) },
        React.createElement("div", { className: "SpaceSectionCreateModal__closeConfirmation" }, lang.use('me_space_section_create_form_exit_confirmation'))));
};
//# sourceMappingURL=SpaceSectionCreateModal.js.map