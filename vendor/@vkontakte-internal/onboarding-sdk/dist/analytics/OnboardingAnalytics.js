import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ProductionStats } from '@vkontakte-internal/plugins';
let OnboardingAnalytics = class OnboardingAnalytics {
    constructor(productionStats) {
        this.productionStats = productionStats;
    }
    logClickEvent(event, screen) {
        this.productionStats.send({
            type: 'type_click',
            screen: screen,
            ['type_click']: {
                item: { type: 'onboarding' },
                type: 'type_onboarding_event',
                ['type_onboarding_event']: event,
            },
        });
    }
    logViewEvent(event, screen) {
        this.productionStats.send({
            type: 'type_view',
            screen: screen,
            ['type_view']: {
                item: { type: 'onboarding' },
                type: 'type_onboarding_event',
                ['type_onboarding_event']: event,
            },
        });
    }
};
OnboardingAnalytics = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [ProductionStats])
], OnboardingAnalytics);
export { OnboardingAnalytics };
//# sourceMappingURL=OnboardingAnalytics.js.map