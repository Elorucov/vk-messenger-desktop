import { objectMap } from '../base';
export const getRoomsNames = (rooms, except) => {
    let roomNames = objectMap(rooms, ({ name }) => name);
    if (except) {
        roomNames = roomNames.filter((name) => name !== except);
    }
    return new Set(roomNames);
};
export const roomIdToString = (roomId) => {
    return String(roomId);
};
export const equalsToMyRoom = (roomId, myRoomId) => {
    if (!myRoomId && !roomId) {
        return true;
    }
    return myRoomId === roomId;
};
//# sourceMappingURL=rooms.js.map