import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useCloseChildModal, useCloseModal } from '../../hooks/useCloseModal';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useLang } from '../../hooks/useLang';
import { useCallsSDK } from '../../providers/CallsSdkProvider';
import { getModal, getParticipants } from '../../selectors';
import { handlePromiseError } from '../../helpers/logger';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { modalHasType, ModalType, MEDIA_TRANSLATION_TYPE } from '@vkontakte-internal/calls-core';
import { createWidget } from '@vkontakte-internal/di';
import { useRoomLeaveRemoveMediaTranslationModel, RoomLeaveRemoveMediaTranslationProvider, } from './RoomLeaveRemoveMediaTranslationModel';
import { observer } from 'mobx-react-lite';
const RoomLeaveRemoveMediaTranslationModalView = observer(function RoomLeaveRemoveMediaTranslationModalView() {
    const { isChild, roomId, roomHandlersService, removeMovie, movieInfo } = useRoomLeaveRemoveMediaTranslationModel();
    const SDK = useCallsSDK();
    const { getLang } = useLang();
    const modal = useTypedSelector(getModal);
    const closeModal = useCloseModal();
    const closeChildModal = useCloseChildModal();
    const currentModal = isChild ? modal?.child : modal;
    const mediaTranslationType = modalHasType(currentModal, ModalType.ROOM_LEAVE_REMOVE_MEDIA_TRANSLATION)
        ? currentModal?.details?.mediaTranslationType ?? MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER
        : MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER;
    const participantId = modalHasType(currentModal, ModalType.ROOM_LEAVE_REMOVE_MEDIA_TRANSLATION) &&
        currentModal?.details?.participantId;
    const targetSwitchedRoom = modalHasType(currentModal, ModalType.ROOM_LEAVE_REMOVE_MEDIA_TRANSLATION) &&
        currentModal?.details?.roomId;
    const participants = useTypedSelector(getParticipants);
    const handleClose = () => {
        isChild ? closeChildModal() : closeModal();
    };
    const switchRoomCallback = () => {
        const stopMediaStream = () => {
            if (movieInfo && mediaTranslationType === MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER) {
                return removeMovie(movieInfo.movieId);
            }
            // MEDIA_TRANSLATION_TYPE.STREAM or MEDIA_TRANSLATION_TYPE.RECORD:
            return SDK.stopStream(roomId).catch(handlePromiseError);
        };
        stopMediaStream().finally(handleClose);
    };
    const handleSwitchRoom = (targetRoomId) => {
        handleClose();
        if (participantId) {
            return SDK.switchRoom(targetRoomId, participantId);
        }
        else {
            roomHandlersService.switchRoom(targetRoomId, true, switchRoomCallback);
        }
    };
    const switchRoom = () => {
        handleSwitchRoom(modalHasType(currentModal, ModalType.ROOM_LEAVE_REMOVE_MEDIA_TRANSLATION)
            ? currentModal.details.roomId
            : null);
    };
    const modalText = useMemo(() => {
        const isTargetSwitchedRoom = Boolean(targetSwitchedRoom);
        let acceptText;
        let bodyText;
        if (participantId) {
            const recordAuthorName = participants[participantId.id]?.name;
            acceptText = getLang('calls_room_remove_translation_participant_confirm');
            switch (mediaTranslationType) {
                case MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER:
                    bodyText = getLang('calls_room_leave_remove_watch_together_participant_host');
                    break;
                case MEDIA_TRANSLATION_TYPE.RECORD:
                    bodyText = getLang('calls_room_leave_remove_record_participant_host');
                    break;
                default: // MEDIA_TRANSLATION_TYPE.STREAM
                    bodyText = getLang('calls_room_leave_remove_stream_participant_host');
            }
            bodyText = bodyText.replace('{name}', recordAuthorName);
        }
        else if (isTargetSwitchedRoom) {
            acceptText = getLang('calls_room_leave_remove_watch_together_modal_to_room_confirm');
            switch (mediaTranslationType) {
                case MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER:
                    bodyText = getLang('calls_room_leave_remove_watch_together_modal_to_room_body');
                    break;
                case MEDIA_TRANSLATION_TYPE.RECORD:
                    bodyText = getLang('calls_room_leave_remove_record_modal_to_room_body');
                    break;
                default: // MEDIA_TRANSLATION_TYPE.STREAM
                    bodyText = getLang('calls_room_leave_remove_stream_modal_to_room_body');
            }
        }
        else {
            acceptText = getLang('calls_room_leave_remove_watch_together_modal_confirm');
            switch (mediaTranslationType) {
                case MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER:
                    bodyText = getLang('calls_room_leave_remove_watch_together_modal_body');
                    break;
                case MEDIA_TRANSLATION_TYPE.RECORD:
                    bodyText = getLang('calls_room_leave_remove_record_modal_body');
                    break;
                default: // MEDIA_TRANSLATION_TYPE.STREAM
                    bodyText = getLang('calls_room_leave_remove_stream_modal_body');
            }
        }
        return {
            acceptText,
            bodyText,
        };
    }, [mediaTranslationType, targetSwitchedRoom]);
    const modalTitle = useMemo(() => {
        if (mediaTranslationType === MEDIA_TRANSLATION_TYPE.WATCH_TOGETHER) {
            return getLang('calls_room_leave_remove_watch_together_modal_header');
        }
        if (mediaTranslationType === MEDIA_TRANSLATION_TYPE.RECORD) {
            return getLang('calls_room_leave_remove_record_modal_header');
        }
        return getLang('calls_room_leave_remove_stream_header');
    }, [mediaTranslationType]);
    return (_jsx(ConfirmModal, { onClose: handleClose, onSubmit: switchRoom, bodyText: modalText.bodyText, acceptText: modalText.acceptText, modalTitle: modalTitle }));
});
export const RoomLeaveRemoveMediaTranslationModalWidget = createWidget(RoomLeaveRemoveMediaTranslationProvider, RoomLeaveRemoveMediaTranslationModalView);
//# sourceMappingURL=RoomLeaveRemoveMediaTranslationModalContainer.js.map