import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ProductionStats, MetaData, AuthService } from '@vkontakte-internal/plugins';
import { getCurrentMicroseconds } from '@vkontakte-internal/calls-core';
// Абстрактный пример коллектора поста
let CallHistoryAnalytics = class CallHistoryAnalytics {
    constructor(productionStats, metaData, authService) {
        this.productionStats = productionStats;
        this.metaData = metaData;
        this.authService = authService;
    }
    send(eventType, event) {
        const userId = this.authService.userIdOrAnonim;
        this.productionStats.send({
            type: 'type_action',
            screen: this.metaData.get().screen,
            type_action: {
                type: 'type_voip_call_item',
                type_voip_call_item: {
                    ...event,
                    lib_version: 'calls_v2',
                    event_client_microsec: getCurrentMicroseconds(),
                    session_id: '',
                    peer_id: String(event.peer_id ?? userId),
                    device_id: '',
                    is_group_call: false,
                    call_event_type: eventType,
                },
            },
        });
    }
};
CallHistoryAnalytics = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [ProductionStats,
        MetaData,
        AuthService])
], CallHistoryAnalytics);
export { CallHistoryAnalytics };
//# sourceMappingURL=CallHistoryAnalytics.js.map