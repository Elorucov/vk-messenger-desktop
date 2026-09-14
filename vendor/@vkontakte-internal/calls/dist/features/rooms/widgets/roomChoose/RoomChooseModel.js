import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../../../../utils/stateBridge';
import { objectReduce } from '../../../../helpers/helpers';
import { getIsHelpRequested } from '../../../../helpers/participant';
import { findRelatedRoom, RoomHandlersService, RoomsService } from '../../../../features/rooms';
import { modalHasType, ModalType, RoomChooseMode } from '@vkontakte-internal/calls-core';
import { ModalService } from '../../../../services/modal';
let RoomChooseModel = class RoomChooseModel {
    constructor(stateBridge, roomsService, roomHandlersService, modalService) {
        this.stateBridge = stateBridge;
        this.roomsService = roomsService;
        this.roomHandlersService = roomHandlersService;
        this.modalService = modalService;
        this.switchRoom = (roomId) => {
            this.roomHandlersService.switchRoom(roomId, false, () => {
                this.modalService.forceCloseModal();
            });
        };
        makeAutoObservable(this);
    }
    get roomsArray() {
        return this.roomsService.roomsArray;
    }
    get participantIdsByRoomIdMap() {
        return this.roomsService.participantIdsByRoomIdMap;
    }
    get roomIdsWithDrat() {
        const { devices } = this.stateBridge;
        const { rooms } = this.roomsService;
        return objectReduce(devices, (acc, device) => {
            if (getIsHelpRequested(device)) {
                const room = findRelatedRoom(device.externalId, rooms);
                if (room) {
                    acc.add(room.id);
                }
            }
            return acc;
        }, new Set());
    }
    get isHelpMode() {
        const { modal } = this.stateBridge;
        return modalHasType(modal, ModalType.ROOM_CHOOSE) && modal.details.mode === RoomChooseMode.HELP;
    }
};
RoomChooseModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        RoomsService,
        RoomHandlersService,
        ModalService])
], RoomChooseModel);
export const { Provider: RoomChooseProvider, useModel: useRoomChooseModel } = createProvider(RoomChooseModel);
//# sourceMappingURL=RoomChooseModel.js.map