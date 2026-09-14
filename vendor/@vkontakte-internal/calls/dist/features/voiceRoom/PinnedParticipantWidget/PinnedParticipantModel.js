import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { externalIdToString, isSameExternalId, } from '@vkontakte-internal/calls-core';
import { PinnedParticipantService } from '../../../services/PinnedParticipantService';
import { StateBridge } from '../../../utils/stateBridge';
import { LocalDeviceService } from '../../../services/localDevice';
import { DevicesService } from '../../../services/devices';
let VoiceRoomPinnedParticipantModel = class VoiceRoomPinnedParticipantModel {
    constructor(stateBridge, localDeviceService, devicesService, pinnedParticipantService) {
        this.stateBridge = stateBridge;
        this.localDeviceService = localDeviceService;
        this.devicesService = devicesService;
        this.pinnedParticipantService = pinnedParticipantService;
        makeAutoObservable(this);
    }
    get pinnedUser() {
        let participant = null;
        let device = null;
        const externalId = this.pinnedParticipantService.pinnedParticipant;
        if (externalId) {
            const isMe = isSameExternalId(externalId, this.localDeviceService.externalId);
            const deviceId = externalIdToString(externalId);
            device = isMe
                ? {
                    ...this.localDeviceService.device,
                    externalId,
                }
                : this.devicesService.devices[deviceId];
            participant =
                isMe && this.stateBridge.meGroup
                    ? this.stateBridge.meGroup
                    : this.stateBridge.participants[externalId.id];
        }
        return {
            externalId,
            participant,
            device,
        };
    }
    get setPinnedParticipant() {
        return this.pinnedParticipantService.setPinnedParticipant;
    }
};
VoiceRoomPinnedParticipantModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        LocalDeviceService,
        DevicesService,
        PinnedParticipantService])
], VoiceRoomPinnedParticipantModel);
export { VoiceRoomPinnedParticipantModel };
export const { Provider, useModel } = createProvider(VoiceRoomPinnedParticipantModel);
//# sourceMappingURL=PinnedParticipantModel.js.map