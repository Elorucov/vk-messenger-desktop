import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { localStorage } from '@vkontakte/vkjs';
import { EMPTY_USER_ID, EVideoOptionType, } from '@vkontakte-internal/calls-core';
import { BridgeService } from './BridgeService';
import { HistoryConfigService } from './HistoryConfig/HistoryConfigService';
let HistoryScreenBridgeActionsService = class HistoryScreenBridgeActionsService {
    constructor(bridgeService, historyConfigService) {
        this.bridgeService = bridgeService;
        this.historyConfigService = historyConfigService;
        this.onCreateCallClick = (source) => {
            this.bridge.showCreateCallByLinkPopup(source);
        };
        this.onJoinCallClick = () => {
            this.bridge.showJoinCallByLinkPopup();
        };
        this.onShareQrCodeClick = (textToEncode, qrFileName) => {
            this.bridge.showShareQrCodePopup(textToEncode, qrFileName);
        };
        // для всех точек входа на экране/модалке истории: p2p, активные, запланированные, история
        this.onJoin = (joinLink, vkId = EMPTY_USER_ID, source, forceBrowserJoin = false) => {
            if (joinLink) {
                this.bridge.showJoinPopup(joinLink, source);
                return;
            }
            const shouldJoinInBrowser = forceBrowserJoin || this.joinInBrowserFromLocalStorage || this.historyConfigService.config.sferum;
            if (!shouldJoinInBrowser) {
                this.bridge.showStartCallModal({ vkId, joinLink, entryPoint: source });
                return;
            }
            if (!vkId) {
                return;
            }
            const isGroupCall = vkId > 2e9;
            if (isGroupCall) {
                this.bridge.startGroupCall(vkId, undefined, null, false, source);
                return;
            }
            this.bridge.call({ vkId, entryPoint: source });
        };
        this.onPlanCalendarEvent = () => {
            this.bridge.showPlanCalendarEventPopup();
        };
        this.setPlannedCalendarEvent = (editedEvent) => {
            this.bridge.setPlannedCalendarEvent?.(editedEvent);
        };
        makeAutoObservable(this);
    }
    get bridge() {
        return this.bridgeService.bridge;
    }
    get joinInBrowserFromLocalStorage() {
        try {
            const value = localStorage.getItem('calls_video_options');
            if (!value) {
                return false;
            }
            const parsed = JSON.parse(value);
            return parsed[EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT];
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
};
HistoryScreenBridgeActionsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [BridgeService,
        HistoryConfigService])
], HistoryScreenBridgeActionsService);
export { HistoryScreenBridgeActionsService };
//# sourceMappingURL=HistoryScreenBridgeActionsService.js.map