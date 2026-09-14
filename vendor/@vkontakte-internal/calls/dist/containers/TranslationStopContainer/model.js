import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { RoomsService } from '../../features/rooms';
import { makeAutoObservable } from 'mobx';
let TranslationStopContainerModel = class TranslationStopContainerModel {
    constructor(roomsService) {
        this.roomsService = roomsService;
        makeAutoObservable(this);
    }
    get roomId() {
        return this.roomsService.roomId;
    }
};
TranslationStopContainerModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [RoomsService])
], TranslationStopContainerModel);
export const { Provider: TranslationStopContainerProvider, useModel: useTranslationStopContainerModel } = createProvider(TranslationStopContainerModel);
//# sourceMappingURL=model.js.map