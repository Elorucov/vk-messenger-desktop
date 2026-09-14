import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { createProvider, init, scope } from '@vkontakte-internal/di';
import { PRIVATE_CALL_OWNER } from '../../../constants';
import { BridgeService } from '../../../services/BridgeService';
import { CallHistoryService } from '../../../services/CallHistoryService';
import { CallOwnersService } from '../../../services/CallOwnersService';
import { HistoryActionsService } from '../../../services/HistoryActionsService';
import { HistoryConfigService } from '../../../services/HistoryConfig';
import { ModalControlService } from '../../../services/ModalControlService';
import { ProfileService } from '../../../services/ProfileService';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
import { ActiveModalType } from '../../../types';
let CallHistorySectionModel = class CallHistorySectionModel {
    constructor(historyConfig, callHistory, bridgeService, profileService, modalService, historyActionsService, rightMenuSpinnerService, callOwnersService) {
        this.historyConfig = historyConfig;
        this.callHistory = callHistory;
        this.bridgeService = bridgeService;
        this.profileService = profileService;
        this.modalService = modalService;
        this.historyActionsService = historyActionsService;
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.callOwnersService = callOwnersService;
        this._selectedOwnerId = PRIVATE_CALL_OWNER;
        this._loading = false;
        this._ownerLoading = false;
        this.onShowMoreHistory = async () => {
            await this.callHistory.loadMoreHistory();
            return true;
        };
        this.onFullCallsDelete = () => {
            if (!this.historyCalls.length) {
                return;
            }
            this.modalService.openModal({
                type: ActiveModalType.DELETE_ALL_CALLS,
                data: {
                    ownerId: this.selectedOwnerId,
                },
            });
        };
        this.onBroadcastClick = (payload) => {
            this.modalService.openModal({
                type: ActiveModalType.BROADCASTS,
                data: {
                    broadcasts: payload.broadcasts,
                    ownerId: payload.ownerId,
                    callTitle: payload.callTitle,
                    callId: payload.callId,
                },
            });
        };
        this.onHistoryAction = (call, type, index, ownerId = 0) => {
            this.historyActionsService.handleHistoryAction(call, type, index, ownerId);
        };
        makeAutoObservable(this);
    }
    get ownerOptions() {
        return this.callOwnersService.ownerOptions;
    }
    get currentOwnerName() {
        return this.ownerOptions.find(({ id }) => id === this.selectedOwnerId)?.name ?? '';
    }
    get selectedOwnerId() {
        return this._selectedOwnerId;
    }
    setSelectedOwnerId(value) {
        this._selectedOwnerId = value;
    }
    get loading() {
        return this._loading;
    }
    setLoading(value) {
        this._loading = value;
    }
    async [init]() {
        this.setLoading(true);
        await Promise.all([
            this.callOwnersService.groups.length === 0 && this.callOwnersService.fetchGroups(),
            this.callHistory.loadHistory(this.selectedOwnerId, 'all'),
        ]);
        this.setLoading(false);
        this.rightMenuSpinnerService.hide();
    }
    get ownerLoading() {
        return this._ownerLoading;
    }
    setOwnerLoading(value) {
        this._ownerLoading = value;
    }
    async onGroupSelectChange(groupId) {
        this.setSelectedOwnerId(groupId);
        this.setOwnerLoading(true);
        await this.callHistory.loadHistory(groupId, 'all');
        this.setOwnerLoading(false);
        if (this.callHistory.items.length) {
            this.bridgeService.bridge.checkOnlyAuthByGroupId(groupId);
        }
    }
    get profiles() {
        return this.profileService.profiles;
    }
    get showMoreHistory() {
        return this.callHistory.canLoadMore;
    }
    get historyCalls() {
        return this.callHistory.items;
    }
    get isEmptyHistory() {
        return this.callHistory.items.length === 0;
    }
    get isShowList() {
        return !this.loading && this.callHistory.items.length > 0;
    }
    get enableNewHistoryDeletion() {
        return this.historyConfig.config.enableNewHistoryDeletion;
    }
    get showEmptyPlaceholder() {
        return !this.loading && this.callHistory.items.length === 0;
    }
};
CallHistorySectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [HistoryConfigService,
        CallHistoryService,
        BridgeService,
        ProfileService,
        ModalControlService,
        HistoryActionsService,
        RightMenuSpinnerService,
        CallOwnersService])
], CallHistorySectionModel);
export { CallHistorySectionModel };
export const { Provider: CallHistorySectionModelProvider, useModel: useCallHistorySectionModel } = createProvider(CallHistorySectionModel);
//# sourceMappingURL=CallHistorySectionModel.js.map