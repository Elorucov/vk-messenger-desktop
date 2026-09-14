import { objectFilter, shuffle } from '../base';
import { participantIsAdmin, isSameExternalId } from '../simple';
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
export function getDevicesToDivideInMainRoom({ rooms, devices, participants, }) {
    // Количество участников не админов
    const notAdminDevices = objectFilter(devices, (device) => {
        const participant = participants[device.externalId.id];
        return !participantIsAdmin(participant);
    });
    const countNotAdminDevices = notAdminDevices.length;
    // отфильтровываем тех, кто не привязан к залам
    const listDeviceToDivideExternalIds = shuffle(notAdminDevices
        .filter((device) => !findRelatedRoom(device.externalId, rooms))
        .map((device) => device.externalId));
    return {
        countNotAdminDevices,
        listDeviceToDivideExternalIds,
    };
}
export const isInMyRoom = ({ externalId, participantIdsByMyRoomId }) => {
    return (participantIdsByMyRoomId && participantIdsByMyRoomId.some((uid) => isSameExternalId(uid, externalId)));
};
//# sourceMappingURL=rooms.js.map