import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { createProvider, scope } from '@vkontakte-internal/di';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
let CallRecordsSectionModel = class CallRecordsSectionModel {
    constructor(rightMenuSpinnerService) {
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.hideLoading = () => {
            this.rightMenuSpinnerService.hide();
        };
        makeAutoObservable(this);
    }
};
CallRecordsSectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [RightMenuSpinnerService])
], CallRecordsSectionModel);
export { CallRecordsSectionModel };
export const { Provider: CallRecordsSectionModelProvider, useModel: useCallRecordsSectionModel } = createProvider(CallRecordsSectionModel);
//# sourceMappingURL=CallRecordsSectionModel.js.map