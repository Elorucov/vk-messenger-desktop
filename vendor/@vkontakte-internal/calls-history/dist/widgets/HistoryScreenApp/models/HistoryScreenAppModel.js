import { __decorate, __metadata } from "tslib";
import { createProvider, destroy, init, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { ModalControlService } from '../../../services/ModalControlService';
import { QueueUpdateService } from '../../../services/QueueUpdateService';
import { SnackbarService } from '../../../services/SnackbarService';
let HistoryScreenAppViewModel = class HistoryScreenAppViewModel {
    constructor(modalService, queueUpdateService, snackbarService) {
        this.modalService = modalService;
        this.queueUpdateService = queueUpdateService;
        this.snackbarService = snackbarService;
        makeAutoObservable(this);
    }
    [init]() {
        this.queueUpdateService.start();
    }
    [destroy]() {
        this.queueUpdateService.stop();
    }
    get snackbars() {
        return this.snackbarService.snackbars;
    }
    hideSnackbar(id) {
        this.snackbarService.hide(id);
    }
    get currentModal() {
        return this.modalService.currentModal;
    }
};
HistoryScreenAppViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [ModalControlService,
        QueueUpdateService,
        SnackbarService])
], HistoryScreenAppViewModel);
export const { Provider: HistoryScreenAppModelProvider, useModel: useHistoryScreenAppModel } = createProvider(HistoryScreenAppViewModel);
//# sourceMappingURL=HistoryScreenAppModel.js.map