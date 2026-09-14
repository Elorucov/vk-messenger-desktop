import { __decorate, __metadata } from "tslib";
import { createProvider, scope, Props } from '@vkontakte-internal/di';
import { RoomsService } from '../../features/rooms';
import { makeAutoObservable } from 'mobx';
let CallSubtitlesButtonModel = class CallSubtitlesButtonModel {
    constructor(roomsService, props) {
        this.roomsService = roomsService;
        this.props = props;
        makeAutoObservable(this);
    }
    get roomId() {
        return this.roomsService.roomId;
    }
};
CallSubtitlesButtonModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [RoomsService,
        Props])
], CallSubtitlesButtonModel);
export const { Provider: TranslationCreateProvider, useModel: useTranslationCreateModel } = createProvider(CallSubtitlesButtonModel);
//# sourceMappingURL=TranslationCreateModel.js.map