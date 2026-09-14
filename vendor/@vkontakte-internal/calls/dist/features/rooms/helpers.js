import { switchRoom, updateRooms, } from '@vkontakte/calls-sdk';
import { ClickHouseEventType, sendStats } from '../../stats/clickHouse';
import { isSameExternalId } from '@vkontakte-internal/calls-core';
/**
 * Получить связанную с пользователем комнату (он необязательно в данный момент в ней)
 * @param externalId
 * @param rooms
 */
export const findRelatedRoom = (externalId, rooms) => {
    return Object.values(rooms).find((room) => {
        return room.participantIds?.some((participantId) => isSameExternalId(participantId, externalId));
    });
};
export const changeParticipantRoom = (rooms, roomId, participantId, useSwitch = false) => {
    if (useSwitch) {
        switchRoom(roomId, participantId);
    }
    else {
        const update = [];
        const relatedRoom = findRelatedRoom(participantId, rooms);
        if (relatedRoom) {
            update.push({
                id: relatedRoom.id,
                removeParticipantIds: [participantId],
            });
        }
        if (roomId) {
            update.push({
                id: roomId,
                addParticipantIds: [participantId],
            });
        }
        updateRooms(update);
    }
    sendStats(ClickHouseEventType.SESSION_ROOMS_MANUAL_ALLOCATION);
};
//# sourceMappingURL=helpers.js.map