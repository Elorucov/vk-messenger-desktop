import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { Analytics } from './Analytics';
/**
 * @deprecated используйте класс с поддержкой типов из stats-schema `AnalyticsStatsTyped`
 * Общий сервис, предоставляющий методы для добавления дополнительных свойств событиям аналитики
 */
let AnalyticsStats = class AnalyticsStats {
    constructor(analytics) {
        this.analytics = analytics;
        /**
         * @note
         * максимально положительное int32 число
         * предотвращаем переполнение в kphp идентификатора
         */
        this.MAX_INT32 = 2147483647;
    }
    getIntId() {
        return Math.floor(Math.random() * this.MAX_INT32);
    }
    getCurrentTime() {
        return (Date.now() * 1000).toString(10);
    }
};
AnalyticsStats = __decorate([
    scope.global(),
    __metadata("design:paramtypes", [Analytics])
], AnalyticsStats);
export { AnalyticsStats };
//# sourceMappingURL=AnalyticsStats.js.map