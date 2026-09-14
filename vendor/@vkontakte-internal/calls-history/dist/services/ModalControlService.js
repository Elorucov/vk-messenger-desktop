import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, observable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { ActiveModalType } from '../types';
import { CallEventType } from '@vkontakte-internal/vk-analytics-events';
import { CallHistoryAnalytics } from '../analytics';
let ModalControlService = class ModalControlService {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
        this.activeModal = null;
        makeAutoObservable(this, {
            activeModal: observable.ref,
        });
    }
    get currentModal() {
        return this.activeModal;
    }
    openModal(activeModal) {
        if (activeModal.type === ActiveModalType.BROADCASTS) {
            this.analyticsService.send(CallEventType.RECORD_HISTORY_OPENED, {
                group_id: activeModal.data.ownerId,
            });
        }
        this.activeModal = activeModal;
    }
    closeModal() {
        this.activeModal = null;
    }
};
ModalControlService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallHistoryAnalytics])
], ModalControlService);
export { ModalControlService };
//# sourceMappingURL=ModalControlService.js.map