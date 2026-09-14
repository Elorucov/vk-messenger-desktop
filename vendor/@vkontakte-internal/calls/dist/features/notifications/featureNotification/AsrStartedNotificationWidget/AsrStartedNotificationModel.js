import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { AsrService } from '../../../../services/asr';
import { makeAutoObservable } from 'mobx';
let AsrStartedNotificationModel = class AsrStartedNotificationModel {
    constructor(asrService) {
        this.asrService = asrService;
        makeAutoObservable(this);
    }
    get asrOwnerExternalId() {
        return this.asrService.asrOwnerExternalId;
    }
    get asrOwner() {
        return this.asrService.asrOwner;
    }
};
AsrStartedNotificationModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [AsrService])
], AsrStartedNotificationModel);
export { AsrStartedNotificationModel };
export const { Provider: AsrStartedNotificationModelProvider, useModel: useAsrStartedNotificationModel } = createProvider(AsrStartedNotificationModel);
//# sourceMappingURL=AsrStartedNotificationModel.js.map