import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../../../utils/stateBridge';
import { getVoiceRoomPromotionRequests, getVoiceRoomPromotionRequestsTotalCount } from '../selectors';
import { PromotionRequestsService } from '../services';
let PromotionRequestsModel = class PromotionRequestsModel {
    constructor(promotionRequestsService, stateBridge) {
        this.promotionRequestsService = promotionRequestsService;
        this.stateBridge = stateBridge;
        makeAutoObservable(this);
        this.loadData();
    }
    get voiceRoom() {
        return this.stateBridge.voiceRoom;
    }
    get promotionRequests() {
        return getVoiceRoomPromotionRequests({ voiceRoom: this.voiceRoom });
    }
    get totalCount() {
        return getVoiceRoomPromotionRequestsTotalCount({ voiceRoom: this.voiceRoom });
    }
    loadData() {
        this.promotionRequestsService.fullUpdate();
    }
};
PromotionRequestsModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [PromotionRequestsService,
        StateBridge])
], PromotionRequestsModel);
export { PromotionRequestsModel };
export const { Provider, useModel } = createProvider(PromotionRequestsModel);
//# sourceMappingURL=PromotionRequestsModel.js.map