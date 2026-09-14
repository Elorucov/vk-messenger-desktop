import { __decorate, __metadata } from "tslib";
import { createProvider, destroy, scope } from '@vkontakte-internal/di';
import { makeAutoObservable, reaction } from 'mobx';
import { CallService } from '../../../services/call';
import { VmojiService } from '../../../services/vmoji';
import { VoiceRoomCallService } from '../services/VoiceRoomCallService';
import { VoiceRoomSpeakersService } from '../services/VoiceRoomSpeakersService';
let VoiceRoomCallModel = class VoiceRoomCallModel {
    constructor(callService, speakersService, voiceRoomCallService, vmojiService) {
        this.callService = callService;
        this.speakersService = speakersService;
        this.voiceRoomCallService = voiceRoomCallService;
        this.vmojiService = vmojiService;
        this.leaveCall = () => this.voiceRoomCallService.leaveCall();
        makeAutoObservable(this);
        this.disposeVmojiLoadingReaction = reaction(() => this.speakersService.activeSpeakers, (activeSpeakers) => {
            void this.vmojiService.loadMultipleSvg(activeSpeakers.map((device) => device.externalId));
        });
    }
    get activeSpeakers() {
        return this.speakersService.activeSpeakers;
    }
    get canFinishCall() {
        return this.callService.canFinishCall;
    }
    get canTransferAdminRights() {
        return this.callService.canTransferAdminRights;
    }
    [destroy]() {
        this.disposeVmojiLoadingReaction();
    }
};
VoiceRoomCallModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CallService,
        VoiceRoomSpeakersService,
        VoiceRoomCallService,
        VmojiService])
], VoiceRoomCallModel);
export { VoiceRoomCallModel };
export const { Provider, useModel } = createProvider(VoiceRoomCallModel);
//# sourceMappingURL=VoiceRoomCallModel.js.map