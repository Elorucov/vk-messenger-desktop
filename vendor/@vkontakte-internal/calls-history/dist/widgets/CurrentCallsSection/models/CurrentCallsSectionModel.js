import { __decorate, __metadata } from "tslib";
import { createProvider, init, Props, scope } from '@vkontakte-internal/di';
import { CurrentCallsService } from '../../../services/CurrentCallsService';
import { ProfileService } from '../../../services/ProfileService';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
import { makeAutoObservable } from 'mobx';
import { HistoryScreenBridgeActionsService } from '../../../services/HistoryScreenBridgeActionsService';
let CurrentCallsSectionModel = class CurrentCallsSectionModel {
    constructor(currentCallsService, profileService, rightMenuSpinnerService, props, historyScreenBridgeActionsService) {
        this.currentCallsService = currentCallsService;
        this.profileService = profileService;
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.props = props;
        this.historyScreenBridgeActionsService = historyScreenBridgeActionsService;
        this._loading = false;
        makeAutoObservable(this);
    }
    setLoading(loading) {
        this._loading = loading;
    }
    get currentCalls() {
        if (this.maxCalls > 0) {
            return this.currentCallsService.currentCalls.slice(0, this.maxCalls);
        }
        return this.currentCallsService.currentCalls;
    }
    get profiles() {
        return this.profileService.profiles;
    }
    async [init]() {
        if (this.currentCallsService.currentCalls.length === 0) {
            this.setLoading(true);
        }
        await this.currentCallsService.loadCurrentCalls();
        this.setLoading(false);
        this.rightMenuSpinnerService.hide();
    }
    get loading() {
        return this._loading;
    }
    get maxCalls() {
        return this.props.current.maxCalls ?? 0;
    }
    get groupHeader() {
        return this.props.current.groupHeader;
    }
    get hideWhenEmpty() {
        return this.props.current.hideWhenEmpty ?? false;
    }
    get actions() {
        return {
            onJoin: this.historyScreenBridgeActionsService.onJoin,
        };
    }
};
CurrentCallsSectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CurrentCallsService,
        ProfileService,
        RightMenuSpinnerService,
        Props,
        HistoryScreenBridgeActionsService])
], CurrentCallsSectionModel);
export { CurrentCallsSectionModel };
export const { Provider: CurrentCallsSectionProvider, useModel: useCurrentCallsSection } = createProvider(CurrentCallsSectionModel);
//# sourceMappingURL=CurrentCallsSectionModel.js.map