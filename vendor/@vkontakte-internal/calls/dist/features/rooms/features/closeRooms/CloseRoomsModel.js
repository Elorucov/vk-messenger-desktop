import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { ClickHouseEventType } from '@vkontakte-internal/calls-core';
import { ClickHouseService } from '../../../../services/shared/ClickHouseService';
import { objectMap } from '../../../../helpers/helpers';
import { removeRooms } from '@vkontakte/calls-sdk';
import { RoomsService } from '../../services';
let CloseRoomsModel = class CloseRoomsModel {
    constructor(_props, clickHouseService, roomsService) {
        this._props = _props;
        this.clickHouseService = clickHouseService;
        this.roomsService = roomsService;
        this.handleCloseRooms = () => {
            const roomIds = objectMap(this.roomsService.rooms, (room) => room.id);
            removeRooms(roomIds);
            this.props.onCloseRooms();
            this.clickHouseService.sendStats(ClickHouseEventType.SESSION_ROOMS_CLOSED);
        };
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get onCloseDialog() {
        return this.props.onCloseDialog;
    }
};
CloseRoomsModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        ClickHouseService,
        RoomsService])
], CloseRoomsModel);
export const { Provider: CloseRoomsProvider, useModel: useCloseRoomsModel } = createProvider(CloseRoomsModel);
//# sourceMappingURL=CloseRoomsModel.js.map