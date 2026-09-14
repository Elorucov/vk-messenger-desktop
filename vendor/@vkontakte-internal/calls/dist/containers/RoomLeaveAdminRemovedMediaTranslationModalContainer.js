import { jsx as _jsx } from "react/jsx-runtime";
import { InfoModal } from '../components/InfoModal/InfoModal';
import { useCloseModal } from '../hooks/useCloseModal';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useLang } from '../hooks/useLang';
import { modalHasType, ModalType } from '@vkontakte-internal/calls-core';
export const RoomLeaveAdminRemovedMediaTranslationModalContainer = () => {
    const { getLang } = useLang();
    const modal = useTypedSelector((state) => state.modal);
    const closeModal = useCloseModal();
    const isRecord = !!(modalHasType(modal, ModalType.ROOM_LEAVE_ADMIN_REMOVED_MEDIA_TRANSLATION) &&
        modal?.details?.translationIsRecord);
    const handleClose = () => {
        closeModal();
    };
    return (_jsx(InfoModal, { onClose: handleClose, titleText: isRecord ? getLang('calls_room_record_stopped') : getLang('calls_room_stream_stopped'), bodyText: getLang('calls_room_admin_closed_rooms'), acceptText: getLang('calls_warning_ok') }));
};
//# sourceMappingURL=RoomLeaveAdminRemovedMediaTranslationModalContainer.js.map