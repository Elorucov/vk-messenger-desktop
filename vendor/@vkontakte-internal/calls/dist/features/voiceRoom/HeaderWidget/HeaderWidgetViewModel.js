import { __decorate, __metadata } from "tslib";
import { SpeakersTexts } from '../../callHeader/models/SpeakersTexts';
import { makeAutoObservable } from 'mobx';
import { createProvider, scope } from '@vkontakte-internal/di';
let HeaderWidgetViewModel = class HeaderWidgetViewModel {
    constructor(speakersTexts) {
        this.speakersTexts = speakersTexts;
        makeAutoObservable(this);
    }
    get speakersInHeader() {
        return this.speakersTexts.speakersInHeader;
    }
};
HeaderWidgetViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [SpeakersTexts])
], HeaderWidgetViewModel);
export { HeaderWidgetViewModel };
export const { Provider: HeaderWidgetViewModelProvider, useModel: useHeaderWidgetViewModel } = createProvider(HeaderWidgetViewModel, { isolatedContext: false, onlyTransient: false });
//# sourceMappingURL=HeaderWidgetViewModel.js.map