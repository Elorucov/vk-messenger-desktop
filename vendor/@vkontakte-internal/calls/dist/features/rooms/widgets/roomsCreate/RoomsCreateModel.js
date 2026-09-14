import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { getRoomsNames, ClickHouseEventType } from '@vkontakte-internal/calls-core';
import { ClickHouseService } from '../../../../services/shared/ClickHouseService';
import { RoomsService } from '../../services';
let RoomsCreateModel = class RoomsCreateModel {
    constructor(clickHouseService, roomsService) {
        this.clickHouseService = clickHouseService;
        this.roomsService = roomsService;
        this.setRoomsCountdown = (countdownSec) => {
            this.roomsService.setCountdown({ countdownSec });
        };
        this.resetRoomsTimer = () => {
            return this.roomsService.resetTimer();
        };
        this.sendAutoAllocationEvent = () => {
            this.clickHouseService.sendStats(ClickHouseEventType.SESSION_ROOMS_AUTO_ALLOCATION);
        };
        makeAutoObservable(this);
    }
    get rooms() {
        return this.roomsService.rooms;
    }
    get roomsCountdownSec() {
        return this.roomsService.countdownSec;
    }
    get roomsNames() {
        return getRoomsNames(this.roomsService.rooms);
    }
};
RoomsCreateModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [ClickHouseService,
        RoomsService])
], RoomsCreateModel);
const { Provider: RoomsCreateProvider, useModel: useRoomsCreateModel } = createProvider(RoomsCreateModel);
export { RoomsCreateProvider, useRoomsCreateModel };
//# sourceMappingURL=RoomsCreateModel.js.map