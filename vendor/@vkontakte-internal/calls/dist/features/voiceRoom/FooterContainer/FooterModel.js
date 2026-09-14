import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { DevicesService } from '../../../services/devices';
import { makeAutoObservable } from 'mobx';
import { VoiceRoomCallService } from '../services/VoiceRoomCallService';
let Model = class Model {
    constructor(devicesService, voiceRoomCallService) {
        this.devicesService = devicesService;
        this.voiceRoomCallService = voiceRoomCallService;
        this.leaveCall = () => this.voiceRoomCallService.leaveCall();
        makeAutoObservable(this);
    }
    get activeDevicesCount() {
        return this.devicesService.voiceRoomActiveDevicesCount;
    }
};
Model = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [DevicesService,
        VoiceRoomCallService])
], Model);
export const { Provider, useModel } = createProvider(Model);
//# sourceMappingURL=FooterModel.js.map