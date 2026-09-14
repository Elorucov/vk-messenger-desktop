import { __decorate, __metadata } from "tslib";
import { createProvider, scope, destroy } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { ClickHouseService } from '../../../../services/shared/ClickHouseService';
import { RoomHandlersService, RoomsService } from '../../services';
import { TimerService } from '../../services/TimerService';
import { LocalDeviceService } from '../../../../services/localDevice';
import { ModalService } from '../../../../services/modal';
import { ClickHouseEventType, ModalType, NotificationType, RoomChooseMode, } from '@vkontakte-internal/calls-core';
import { objectMap } from '../../../../helpers/helpers';
import { E_ACTION } from '../../../../constants';
import { CallsSdkService } from '../../../../services/sdk';
import { StateBridge } from '../../../../utils/stateBridge';
let RoomStatusModel = class RoomStatusModel {
    constructor(clickHouseService, roomsService, roomHandlersService, timer, localDeviceService, sdkService, stateBridge, modalService) {
        this.clickHouseService = clickHouseService;
        this.roomsService = roomsService;
        this.roomHandlersService = roomHandlersService;
        this.timer = timer;
        this.localDeviceService = localDeviceService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.modalService = modalService;
        this.chooseRoom = () => {
            this.modalService.openModal(ModalType.ROOM_CHOOSE, {
                mode: this.localDeviceService.canChooseRoomAsAdmin ? RoomChooseMode.HELP : RoomChooseMode.ALL,
            });
        };
        this.onRoomRequestHelp = () => {
            this.modalService.openModal(ModalType.ROOM_REQUEST_HELP);
        };
        this.onEnterRoom = () => {
            if (this.localDeviceService.roomIdToReturn) {
                this.roomHandlersService.switchRoom(this.localDeviceService.roomIdToReturn);
            }
        };
        this.handleCloseRooms = () => {
            const roomIds = objectMap(this.roomsService.rooms, (room) => room.id);
            this.sdkService.getSdk().removeRooms(roomIds);
            this.modalService.closeModal();
            this.closeTimerFinishedDialog();
            this.clickHouseService.sendStats(ClickHouseEventType.SESSION_ROOMS_CLOSED);
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.ROOMS_CLOSED,
                },
            });
        };
        makeAutoObservable(this);
    }
    [destroy]() {
        this.timer.clear();
    }
    get myRoom() {
        return this.roomsService.myRoom;
    }
    get roomIdToReturn() {
        return this.localDeviceService.roomIdToReturn;
    }
    get canChooseRoomAsAdmin() {
        return this.localDeviceService.canChooseRoomAsAdmin;
    }
    get sendStats() {
        return this.clickHouseService.sendStats;
    }
    get timeLeft() {
        return this.timer.timeLeft;
    }
    get timerWarning() {
        return this.timer.timerWarning;
    }
    get timerFinishedDialog() {
        return this.timer.timerFinishedDialog;
    }
    get closeTimerFinishedDialog() {
        return this.timer.closeTimerFinishedDialog;
    }
};
RoomStatusModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [ClickHouseService,
        RoomsService,
        RoomHandlersService,
        TimerService,
        LocalDeviceService,
        CallsSdkService,
        StateBridge,
        ModalService])
], RoomStatusModel);
export const { Provider: RoomStatusProvider, useModel: useRoomStatusModel } = createProvider(RoomStatusModel);
//# sourceMappingURL=RoomStatusModel.js.map