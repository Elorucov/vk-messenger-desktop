import { __decorate, __metadata } from "tslib";
import { createProvider, destroy, init, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable, reaction } from 'mobx';
import { CurrentCallsService } from '../../../services/CurrentCallsService';
import { FriendsService } from '../../../services/FriendsService';
import { CallHistoryService } from '../../../services/CallHistoryService';
import { PRIVATE_CALL_OWNER } from '../../../constants';
import { HistoryConfigService } from '../../../services/HistoryConfig';
import { HistoryScreenBridgeActionsService } from '../../../services/HistoryScreenBridgeActionsService';
let AllCallsSectionModel = class AllCallsSectionModel {
    constructor(currentCallsService, props, friendsService, callHistoryService, historyConfigService, historyScreenBridgeActionsService) {
        this.currentCallsService = currentCallsService;
        this.props = props;
        this.friendsService = friendsService;
        this.callHistoryService = callHistoryService;
        this.historyConfigService = historyConfigService;
        this.historyScreenBridgeActionsService = historyScreenBridgeActionsService;
        this.friendsLoading = false;
        makeAutoObservable(this, {
            showCreateCallReactionDispose: false,
        });
        this.showCreateCallReactionDispose = reaction(() => this.isEmptyScreen, (value) => this.setShowCreateCall(!value));
    }
    setFriendsLoading(value) {
        this.friendsLoading = value;
    }
    async [init]() {
        if (this.friendsService.friends.length === 0) {
            this.setFriendsLoading(true);
        }
        await this.friendsService.loadInitialFriends();
        this.setFriendsLoading(false);
    }
    get currentCalls() {
        return this.currentCallsService.currentCalls;
    }
    get currentProps() {
        return this.props.current;
    }
    get friends() {
        return this.friendsService.friends.slice(0, 7);
    }
    get historyCalls() {
        return this.callHistoryService.items;
    }
    get isEmptyScreen() {
        return (!this.callHistoryService.loading &&
            !this.currentCallsService.loading &&
            this.currentCalls.length === 0 &&
            this.historyCalls.length === 0 &&
            this.callHistoryService.currentOwnerId === PRIVATE_CALL_OWNER);
    }
    setShowCreateCall(value) {
        this.historyConfigService.setShowCreateCall(value);
    }
    get actions() {
        return {
            onJoin: this.historyScreenBridgeActionsService.onJoin,
            onCreateCallClick: this.historyScreenBridgeActionsService.onCreateCallClick,
        };
    }
    [destroy]() {
        this.showCreateCallReactionDispose();
        this.setShowCreateCall(true);
    }
};
AllCallsSectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CurrentCallsService,
        Props,
        FriendsService,
        CallHistoryService,
        HistoryConfigService,
        HistoryScreenBridgeActionsService])
], AllCallsSectionModel);
export { AllCallsSectionModel };
export const { Provider: AllCallsSectionModelProvider, useModel: useAllCallsSectionModel } = createProvider(AllCallsSectionModel);
//# sourceMappingURL=AllCallsSectionModel.js.map