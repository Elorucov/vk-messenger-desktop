export const getDevicesInMyRoom = ({ devices, roomId, localDevice, }) => {
    const devicesArr = Object.values(devices);
    return [localDevice, ...devicesArr.filter((device) => device.roomId === roomId)];
};
export function getActiveDevicesCount({ devices, participantsChunk, participantIdsByMyRoomId = [], }) {
    const self = 1;
    if (participantsChunk) {
        const countBefore = Math.max(0, participantsChunk.countBefore);
        const countAfter = Math.max(0, participantsChunk.countAfter);
        const chunkCount = participantsChunk.ids.length;
        const count = self + countBefore + chunkCount + countAfter;
        return count;
    }
    let count = self; // включаем localDevice (те себя)
    for (const roomParticipant of participantIdsByMyRoomId) {
        const device = devices[roomParticipant.idString];
        if (device && !!device.status) {
            count++;
        }
    }
    return count;
}
export function getVoiceRoomActiveDevicesCount({ isMeListener, ...params }) {
    const activeDevicesCount = getActiveDevicesCount(params);
    return isMeListener ? Math.max(activeDevicesCount - 1, 0) : activeDevicesCount;
}
export function getDeviceFromCache(devices, deviceId) {
    return devices[deviceId] || null;
}
//# sourceMappingURL=devices.js.map