import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { CallService } from '../../../services/call';
let VoiceRoomCallService = class VoiceRoomCallService {
    constructor(callService) {
        this.callService = callService;
    }
    leaveCall() {
        this.callService.leaveCall(false);
    }
};
VoiceRoomCallService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallService])
], VoiceRoomCallService);
export { VoiceRoomCallService };
//# sourceMappingURL=VoiceRoomCallService.js.map