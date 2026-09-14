import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { externalIdToString, isSameExternalId, objectForEach, objectMap, objectSome, ROOM_MAIN_ID, roomIdToString, isInMyRoom, } from '@vkontakte-internal/calls-core';
let RoomsService = class RoomsService {
    constructor() {
        this._roomId = ROOM_MAIN_ID;
        this._roomChatIds = {};
        this._rooms = {};
        this._participantIdsByRoomIdMap = {};
        this._countdownSec = undefined;
        this._timeoutMs = undefined;
        // ==== Methods ==== //
        this.clear = () => {
            this._roomId = ROOM_MAIN_ID;
            this._roomChatIds = {};
            this._rooms = {};
            this._participantIdsByRoomIdMap = {};
            this._countdownSec = undefined;
            this._timeoutMs = undefined;
        };
        this.updateRooms = (data) => {
            objectForEach(data, (roomUpdate, roomId) => {
                this._rooms[roomId] = {
                    ...this._rooms[roomId],
                    ...roomUpdate,
                };
            });
            const anyRoomId = Number(Object.keys(data)[0]);
            const timeoutMs = this._rooms[anyRoomId]?.timeoutMs;
            if (typeof timeoutMs === 'number' && timeoutMs - Date.now() < 0) {
                this._timeoutMs = undefined;
                this._countdownSec = undefined;
            }
            else {
                const countdownSec = this._rooms[anyRoomId]?.countdownSec;
                this._timeoutMs = timeoutMs;
                this._countdownSec = countdownSec;
            }
        };
        this.setRoomId = (roomId = ROOM_MAIN_ID) => {
            this._roomId = roomId;
        };
        this.setRoomChatId = ({ roomId, chatId }) => {
            this._roomChatIds[roomIdToString(roomId)] = chatId;
        };
        this.setRoomActive = ({ roomId, active }) => {
            this._rooms[roomId].active = active;
        };
        this.updateRoomParticipants = ({ roomId, myExternalId, participantIds: actionParticipantIds, addedParticipantIds, removedParticipantIds, }) => {
            const strRoomId = roomIdToString(roomId);
            let participantIds = new Map();
            if (actionParticipantIds) {
                actionParticipantIds.forEach((participantId) => {
                    if (!isSameExternalId(participantId, myExternalId)) {
                        participantIds.set(externalIdToString(participantId), participantId);
                    }
                });
            }
            else if (addedParticipantIds || removedParticipantIds) {
                (this._participantIdsByRoomIdMap[strRoomId] ?? []).forEach((participantId) => {
                    participantIds.set(externalIdToString(participantId), participantId);
                });
                if (addedParticipantIds) {
                    addedParticipantIds.forEach((participantId) => {
                        const idString = externalIdToString(participantId);
                        if (isSameExternalId(participantId, myExternalId)) {
                            return false;
                        }
                        if (!participantIds.has(idString)) {
                            participantIds.set(idString, participantId);
                        }
                    });
                }
                if (removedParticipantIds) {
                    removedParticipantIds.forEach((participantId) => {
                        const idString = externalIdToString(participantId);
                        if (participantIds.has(idString)) {
                            participantIds.delete(idString);
                        }
                    });
                }
            }
            this._participantIdsByRoomIdMap[strRoomId] = [...participantIds.values()].map((participantId) => ({
                ...participantId,
                idString: externalIdToString(participantId),
            }));
        };
        this.clearRoomParticipants = (roomId) => {
            const strRoomId = roomIdToString(roomId);
            delete this._participantIdsByRoomIdMap[strRoomId];
        };
        this.removeRoom = (roomId) => {
            delete this._rooms[roomId];
            delete this._participantIdsByRoomIdMap[roomId];
        };
        this.clearRooms = () => {
            this._rooms = {};
        };
        this.setCountdown = ({ countdownSec, timeoutMs }) => {
            this._countdownSec = countdownSec;
            this._timeoutMs = timeoutMs;
        };
        this.resetTimer = () => {
            this._countdownSec = undefined;
            this._timeoutMs = undefined;
        };
        this.replaceParticipantPeerId = (nextId, prevExternalId, deviceRoomId) => {
            for (const key in this._rooms) {
                if (!this._rooms.hasOwnProperty(key)) {
                    continue;
                }
                const room = this._rooms[key];
                const index = room.participantIds.findIndex((externalId) => isSameExternalId(externalId, prevExternalId)) ?? -1;
                if (index > -1) {
                    room.participantIds[index].id = nextId;
                    break;
                }
            }
            if (deviceRoomId !== undefined) {
                const roomDevices = this._participantIdsByRoomIdMap[roomIdToString(deviceRoomId)];
                const index = roomDevices?.findIndex((externalId) => isSameExternalId(externalId, prevExternalId)) ?? -1;
                if (index > -1) {
                    roomDevices[index].id = nextId;
                    roomDevices[index].idString = externalIdToString({
                        ...prevExternalId,
                        id: nextId,
                    });
                }
            }
        };
        this.equalsToMyRoom = (roomId) => {
            return this.roomId === roomId;
        };
        this.checkIsInMyRoom = (externalId) => {
            return isInMyRoom({ externalId, participantIdsByMyRoomId: this.participantIdsByMyRoomId });
        };
        makeAutoObservable(this);
    }
    // ==== Fields ==== //
    get roomId() {
        return this._roomId;
    }
    get roomChatIds() {
        return this._roomChatIds;
    }
    get rooms() {
        return this._rooms;
    }
    get participantIdsByRoomIdMap() {
        return this._participantIdsByRoomIdMap;
    }
    get countdownSec() {
        return this._countdownSec;
    }
    get timeoutMs() {
        return this._timeoutMs;
    }
    // ==== Computed ==== //
    get anyRoomIsActive() {
        return Object.values(this.rooms)
            .filter((room) => room.id !== null)
            .some((room) => room.active);
    }
    get isInNotMainRoom() {
        return this.roomId !== ROOM_MAIN_ID && this.anyRoomIsActive;
    }
    get myRoom() {
        return this.roomId ? this.rooms[this.roomId] : undefined;
    }
    get roomNames() {
        let roomNames = objectMap(this.rooms, ({ name }) => name);
        return new Set(roomNames);
    }
    get isRoomsActivated() {
        return objectSome(this.rooms, (room) => room.active);
    }
    get roomsCount() {
        return Object.values(this.rooms).length;
    }
    get stringMyRoomId() {
        return roomIdToString(this.roomId);
    }
    get participantIdsByMyRoomId() {
        return this.participantIdsByRoomIdMap[this.stringMyRoomId] ?? [];
    }
    get roomsArray() {
        return Object.values(this.rooms);
    }
    get roomsIdsArray() {
        return this.roomsArray.map((room) => room.id);
    }
};
RoomsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], RoomsService);
export { RoomsService };
//# sourceMappingURL=RoomsService.js.map