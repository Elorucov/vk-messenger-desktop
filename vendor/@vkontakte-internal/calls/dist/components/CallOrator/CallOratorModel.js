import { __decorate, __metadata } from "tslib";
import { isSameExternalId, } from '@vkontakte-internal/calls-core';
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { LocalDeviceService } from '../../services/localDevice';
import { DevicesService } from '../../services/devices';
import { PinnedParticipantService } from '../../services/PinnedParticipantService';
let CallOratorModel = class CallOratorModel {
    constructor(_props, localDeviceService, deviceService, pinnedParticipantService) {
        this._props = _props;
        this.localDeviceService = localDeviceService;
        this.deviceService = deviceService;
        this.pinnedParticipantService = pinnedParticipantService;
        this.setStreamMode = (streamMode) => {
            if (!this.oratorExternalId) {
                return;
            }
            if (isSameExternalId(this.localDeviceService.externalId, this.oratorExternalId)) {
                this.localDeviceService.setLocalDevice({ streamMode });
            }
            else {
                this.deviceService.throttleAccumulateDispatchParticipant(this.oratorExternalId, {
                    streamMode,
                });
            }
        };
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get oratorExternalId() {
        return this.pinnedParticipantService.firstMatchedId || this.localDeviceService.externalId;
    }
};
CallOratorModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        LocalDeviceService,
        DevicesService,
        PinnedParticipantService])
], CallOratorModel);
export { CallOratorModel };
export const { Provider, useModel } = createProvider(CallOratorModel);
//# sourceMappingURL=CallOratorModel.js.map