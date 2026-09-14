import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope, destroy } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { ClickHouseEventType, NotificationType, ModalType, } from '@vkontakte-internal/calls-core';
import { ClickHouseService } from '../../../../services/shared/ClickHouseService';
import { RoomHandlersService, RoomsService } from '../../services';
import { DevicesService } from '../../../../services/devices/DevicesService';
import { TimerService } from '../../services/TimerService';
import { E_ACTION } from '../../../../constants';
import { StateBridge } from '../../../../utils/stateBridge';
import { CallsSdkService } from '../../../../services/sdk';
import { changeParticipantRoom } from '../../helpers';
import { ModalService } from '../../../../services/modal';
let RoomControlModel = class RoomControlModel {
    constructor(props, roomsService, roomHandlersService, clickHouseService, devicesService, timer, stateBridge, sdkService, modalService) {
        this.props = props;
        this.roomsService = roomsService;
        this.roomHandlersService = roomHandlersService;
        this.clickHouseService = clickHouseService;
        this.devicesService = devicesService;
        this.timer = timer;
        this.stateBridge = stateBridge;
        this.sdkService = sdkService;
        this.modalService = modalService;
        this._chosenRoomId = null;
        this._searchQuery = '';
        this.getCountParticipantsByRooms = (roomId) => {
            return this.devicesService.getCountParticipantsByRooms(roomId);
        };
        this.setSearchQuery = (value) => {
            this._searchQuery = value;
        };
        this.handleOpenRooms = async () => {
            if (!this.roomsService.roomsCount) {
                return;
            }
            await this.props.current.timerController.immediatelyCommitCountdown();
            this.props.current.timerController.resetTimer();
            const roomIds = Object.values(this.roomsService.rooms).map((room) => room.id);
            await this.sdk.activateRooms(roomIds, false);
            this.props.current.onCloseMainDialog();
            this.stateBridge.dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.ROOMS_OPENED,
                },
            });
            this.clickHouseService.sendStats(ClickHouseEventType.SESSION_ROOMS_OPENED, {
                hall_count: roomIds.length,
            });
        };
        this.handleChangeParticipantRoom = (participantId, roomId) => {
            changeParticipantRoom(this.rooms, roomId, participantId, this.isRoomsActivated);
        };
        this.handleRoomChoose = (roomId) => {
            this._chosenRoomId = roomId;
        };
        this.handleMoveToRoom = (roomFromId, roomToId) => {
            roomFromId &&
                Promise.all(this.rooms[roomFromId].participantIds.map((id) => {
                    return this.sdk.switchRoom(roomToId, id);
                })).then(() => {
                    this.sdk.removeRooms([roomFromId]);
                });
        };
        this.removeRoom = (roomId) => {
            if (roomId === this._chosenRoomId) {
                this._chosenRoomId = null;
            }
            this.sdk.removeRooms([roomId]);
            // Если удалялась последняя комната, то выходим на окно создания залов
            if (this.roomsArray.length === 1) {
                this.modalService.openModal(ModalType.ROOM_CONTROL_CREATE);
            }
        };
        this.handleSwitchRoom = (roomId, confirmed = false) => {
            this.roomHandlersService.switchRoom(roomId, confirmed, this.props.current.onCloseMainDialog);
        };
        makeAutoObservable(this);
    }
    [destroy]() {
        this.timer.clear();
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
    get chosenRoomId() {
        return this._chosenRoomId;
    }
    get searchQuery() {
        return this._searchQuery;
    }
    get rooms() {
        return this.roomsService.rooms;
    }
    get isRoomsActivated() {
        return this.roomsService.isRoomsActivated;
    }
    get roomsCount() {
        return this.roomsService.roomsCount;
    }
    get timeLeft() {
        return this.timer.timeLeft;
    }
    get timerWarning() {
        return this.timer.timerWarning;
    }
    get roomsArray() {
        return this.roomsService.roomsArray;
    }
};
RoomControlModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RoomsService,
        RoomHandlersService,
        ClickHouseService,
        DevicesService,
        TimerService,
        StateBridge,
        CallsSdkService,
        ModalService])
], RoomControlModel);
export const { Provider: RoomControlProvider, useModel: useRoomControlModel } = createProvider(RoomControlModel);
//# sourceMappingURL=RoomControlModel.js.map