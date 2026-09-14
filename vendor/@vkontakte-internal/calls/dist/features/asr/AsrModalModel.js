import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { AsrService } from '../../services/asr';
let AsrModalModel = class AsrModalModel {
    constructor(asrService) {
        this.asrService = asrService;
        this.startAsr = (name) => {
            return this.asrService.startAsr(name);
        };
        this.stopAsr = () => {
            return this.asrService.stopAsr();
        };
        makeAutoObservable(this);
    }
    get asr() {
        return this.asrService.asr;
    }
};
AsrModalModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [AsrService])
], AsrModalModel);
export { AsrModalModel };
export const { Provider: AsrModalModelProvider, useModel: useAsrModalModel } = createProvider(AsrModalModel);
//# sourceMappingURL=AsrModalModel.js.map