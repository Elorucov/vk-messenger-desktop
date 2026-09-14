import { __decorate, __metadata } from "tslib";
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
import { HistoryConfigService } from '../../../services/HistoryConfig';
import { HistoryScreenBridgeActionsService } from '../../../services/HistoryScreenBridgeActionsService';
let HistoryScreenRouterModel = class HistoryScreenRouterModel {
    constructor(props, rightMenuSpinnerService, historyConfigService, historyScreenBridgeActionsService) {
        this.props = props;
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.historyConfigService = historyConfigService;
        this.historyScreenBridgeActionsService = historyScreenBridgeActionsService;
        makeAutoObservable(this);
    }
    get loading() {
        return this.rightMenuSpinnerService.loading;
    }
    setLoading(value) {
        this.rightMenuSpinnerService.setLoading(value);
    }
    get currentProps() {
        return this.props.current;
    }
    get showCreateCall() {
        return this.historyConfigService.showCreateCall;
    }
    get actions() {
        return {
            onCreateCallClick: this.historyScreenBridgeActionsService.onCreateCallClick,
            onJoinCallClick: this.historyScreenBridgeActionsService.onJoinCallClick,
            onShareQrCodeClick: this.historyScreenBridgeActionsService.onShareQrCodeClick,
            onJoin: this.historyScreenBridgeActionsService.onJoin,
            onPlanCalendarEvent: this.historyScreenBridgeActionsService.onPlanCalendarEvent,
            setPlannedCalendarEvent: this.historyScreenBridgeActionsService.setPlannedCalendarEvent,
        };
    }
};
HistoryScreenRouterModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        RightMenuSpinnerService,
        HistoryConfigService,
        HistoryScreenBridgeActionsService])
], HistoryScreenRouterModel);
export const { Provider: HistoryScreenRouterModelProvider, useModel: useHistoryScreenRouterModel } = createProvider(HistoryScreenRouterModel);
//# sourceMappingURL=HistoryScreenRouterModel.js.map