import { __decorate, __metadata } from "tslib";
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { WatchTogetherActionsService } from '../../features/watchTogether/services/WatchTogetherActionsService';
import { WatchTogetherPermissionService } from '../../features/watchTogether/services/WatchTogetherPermissionService';
import { LocalDeviceService } from '../../services/localDevice';
let CallOratorMainModel = class CallOratorMainModel {
    constructor(_props, watchTogetherActionsService, watchTogetherPermissionService, localDeviceService) {
        this._props = _props;
        this.watchTogetherActionsService = watchTogetherActionsService;
        this.watchTogetherPermissionService = watchTogetherPermissionService;
        this.localDeviceService = localDeviceService;
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get isMeCanManageWatchTogether() {
        return this.watchTogetherPermissionService.isMeCanManageWatchTogether;
    }
    get isMovieOwner() {
        return this.localDeviceService.isMovieOwner;
    }
};
CallOratorMainModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        WatchTogetherActionsService,
        WatchTogetherPermissionService,
        LocalDeviceService])
], CallOratorMainModel);
export { CallOratorMainModel };
export const { Provider, useModel } = createProvider(CallOratorMainModel);
//# sourceMappingURL=CallOratorMainModel.js.map