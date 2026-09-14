import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { RoomsService } from '../../features/rooms';
import { makeAutoObservable } from 'mobx';
let TranslationShareModel = class TranslationShareModel {
    constructor(props, roomsService) {
        this.props = props;
        this.roomsService = roomsService;
        makeAutoObservable(this);
    }
    get roomId() {
        return this.roomsService.roomId;
    }
    get onBack() {
        return this.props.current.onBack;
    }
    get linkExtractor() {
        return this.props.current.linkExtractor;
    }
};
TranslationShareModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RoomsService])
], TranslationShareModel);
export const { Provider: TranslationShareProvider, useModel: useTranslationShareModel } = createProvider(TranslationShareModel);
//# sourceMappingURL=model.js.map