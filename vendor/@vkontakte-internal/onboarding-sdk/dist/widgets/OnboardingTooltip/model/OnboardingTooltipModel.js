import { __decorate, __metadata } from "tslib";
// eslint-disable-next-line no-restricted-imports
import { makeAutoObservable, reaction } from 'mobx';
import { createProvider, init, Props, scope, update, destroy } from '@vkontakte-internal/di';
import { OnboardingEventTypes, OnboardingTypes, } from '@vkontakte-internal/vk-analytics-events';
import { OnboardingCampaignAbGroup, OnboardingCampaigns } from '../../../services';
import { OnboardingAnalytics } from '../../../analytics';
let OnboardingTooltipModel = class OnboardingTooltipModel {
    constructor(props, onboardingCampaigns, onboardingAnalytics) {
        this.props = props;
        this.onboardingCampaigns = onboardingCampaigns;
        this.onboardingAnalytics = onboardingAnalytics;
        /**
         * Флаг отображения тултипа
         */
        this.isVisible = false;
        /**
         * Время начала показа тултипа
         */
        this.shownTime = null;
        makeAutoObservable(this);
        /**
         * Подписка на изменение списка онбординговых компаний и показ тултипа в зависимости от условий(canDisplayTooltip)
         */
        this.unsubscribeOnboardingCampaignsReaction = reaction(() => this.onboardingCampaigns.onboardingCampaigns, () => {
            if (this.canDisplayTooltip)
                this.displayTooltip();
        });
    }
    [init]() {
        if (this.canDisplayTooltip)
            this.displayTooltip();
    }
    [update]() {
        if (this.canDisplayTooltip)
            this.displayTooltip();
    }
    [destroy]() {
        this.closeTooltip();
    }
    /**
     * Возвращает время, которое тултип показывался в ms
     */
    get shownDuration() {
        return this.shownTime ? Date.now() - this.shownTime : 0;
    }
    get isTooltipVisible() {
        return this.isVisible;
    }
    /**
     * Возвращает список нативных пропсов для OnboardingMarkedTooltip
     */
    get restProps() {
        const { campaignName, enableQuarantine, ...restProps } = this.props.current;
        return restProps;
    }
    get onboardingCampaignName() {
        return this.props.current.campaignName;
    }
    get enableQuarantine() {
        return this.props.current.enableQuarantine;
    }
    get onboardingCampaign() {
        return this.onboardingCampaigns.getOnboardingCampaign(this.onboardingCampaignName);
    }
    get canDisplayTooltip() {
        this.handleExperimentalGroupEntry();
        return (this.props.current.shown &&
            this.onboardingCampaigns.canDisplayOnboardingCampaign(this.onboardingCampaignName) &&
            this.onboardingCampaigns.isOnboardingCampaignActive(this.onboardingCampaignName));
    }
    /**
     * Показывает тултип на странице
     */
    displayTooltip() {
        this.shownTime = Date.now();
        this.showTooltip();
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'tooltip',
            event: 'view',
        });
        this.logAnalyticsEventView({ event_type: OnboardingEventTypes.VIEW });
    }
    /**
     * Выполняет отправку аналитики и добавление в карантин, если онбординг включен в тестовую группу обратного АБ тестирования
     */
    handleExperimentalGroupEntry() {
        if (this.onboardingCampaign?.ab_group === OnboardingCampaignAbGroup.EXPERIMENTAL) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
            this.onboardingCampaigns.interactOnboarding({
                element_type: 'tooltip',
                event: 'view',
            });
            this.logAnalyticsEventView({ event_type: OnboardingEventTypes.VIEW_SKIP });
        }
    }
    /**
     * Обработчик клика по тултипу
     */
    onClick() {
        if (!this.isVisible) {
            return;
        }
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'tooltip',
            event: 'click',
        });
        this.logAnalyticsEventClick({
            event_type: OnboardingEventTypes.CLICK_TOOLTIP,
            watch_time_ms: this.shownDuration,
        });
        this.closeTooltip();
    }
    /**
     * Обработчик клика по маркеру тултипа
     */
    onClickMarker() {
        if (!this.isVisible) {
            return;
        }
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'tooltip',
            event: 'click',
        });
        this.logAnalyticsEventClick({
            event_type: OnboardingEventTypes.CLICK_TOOLTIP_ANCHOR,
            watch_time_ms: this.shownDuration,
        });
        this.closeTooltip();
    }
    /**
     * Обработчик клика вне тултипа/маркера
     */
    onClickOutside() {
        if (!this.isVisible) {
            return;
        }
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
        this.logAnalyticsEventClick({
            event_type: OnboardingEventTypes.CLOSE_CLICK_OUTSIDE,
            watch_time_ms: this.shownDuration,
        });
        this.closeTooltip();
    }
    showTooltip() {
        this.isVisible = true;
        this.onboardingCampaigns.setActiveOnboardingCampaign(this.onboardingCampaignName);
    }
    closeTooltip() {
        this.isVisible = false;
        this.onboardingCampaigns.setActiveOnboardingCampaign(null);
    }
    logAnalyticsEventClick(params) {
        this.onboardingAnalytics.logClickEvent({
            ...params,
            onboarding_type: OnboardingTypes.TOOLTIP,
            campaign_name: this.onboardingCampaignName,
            test_group: this.onboardingCampaign?.ab_group,
        }, this.props.current.screen);
    }
    logAnalyticsEventView(params) {
        this.onboardingAnalytics.logViewEvent({
            ...params,
            onboarding_type: OnboardingTypes.TOOLTIP,
            campaign_name: this.onboardingCampaignName,
            test_group: this.onboardingCampaign?.ab_group,
        }, this.props.current.screen);
    }
    dispose() {
        this.unsubscribeOnboardingCampaignsReaction();
    }
};
OnboardingTooltipModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        OnboardingCampaigns,
        OnboardingAnalytics])
], OnboardingTooltipModel);
export { OnboardingTooltipModel };
export const { Provider: OnboardingTooltipModelProvider, useModel: useOnboardingTooltipModel } = 
// eslint-disable-next-line no-restricted-syntax
createProvider(OnboardingTooltipModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=OnboardingTooltipModel.js.map