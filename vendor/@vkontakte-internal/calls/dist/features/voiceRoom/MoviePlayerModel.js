import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { WatchTogetherActionsService } from '../watchTogether/services/WatchTogetherActionsService';
import { WatchTogetherService } from '../watchTogether/services/WatchTogetherService';
import { DevicesService } from '../../services/devices';
import { WatchTogetherPermissionService } from '../watchTogether/services/WatchTogetherPermissionService';
import { LocalDeviceService } from '../../services/localDevice';
let MoviePlayerModel = class MoviePlayerModel {
    constructor(watchTogetherActionsService, watchTogetherService, watchTogetherPermissionService, devicesService, localDeviceService) {
        this.watchTogetherActionsService = watchTogetherActionsService;
        this.watchTogetherService = watchTogetherService;
        this.watchTogetherPermissionService = watchTogetherPermissionService;
        this.devicesService = devicesService;
        this.localDeviceService = localDeviceService;
        makeAutoObservable(this);
    }
    get movieState() {
        return this.watchTogetherService.movieState;
    }
    get watchTogetherDevice() {
        if (!this.watchTogetherService.owner) {
            return null;
        }
        return this.devicesService.getDeviceByExternalId(this.watchTogetherService.owner);
    }
    get isMeCanManageWatchTogether() {
        return this.watchTogetherPermissionService.isMeCanManageWatchTogether;
    }
    get isMovieOwner() {
        return this.localDeviceService.isMovieOwner;
    }
};
MoviePlayerModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [WatchTogetherActionsService,
        WatchTogetherService,
        WatchTogetherPermissionService,
        DevicesService,
        LocalDeviceService])
], MoviePlayerModel);
export { MoviePlayerModel };
export const { Provider, useModel } = createProvider(MoviePlayerModel);
//# sourceMappingURL=MoviePlayerModel.js.map