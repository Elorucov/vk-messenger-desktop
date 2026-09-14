import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { StreamActionSettingsService } from '../../../services/streamActionSettings';
import { makeAutoObservable } from 'mobx';
let RecordStatusModel = class RecordStatusModel {
    constructor(streamActionSettingsService) {
        this.streamActionSettingsService = streamActionSettingsService;
        this.getRecordActionSettings = () => {
            return this.streamActionSettingsService.getRecordSettings(true);
        };
        makeAutoObservable(this);
    }
};
RecordStatusModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StreamActionSettingsService])
], RecordStatusModel);
export { RecordStatusModel };
export const { Provider: RecordStatusModelProvider, useModel: useRecordStatusModel } = createProvider(RecordStatusModel);
//# sourceMappingURL=RecordStatusModel.js.map