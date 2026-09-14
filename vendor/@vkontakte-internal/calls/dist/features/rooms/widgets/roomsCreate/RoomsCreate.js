import { jsx as _jsx } from "react/jsx-runtime";
import { useCloseModal } from '../../../../hooks/useCloseModal';
import { useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { ROOMS_ASSIGN_RANDOMLY, ROOMS_COUNT, ROOMS_MAX_COUNT, ROOMS_MAX_PARTICIPANTS_COUNT, } from '../../../../constants';
import { ModalType, participantIsAdmin } from '@vkontakte-internal/calls-core';
import { RoomCreateModal } from './RoomCreateModal/RoomCreateModal';
import { useCallback, useState, useMemo } from 'react';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { objectForEach } from '../../../../helpers/helpers';
import { useLang } from '../../../../hooks/useLang';
import { toggleModal } from '../../../../actions';
import { getCallId, getDevices, getIsEnabledRoomTimer, getParticipants, getPeerId, } from '../../../../selectors';
import { useSetRoomCountdown } from '../../../../hooks/useSetRoomCountdown';
import { updateRooms } from '@vkontakte/calls-sdk';
import { RoomsCreateProvider, useRoomsCreateModel } from './RoomsCreateModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
const RoomsCreateView = observer(function RoomsCreateView() {
    const { getLang } = useLang();
    const dispatch = useTypedDispatch();
    const { rooms, roomsCountdownSec, setRoomsCountdown, resetRoomsTimer, roomsNames, sendAutoAllocationEvent, } = useRoomsCreateModel();
    const participants = useTypedSelector(getParticipants);
    const devices = useTypedSelector(getDevices);
    const callId = useTypedSelector(getCallId);
    const peer = useTypedSelector(getPeerId);
    const enableRoomTimer = useTypedSelector(getIsEnabledRoomTimer);
    const [roomCountValue, setRoomCountValue] = useState(ROOMS_COUNT);
    const [assignRandomly, setAssignRandomly] = useState(ROOMS_ASSIGN_RANDOMLY);
    const { currentTimer, onTimerInput, isTimerEnabled, onTimerSwitch, immediatelyCommitCountdown, countdownSec, } = useSetRoomCountdown({
        rooms,
        countdownSec: roomsCountdownSec,
        setRoomsCountdown,
        resetRoomsTimer,
    });
    const roomCount = Math.max(1, +roomCountValue);
    const assignRandomlyByCount = useMemo(() => {
        // Считаем, сколько пользователей не админов в звонке и делим на количество залов, чтобы автоматом распределить
        let participantCount = 0;
        objectForEach(devices, (device) => {
            const participant = participants[device.externalId.id];
            if (!participantIsAdmin(participant)) {
                participantCount++;
            }
        });
        return Math.min(ROOMS_MAX_PARTICIPANTS_COUNT, Math.ceil(participantCount / roomCount));
    }, [devices, participants, roomCount]);
    const onSubmit = useCallback(async () => {
        const rooms = [];
        immediatelyCommitCountdown();
        // Подготавливаем информацию по залам
        for (let i = 0; i < roomCount; i++) {
            const name = `${getLang('calls_room_control_create_default_room_name')} ${i + 1}`;
            if (!roomsNames.has(name)) {
                rooms.push({
                    name,
                    participantCount: assignRandomly ? assignRandomlyByCount : 0,
                    countdownSec,
                });
            }
        }
        // Создаем залы
        if (rooms.length) {
            await updateRooms(rooms, assignRandomly);
            // Если включено автоматическое распределение, то шлем стату
            if (assignRandomly) {
                sendAutoAllocationEvent();
            }
        }
        // Переходим к окну отображения залов и участников
        dispatch(toggleModal(ModalType.ROOM_CONTROL));
    }, [
        assignRandomlyByCount,
        assignRandomly,
        roomCount,
        roomsNames,
        callId,
        peer,
        isTimerEnabled,
        currentTimer,
    ]);
    const onClose = useCloseModal();
    const handleRoomCountChange = useCallback((value) => {
        const int = parseInt(value);
        if (isNaN(int) || int <= 0) {
            return setRoomCountValue('');
        }
        setRoomCountValue(Math.min(int, ROOMS_MAX_COUNT));
    }, []);
    return (_jsx(RoomCreateModal, { onClose: onClose, onSubmit: onSubmit, roomCountValue: roomCountValue, assignRandomly: assignRandomly, onRoomCountChange: handleRoomCountChange, onAssignRandomlyChange: () => setAssignRandomly((prev) => !prev), isEnabledRoomTimer: enableRoomTimer, onIsTimerEnabledChange: onTimerSwitch, onTimerInput: onTimerInput, currentTimer: currentTimer, isTimerEnabled: isTimerEnabled }));
});
export const RoomsCreateWidget = createWidget(RoomsCreateProvider, RoomsCreateView);
//# sourceMappingURL=RoomsCreate.js.map