import React, { useCallback, useEffect, useRef, useState, } from 'react';
import '../../ui/SpaceRoomUpsert/SpaceRoomUpdate.css';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, usePeers } from '../../hooks/misc';
import { Button, ScreenSpinner, Spinner, SplitLayout } from '@vkontakte/vkui';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { SpaceSectionCreateModal } from '../../ui/SpaceSectionCreateModal/SpaceSectionCreateModal';
import { SpaceRoomUpdateForm } from '../../ui/SpaceRoomUpsertForm/SpaceRoomUpdateForm';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { SpaceRoomUpsertModal } from '../../ui/SpaceRoomUpsert/SpaceRoomUpsertModal';
import { useSpaceRoomUpsert } from '../../ui/SpaceRoomUpsert/useSpaceRoomUpsert';
import { ConfirmationModal } from '../../ui/ConfirmationModal/ConfirmationModal';
import { useApiFetch } from '../../hooks/useApiFetch';
export const SpaceRoomUpdate = ({ spaceId, space, roomId, isHidden, }) => {
    const { lang, router } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const peers = usePeers();
    const spaceModalGroup = useModalGroup();
    const sectionCreateModal = useModal(spaceModalGroup.id);
    const deleteConfirmationModal = useModal(spaceModalGroup.id);
    const [popout, setPopout] = useState(null);
    const clearPopout = () => setPopout(null);
    const roomRef = useRef();
    const { formData, setFormData, focusedFields, setFocusedFields, formErrors, hasFormError, validateForm, handleSetFormData, isLoadingSubmit, setIsLoadingSubmit, close, } = useSpaceRoomUpsert({
        modalGroupId: spaceModalGroup.id,
        // Пока не нужен
        getShouldShowConfirm: useCallback(() => false, []),
    });
    const handleSubmit = async () => {
        // Невозможный сценарий
        if (!roomRef.current) {
            return;
        }
        if (hasFormError(validateForm(formData))) {
            return;
        }
        try {
            setIsLoadingSubmit(true);
            const isNameChanged = Peer.safeGet(peers, roomRef.current.relatedEntity.peerId).title !==
                formData.name.trim();
            const isSectionChanged = roomRef.current.sectionId !== formData.sectionId;
            if (!isNameChanged && !isSectionChanged) {
                close();
            }
            await apiFetch('spaces.editRoom', {
                space_id: spaceId,
                room_id: roomId,
                section_id: formData.sectionId ?? 0,
                ...(isNameChanged && { name: formData.name.trim() }),
            });
            dispatch({
                type: 'UserUpdatedSpaceRoom',
                spaceId,
                roomId,
                data: {
                    sectionId: formData.sectionId,
                },
            });
            close();
        }
        catch {
            snackbar({
                message: lang.use('me_space_room_update_form_submit_error'),
                autoClose: true,
                duration: 4000,
                mode: 'dark',
                before: (React.createElement(Icon24ErrorCircleOutline, { style: { color: 'var(--vkui--color_icon_negative)' } })),
            });
        }
        finally {
            setIsLoadingSubmit(false);
        }
    };
    const handleSectionCreate = (sectionId) => {
        setFormData({
            ...formData,
            sectionId,
        });
    };
    const handleDeleteRoom = async () => {
        try {
            setPopout(React.createElement(ScreenSpinner, { state: "loading" }));
            await apiFetch('spaces.deleteRoom', {
                space_id: spaceId,
                room_id: roomId,
            });
            router.push({
                kind: 'SpaceRoute',
                spaceId,
            });
        }
        catch {
            setPopout(React.createElement(ScreenSpinner, { state: "error" }));
            setTimeout(clearPopout, 1000);
            snackbar({
                message: lang.use('me_space_room_update_delete_error'),
                autoClose: true,
                duration: 4000,
                mode: 'dark',
                before: (React.createElement(Icon24ErrorCircleOutline, { style: { color: 'var(--vkui--color_icon_negative)' } })),
            });
        }
    };
    const isLoadingSpace = !space || space.kind === 'Incomplete';
    useEffect(() => {
        if (space?.kind === 'Space') {
            const room = getSpaceRoom(space, roomId);
            roomRef.current = room;
            const peer = Peer.safeGet(peers, room.relatedEntity.peerId);
            const type = ['RoomChat', 'RoomChannel'].includes(room.relatedEntity.kind)
                ? 'text'
                : 'voice';
            const textType = room.relatedEntity.kind === 'RoomChannel' ? 'channel' : 'conversation';
            const voiceType = room.relatedEntity.kind === 'RoomTribune' ? 'tribune' : 'call';
            setFormData({
                ...formData,
                name: peer.title,
                sectionId: room.sectionId,
                type,
                textType,
                voiceType,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [space?.kind]);
    if (deleteConfirmationModal.isActive) {
        // Невозможный сценарий
        if (!roomRef.current) {
            return;
        }
        const roomTitle = Peer.safeGet(peers, roomRef.current.relatedEntity.peerId).title;
        return (React.createElement(ConfirmationModal, { panelClass: "SpaceRoomUpdate__deleteConfirmModal", title: lang.use('me_space_room_delete_modal_title', {
                values: { name: roomTitle },
            }), text: lang.use('me_space_room_delete_modal_text'), confirmText: lang.use('me_space_room_delete_modal_submit'), onConfirm: () => {
                deleteConfirmationModal.close();
                handleDeleteRoom();
            }, onClose: deleteConfirmationModal.close }));
    }
    if (sectionCreateModal.isActive) {
        return (React.createElement(SpaceSectionCreateModal, { space: space, spaceId: spaceId, onClose: sectionCreateModal.close, onBack: sectionCreateModal.close, onSubmit: handleSectionCreate, withRoomsSelector: false }));
    }
    return (React.createElement(SpaceRoomUpsertModal, { title: lang.use('me_space_room_update_form_title'), isLoadingSubmit: isLoadingSubmit, hasFormError: hasFormError(formErrors), submitText: lang.use('me_save'), footerHint: React.createElement("div", { style: {
                marginLeft: '-12px',
            } },
            React.createElement(Button, { size: "m", mode: "tertiary", appearance: "negative", onClick: deleteConfirmationModal.open }, lang.use('me_space_room_form_delete_room'))), onClose: close, handleSubmit: handleSubmit, isHidden: isHidden }, isLoadingSpace ? (React.createElement(Spinner, null)) : (React.createElement(SplitLayout, { popout: popout, "aria-live": "polite", "aria-busy": !!popout },
        React.createElement(SpaceRoomUpdateForm, { space: space, formData: formData, formErrors: formErrors, focusedFields: focusedFields, setFormData: handleSetFormData, setFocusedFields: setFocusedFields, onSectionCreateClick: sectionCreateModal.open })))));
};
const getSpaceRoom = (space, roomId) => {
    const room = space.rooms.get(roomId);
    if (!room) {
        // Невозможный сценарий, если id комнаты не указано вручную
        throw Error('Комната не найдена, вероятно некорретктный ID комнаты');
    }
    return room;
};
export function getOrderedSectionRooms(space, sectionId) {
    return [...space.rooms.values()]
        .filter((room) => room.sectionId === sectionId)
        .sort((a, b) => (a.position < b.position ? -1 : 1));
}
//# sourceMappingURL=SpaceRoomUpdate.js.map