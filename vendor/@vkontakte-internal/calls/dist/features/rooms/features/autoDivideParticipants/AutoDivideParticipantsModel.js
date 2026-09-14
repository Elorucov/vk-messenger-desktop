import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../../../../utils/stateBridge';
import { ClickHouseService } from '../../../../services/shared/ClickHouseService';
import { ROOMS_MAX_PARTICIPANTS_COUNT } from '../../../../constants';
import { getDevicesToDivideInMainRoom, isEmpty, ClickHouseEventType, } from '@vkontakte-internal/calls-core';
import { updateRooms } from '@vkontakte/calls-sdk';
import { RoomsService } from '../../services';
let AutoDivideParticipantsModel = class AutoDivideParticipantsModel {
    constructor(props, stateBridge, clickHouseService, roomsService) {
        this.props = props;
        this.stateBridge = stateBridge;
        this.clickHouseService = clickHouseService;
        this.roomsService = roomsService;
        this.handleAutoDivide = () => {
            this.onCloseDialog();
            if (isEmpty(this.rooms) || isEmpty(this.devicesToDivideInMainRoom.listDeviceToDivideExternalIds)) {
                return;
            }
            const roomsCount = Object.keys(this.rooms).length;
            const participantPerRoom = Math.min(ROOMS_MAX_PARTICIPANTS_COUNT, Math.floor(this.devicesToDivideInMainRoom.countNotAdminDevices / roomsCount));
            const listRooms = Object.values(this.rooms);
            const roomUpdates = new Map();
            // Заполняем комнаты
            const externalIds = [...this.devicesToDivideInMainRoom.listDeviceToDivideExternalIds];
            listRooms.forEach((room) => {
                const countInRoom = room.participantIds.length;
                if (countInRoom >= participantPerRoom) {
                    return;
                }
                const addParticipantIds = externalIds.splice(0, participantPerRoom - countInRoom);
                roomUpdates.set(room.id, {
                    id: room.id,
                    addParticipantIds,
                });
            });
            // Распределяем оставшихся участников
            let roomIndex = 0;
            for (const externalId of externalIds) {
                const room = listRooms[roomIndex];
                const update = roomUpdates.get(room.id);
                if (!update) {
                    roomUpdates.set(room.id, {
                        id: room.id,
                        addParticipantIds: [externalId],
                    });
                }
                else {
                    update.addParticipantIds.push(externalId);
                }
                roomIndex = (roomIndex + 1) % listRooms.length;
            }
            if (roomUpdates.size) {
                updateRooms([...roomUpdates.values()]);
                this.clickHouseService.sendStats(ClickHouseEventType.SESSION_ROOMS_AUTO_ALLOCATION);
            }
        };
        makeAutoObservable(this);
    }
    get onCloseDialog() {
        return this.props.current.onCloseDialog;
    }
    get rooms() {
        return this.roomsService.rooms;
    }
    get devicesToDivideInMainRoom() {
        return getDevicesToDivideInMainRoom({
            rooms: this.roomsService.rooms,
            devices: this.stateBridge.devices,
            participants: this.stateBridge.participants,
        });
    }
};
AutoDivideParticipantsModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        StateBridge,
        ClickHouseService,
        RoomsService])
], AutoDivideParticipantsModel);
export const { Provider: AutoDivideParticipantsProvider, useModel: useAutoDivideParticipantsModel } = createProvider(AutoDivideParticipantsModel);
//# sourceMappingURL=AutoDivideParticipantsModel.js.map