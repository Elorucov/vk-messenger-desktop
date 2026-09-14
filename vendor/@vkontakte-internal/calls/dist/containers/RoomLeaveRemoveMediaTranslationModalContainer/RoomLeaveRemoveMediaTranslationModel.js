import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { RoomHandlersService, RoomsService } from '../../features/rooms';
import { WatchTogetherActionsService } from '../../features/watchTogether/services/WatchTogetherActionsService';
import { WatchTogetherService } from '../../features/watchTogether/services/WatchTogetherService';
import { PinnedParticipantService } from '../../services/PinnedParticipantService';
let RoomLeaveRemoveMediaTranslationModel = class RoomLeaveRemoveMediaTranslationModel {
    constructor(props, roomsService, roomHandlersService, watchTogetherService, watchTogetherActionsService, pinnedParticipantService) {
        this.props = props;
        this.roomsService = roomsService;
        this.roomHandlersService = roomHandlersService;
        this.watchTogetherService = watchTogetherService;
        this.watchTogetherActionsService = watchTogetherActionsService;
        this.pinnedParticipantService = pinnedParticipantService;
        this.removeMovie = (movieId) => {
            return this.watchTogetherActionsService.handleRemoveMovie(movieId, () => {
                this.watchTogetherService.clear();
                this.pinnedParticipantService.clearWatchTogetherPinnedParticipant();
            });
        };
        makeAutoObservable(this);
    }
    get roomId() {
        return this.roomsService.roomId;
    }
    get isChild() {
        return this.props.current.isChild;
    }
    get movieInfo() {
        return this.watchTogetherService.movieInfo;
    }
};
RoomLeaveRemoveMediaTranslationModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RoomsService,
        RoomHandlersService,
        WatchTogetherService,
        WatchTogetherActionsService,
        PinnedParticipantService])
], RoomLeaveRemoveMediaTranslationModel);
export const { Provider: RoomLeaveRemoveMediaTranslationProvider, useModel: useRoomLeaveRemoveMediaTranslationModel, } = createProvider(RoomLeaveRemoveMediaTranslationModel);
//# sourceMappingURL=RoomLeaveRemoveMediaTranslationModel.js.map