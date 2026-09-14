import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../../utils/stateBridge';
import { RoomsService } from '../rooms';
import { AdminMessagesController } from './AdminMessagesController';
let AdminMessagesModel = class AdminMessagesModel {
    constructor(stateBridge, roomsService) {
        this.stateBridge = stateBridge;
        this.roomsService = roomsService;
        this.handleRemove = (message) => {
            this.adminMessagesController.delete(message);
        };
        this.adminMessagesController = AdminMessagesController.getInstance();
        makeAutoObservable(this);
    }
    get isCallCollapsed() {
        return this.stateBridge.isCallCollapsed;
    }
    get canShowMessages() {
        return this.roomsService.isInNotMainRoom;
    }
    get messages() {
        return this.adminMessagesController.messages;
    }
    /**
     * Старые выше новых
     * Но в самом низу всегда самое новое
     */
    get messagesToShow() {
        const { isCallFullscreen } = this.stateBridge;
        return [...this.messages].slice(isCallFullscreen ? -7 : -4);
    }
    get shouldShowMessages() {
        return this.canShowMessages && this.messages.size > 0;
    }
    clear() {
        this.adminMessagesController.clear();
    }
};
AdminMessagesModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [StateBridge,
        RoomsService])
], AdminMessagesModel);
export { AdminMessagesModel };
export const { Provider: AdminMessagesModelProvider, useModel: useAdminMessagesModel } = createProvider(AdminMessagesModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=AdminMessagesModel.js.map