import { __decorate, __metadata } from "tslib";
import { createProvider, scope, Props } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { RoomHandlersService, RoomsService } from '../../services';
let RoomHelpRequestedModel = class RoomHelpRequestedModel {
    constructor(props, roomsService, roomHandlersService) {
        this.props = props;
        this.roomsService = roomsService;
        this.roomHandlersService = roomHandlersService;
        makeAutoObservable(this);
    }
    get rooms() {
        return this.roomsService.rooms;
    }
    get externalId() {
        return this.props.current.externalId;
    }
};
RoomHelpRequestedModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RoomsService,
        RoomHandlersService])
], RoomHelpRequestedModel);
export const { Provider: RoomHelpRequestedProvider, useModel: useRoomHelpRequestedModel } = createProvider(RoomHelpRequestedModel);
//# sourceMappingURL=RoomHelpRequestedModel.js.map