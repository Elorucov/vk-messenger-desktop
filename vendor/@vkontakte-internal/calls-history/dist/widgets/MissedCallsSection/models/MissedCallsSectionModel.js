import { __decorate, __metadata } from "tslib";
import { createProvider, destroy, init, scope } from '@vkontakte-internal/di';
import { makeAutoObservable, observable, reaction } from 'mobx';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
import { ECallLongpollType } from '@vkontakte-internal/calls-core';
import { ProfileService } from '../../../services/ProfileService';
import { handlePromiseError } from '../../../helpers/logger';
import { QueueService } from '../../../services/QueueService';
import { ModalControlService } from '../../../services/ModalControlService';
import { ActiveModalType } from '../../../types';
import { HistoryActionsService } from '../../../services/HistoryActionsService';
import { CallHistoryService } from '../../../services/CallHistoryService';
let MissedCallsSectionModel = class MissedCallsSectionModel {
    constructor(callHistoryService, rightMenuSpinnerService, profileService, queueService, modalService, historyActionsService) {
        this.callHistoryService = callHistoryService;
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.profileService = profileService;
        this.queueService = queueService;
        this.modalService = modalService;
        this.historyActionsService = historyActionsService;
        this.loading = false;
        this.loadMoreHistory = async () => {
            try {
                await this.callHistoryService.loadMoreHistory();
                return true;
            }
            catch (error) {
                handlePromiseError(error);
                return false;
            }
        };
        this.onBroadcastClick = (payload) => {
            this.modalService.openModal({
                type: ActiveModalType.BROADCASTS,
                data: payload,
            });
        };
        this.onHistoryAction = (call, type, index, ownerId = 0) => {
            this.historyActionsService.handleHistoryAction(call, type, index, ownerId);
        };
        makeAutoObservable(this, {
            history: observable.shallow,
            queueWatcher: false,
        });
        this.queueWatcher = reaction(() => this.queueService.lastEvent, (event) => {
            if (event?.data?.type &&
                [ECallLongpollType.CallHistoryUpdated, ECallLongpollType.CurrentCallsUpdate].includes(event.data.type)) {
                this.loadHistory();
            }
        });
    }
    [destroy]() {
        this.queueWatcher?.();
    }
    get items() {
        return this.callHistoryService.items;
    }
    get isLoading() {
        return this.loading;
    }
    get canLoadMore() {
        return this.callHistoryService.canLoadMore;
    }
    setLoading(value) {
        this.loading = value;
    }
    async [init]() {
        this.setLoading(true);
        await this.callHistoryService.loadHistory(0, 'missed');
        this.setLoading(false);
        this.rightMenuSpinnerService.hide();
    }
    async loadHistory() {
        try {
            await this.callHistoryService.refresh();
            return true;
        }
        catch (error) {
            handlePromiseError(error);
            return false;
        }
    }
    get profiles() {
        return this.profileService.profiles;
    }
};
MissedCallsSectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CallHistoryService,
        RightMenuSpinnerService,
        ProfileService,
        QueueService,
        ModalControlService,
        HistoryActionsService])
], MissedCallsSectionModel);
export const { Provider: MissedCallsSectionModelProvider, useModel: useMissedCallsSectionModel } = createProvider(MissedCallsSectionModel);
//# sourceMappingURL=MissedCallsSectionModel.js.map