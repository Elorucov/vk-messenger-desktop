import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { RoomsService } from '../../features/rooms';
import { makeAutoObservable } from 'mobx';
let TranslationStatusContainerModel = class TranslationStatusContainerModel {
    constructor(roomsService) {
        this.roomsService = roomsService;
        makeAutoObservable(this);
    }
    get roomId() {
        return this.roomsService.roomId;
    }
};
TranslationStatusContainerModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [RoomsService])
], TranslationStatusContainerModel);
export const { Provider: TranslationStatusContainerProvider, useModel: useTranslationStatusContainerModel } = createProvider(TranslationStatusContainerModel);
//# sourceMappingURL=model.js.map