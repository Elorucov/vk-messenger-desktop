import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { AsrService } from '../../services/asr';
let AsrStatusModel = class AsrStatusModel {
    constructor(asrService) {
        this.asrService = asrService;
        this.toggleAsrPopup = () => {
            this.asrService.toggleAsrPopup();
        };
        makeAutoObservable(this);
    }
    get asrOwner() {
        return this.asrService.asrOwner;
    }
    get isMeCanManageAsr() {
        return this.asrService.isMeCanManageAsr;
    }
    get asrState() {
        return this.asrService.asr;
    }
};
AsrStatusModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [AsrService])
], AsrStatusModel);
export { AsrStatusModel };
export const { Provider: AsrStatusModelProvider, useModel: useAsrStatusModel } = createProvider(AsrStatusModel);
//# sourceMappingURL=AsrStatusModel.js.map