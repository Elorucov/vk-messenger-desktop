import { __decorate, __metadata } from "tslib";
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { DevicesService } from '../../services/devices';
import { PermissionsService } from '../../services/permissions';
import { StateBridge } from '../../utils/stateBridge';
let CallMiniViewModel = class CallMiniViewModel {
    constructor(_props, devicesService, permissionsService, stateBridge) {
        this._props = _props;
        this.devicesService = devicesService;
        this.permissionsService = permissionsService;
        this.stateBridge = stateBridge;
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get localDevice() {
        return this.stateBridge.localDevice;
    }
    get isAudioAllowed() {
        return this.permissionsService.isMediaAllowed('audio', this.localDevice);
    }
    get isVideoAllowed() {
        return this.permissionsService.isMediaAllowed('video', this.localDevice);
    }
    get isScreenSharingAllowed() {
        return this.permissionsService.isMediaAllowed('screenSharing', this.localDevice);
    }
    get visibleDevicesStreamData() {
        return this.devicesService.visibleParticipantStreamData;
    }
};
CallMiniViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        DevicesService,
        PermissionsService,
        StateBridge])
], CallMiniViewModel);
export { CallMiniViewModel };
export const { Provider, useModel } = createProvider(CallMiniViewModel);
//# sourceMappingURL=CallMiniViewModel.js.map