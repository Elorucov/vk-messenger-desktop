import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { getActiveVoiceRoomDevices } from '../../../helpers/participantVoiceRoom';
import { StateBridge } from '../../../utils/stateBridge';
import { RoomsService } from '../../rooms';
let VoiceRoomSpeakersService = class VoiceRoomSpeakersService {
    constructor(stateBridge, roomsService) {
        this.stateBridge = stateBridge;
        this.roomsService = roomsService;
        makeAutoObservable(this);
    }
    get activeSpeakers() {
        const { devices, participants, localDevice, externalId, restrictedConversation } = this.stateBridge;
        return getActiveVoiceRoomDevices({
            devices,
            participants,
            roomId: this.roomsService.roomId,
            participantIdsByMyRoomId: this.roomsService.participantIdsByMyRoomId,
            localDevice,
            externalId,
            restrictedConversation,
        }).activeDevices;
    }
};
VoiceRoomSpeakersService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge,
        RoomsService])
], VoiceRoomSpeakersService);
export { VoiceRoomSpeakersService };
//# sourceMappingURL=VoiceRoomSpeakersService.js.map