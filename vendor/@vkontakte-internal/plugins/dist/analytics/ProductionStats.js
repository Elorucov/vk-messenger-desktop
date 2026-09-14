import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { AnalyticsStats } from './AnalyticsStats';
/**
 * @deprecated используйте класс с поддержкой типов из stats-schema `ProductionStatsTyped`
 * Сервис для отправки аналитики ProductionStats
 */
let ProductionStats = class ProductionStats extends AnalyticsStats {
    getLastEvent() {
        return this.lastEvent;
    }
    /**
     * Отправляет событие аналитики ProductionStats
     */
    send(event, options) {
        const eventToSend = {
            ...event,
            id: this.getIntId(),
            prev_id: this.getLastEvent()?.id,
            prev_nav_id: this.getIntId() ?? 0,
            prev_event_id: this.getLastEvent()?.prev_nav_id ?? 0,
            timestamp: this.getCurrentTime(),
            url: window.location.href,
        };
        this.analytics.sendProductionStats(eventToSend, options);
        this.lastEvent = eventToSend;
    }
};
ProductionStats = __decorate([
    scope.global()
], ProductionStats);
export { ProductionStats };
//# sourceMappingURL=ProductionStats.js.map