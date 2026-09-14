import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { WatchTogetherService } from './WatchTogetherService';
import { StateBridge } from '../../../utils/stateBridge';
import { LocalDeviceService } from '../../../services/localDevice';
import { PermissionsService } from '../../../services/permissions';
import { isSameExternalId } from '@vkontakte-internal/calls-core';
let WatchTogetherPermissionService = class WatchTogetherPermissionService {
    constructor(stateBridge, localDeviceService, watchTogetherService, permissionsService) {
        this.stateBridge = stateBridge;
        this.localDeviceService = localDeviceService;
        this.watchTogetherService = watchTogetherService;
        this.permissionsService = permissionsService;
        makeAutoObservable(this);
    }
    get isMeCanManageWatchTogether() {
        return (this.localDeviceService.isMeAdmin ||
            (this.isWatchTogetherAllowed &&
                (!this.watchTogetherService.movieInfo ||
                    isSameExternalId(this.watchTogetherService.owner, this.localDeviceService.externalId))));
    }
    get isWatchTogetherAllowed() {
        return (this.localDeviceService.isMeAdmin ||
            (!this.stateBridge.onlyAdminCanShareMovie &&
                this.permissionsService.isMediaAllowed('movieSharing', this.localDeviceService.device)));
    }
};
WatchTogetherPermissionService = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        LocalDeviceService,
        WatchTogetherService,
        PermissionsService])
], WatchTogetherPermissionService);
export { WatchTogetherPermissionService };
//# sourceMappingURL=WatchTogetherPermissionService.js.map