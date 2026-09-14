import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { RoomsService } from '../../features/rooms';
import { makeAutoObservable } from 'mobx';
let TranslationStartCountdownModel = class TranslationStartCountdownModel {
    constructor(roomsService) {
        this.roomsService = roomsService;
        makeAutoObservable(this);
    }
    get roomId() {
        return this.roomsService.roomId;
    }
};
TranslationStartCountdownModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [RoomsService])
], TranslationStartCountdownModel);
export const { Provider: TranslationStartCountdownProvider, useModel: useTranslationStartCountdownModel } = createProvider(TranslationStartCountdownModel);
//# sourceMappingURL=model.js.map