import React, { useCallback, useEffect } from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { Spinner } from '@vkontakte/vkui';
import { SpaceRoomCreateForm } from '../../ui/SpaceRoomUpsertForm/SpaceRoomCreateForm';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { SpaceSectionCreateModal } from '../../ui/SpaceSectionCreateModal/SpaceSectionCreateModal';
import { SpaceMembersPickerModal } from '../../ui/SpaceMembersPickerModal/SpaceMembersPickerModal';
import { useSnackbar } from '../../hooks/useSnackbar';
import { fromApiRoom } from '../../../data/converter/SpaceConverter';
import { ConfirmationModal } from '../../ui/ConfirmationModal/ConfirmationModal';
import { Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { SpaceRoomUpsertModal } from '../../ui/SpaceRoomUpsert/SpaceRoomUpsertModal';
import { useSpaceRoomUpsert, } from '../../ui/SpaceRoomUpsert/useSpaceRoomUpsert';
import { useApiFetch } from '../../hooks/useApiFetch';
const LIMIT_INITIAL_VALUE = 50;
export const SpaceRoomCreate = ({ spaceId, space, initialSectionId, isHidden, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const spaceModalGroup = useModalGroup();
    const sectionCreateModal = useModal(spaceModalGroup.id);
    const speakersPickerModal = useModal(spaceModalGroup.id);
    const getShouldShowConfirm = useCallback((formData) => Boolean(formData.name ||
        formData.speakerIds.length ||
        // Пользователь изменил лимит в голосовой комнате
        (formData.limit !== LIMIT_INITIAL_VALUE &&
            formData.type === 'voice' &&
            formData.voiceType === 'call')), []);
    const { formData, setFormData, focusedFields, setFocusedFields, formErrors, hasFormError, validateForm, handleSetFormData, isLoadingSubmit, setIsLoadingSubmit, close, closeWithConfirm, exitConfirmationModal, } = useSpaceRoomUpsert({
        initialSectionId,
        modalGroupId: spaceModalGroup.id,
        getShouldShowConfirm,
    });
    const handleSubmit = async () => {
        if (hasFormError(validateForm(formData))) {
            return;
        }
        try {
            setIsLoadingSubmit(true);
            const roomType = formData.type === 'text' ? formData.textType : formData.voiceType;
            const limit = typeof formData.limit === 'number'
                ? formData.limit
                : parseInt(formData.limit, 10) || 1;
            const response = await apiFetch('spaces.createRoom', {
                space_id: spaceId,
                name: formData.name.trim(),
                section_id: formData.sectionId,
                type: roomType,
                extended: 1,
                ...(roomType === 'call' ? { limit } : {}),
                ...(roomType === 'tribune'
                    ? { member_ids: formData.speakerIds.join(',') }
                    : {}),
            });
            const room = fromApiRoom(response.room);
            dispatch({
                type: 'UserCreatedSpaceRoom',
                spaceId,
                ...response,
                room,
            });
            close();
        }
        catch {
            snackbar({
                message: lang.use('me_space_room_form_submit_error'),
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
    const handleSpaceMembersPickerSubmit = (peerIds) => {
        speakersPickerModal.close();
        handleSetFormData('speakerIds', peerIds);
    };
    const isLoadingSpace = !space || space.kind === 'Incomplete';
    // Валидируем форму при маунте, чтобы задисейблить submit-кнопку
    useEffect(() => {
        validateForm(formData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (exitConfirmationModal.isActive) {
        return (React.createElement(ConfirmationModal, { title: lang.use('me_space_room_create_exit_confirm_title'), text: lang.use('me_space_room_create_exit_confirm_text'), confirmText: lang.use('me_space_room_create_exit_confirm_submit'), onConfirm: close, onClose: exitConfirmationModal.close }));
    }
    if (sectionCreateModal.isActive) {
        return (React.createElement(SpaceSectionCreateModal, { space: space, spaceId: spaceId, onClose: sectionCreateModal.close, onBack: sectionCreateModal.close, onSubmit: handleSectionCreate, withRoomsSelector: false }));
    }
    if (speakersPickerModal.isActive) {
        return (React.createElement(SpaceMembersPickerModal, { title: lang.use('me_space_room_form_speakers_picker_title'), spaceId: spaceId, initialPeerIds: formData.speakerIds, onClose: speakersPickerModal.close, onSubmit: handleSpaceMembersPickerSubmit, modalGroupId: spaceModalGroup.id }));
    }
    return (React.createElement(SpaceRoomUpsertModal, { isHidden: isHidden, title: lang.use('me_space_room_create_form_title'), isLoadingSubmit: isLoadingSubmit, hasFormError: hasFormError(formErrors), submitText: lang.use('me_space_room_create_form_submit'), onClose: closeWithConfirm, handleSubmit: handleSubmit }, isLoadingSpace ? (React.createElement(Spinner, null)) : (React.createElement(SpaceRoomCreateForm, { space: space, formData: formData, formErrors: formErrors, focusedFields: focusedFields, setFormData: handleSetFormData, setFocusedFields: setFocusedFields, onSectionCreateClick: sectionCreateModal.open, onSpeakersSelectionCellClick: speakersPickerModal.open }))));
};
//# sourceMappingURL=SpaceRoomCreate.js.map