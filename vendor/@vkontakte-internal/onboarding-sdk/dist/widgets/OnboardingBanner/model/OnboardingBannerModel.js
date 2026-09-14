import { __decorate, __metadata } from "tslib";
// eslint-disable-next-line no-restricted-imports
import { makeAutoObservable, reaction } from 'mobx';
import { createProvider, destroy, init, Props, scope, update } from '@vkontakte-internal/di';
import { OnboardingEventTypes, OnboardingTypes, } from '@vkontakte-internal/vk-analytics-events';
import { OnboardingCampaignAbGroup, OnboardingCampaigns } from '../../../services';
import { OnboardingAnalytics } from '../../../analytics';
let OnboardingBannerModel = class OnboardingBannerModel {
    constructor(props, onboardingCampaigns, onboardingAnalytics) {
        this.props = props;
        this.onboardingCampaigns = onboardingCampaigns;
        this.onboardingAnalytics = onboardingAnalytics;
        /**
         * Флаг отображения баннера
         * @private
         */
        this.isVisible = false;
        /**
         * Время начала показа баннера
         * @private
         */
        this.shownTime = null;
        /**
         * Обработчик клика по баннеру
         */
        this.onBannerClick = () => {
            if (!this.isVisible)
                return;
            if (this.enableQuarantine) {
                this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
            }
            this.onboardingCampaigns.interactOnboarding({
                element_type: 'banner',
                event: 'click',
            });
            this.logAnalyticsEventClick({
                event_type: OnboardingEventTypes.CLICK_BANNER,
                watch_time_ms: this.shownDuration,
            });
        };
        /**
         * Обработчик клика по кнопке действия
         */
        this.onActionClick = () => {
            if (!this.isVisible)
                return;
            if (this.enableQuarantine) {
                this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
            }
            this.onboardingCampaigns.interactOnboarding({
                element_type: 'banner',
                event: 'click',
            });
            this.logAnalyticsEventClick({
                event_type: OnboardingEventTypes.CLICK_CTA,
                watch_time_ms: this.shownDuration,
            });
            this.closeBanner();
        };
        makeAutoObservable(this);
        /**
         * Подписка на изменение списка онбординговых компаний и показ онбординга в зависимости от условий(canDisplayBanner)
         */
        this.unsubscribeOnboardingCampaignsReaction = reaction(() => this.onboardingCampaigns.onboardingCampaigns, () => {
            if (this.canDisplayBanner)
                this.displayBanner();
        });
    }
    [init]() {
        if (this.canDisplayBanner)
            this.displayBanner();
    }
    [update]() {
        if (this.canDisplayBanner)
            this.displayBanner();
    }
    [destroy]() {
        this.closeBanner();
    }
    /**
     * Возвращает время, которое баннер показывался в ms
     */
    get shownDuration() {
        return this.shownTime ? Date.now() - this.shownTime : 0;
    }
    get isBannerVisible() {
        return this.isVisible;
    }
    /**
     * Возвращает список нативных пропсов для OnboardingBanner
     */
    get restProps() {
        const { campaignName, enableQuarantine, shown, buttonProps, ...restProps } = this.props.current;
        return restProps;
    }
    /**
     * Возвращает список нативных пропсов для кнопки действия(Button)
     */
    get buttonProps() {
        return this.props.current.buttonProps;
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
    get canDisplayBanner() {
        this.handleExperimentalGroupEntry();
        return (this.props.current.shown &&
            this.onboardingCampaigns.canDisplayOnboardingCampaign(this.onboardingCampaignName) &&
            this.onboardingCampaigns.isOnboardingCampaignActive(this.onboardingCampaignName));
    }
    /**
     * Включает баннер на странице
     * @private
     */
    displayBanner() {
        this.shownTime = Date.now();
        this.showBanner();
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'banner',
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
            this.logAnalyticsEventView({ event_type: OnboardingEventTypes.VIEW_SKIP });
        }
    }
    /**
     * Обработчик закрытия баннера
     */
    onDismiss() {
        if (!this.isVisible)
            return;
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'banner',
            event: 'click',
        });
        this.logAnalyticsEventClick({
            event_type: OnboardingEventTypes.CLOSE_EXIT,
            watch_time_ms: this.shownDuration,
        });
        this.closeBanner();
    }
    showBanner() {
        this.isVisible = true;
        this.onboardingCampaigns.setActiveOnboardingCampaign(this.onboardingCampaignName);
    }
    closeBanner() {
        this.isVisible = false;
        this.onboardingCampaigns.setActiveOnboardingCampaign(null);
    }
    logAnalyticsEventClick(params) {
        this.onboardingAnalytics.logClickEvent({
            ...params,
            onboarding_type: OnboardingTypes.BANNER,
            campaign_name: this.onboardingCampaignName,
            test_group: this.onboardingCampaign?.ab_group,
        }, this.props.current.screen);
    }
    logAnalyticsEventView(params) {
        this.onboardingAnalytics.logViewEvent({
            ...params,
            onboarding_type: OnboardingTypes.BANNER,
            campaign_name: this.onboardingCampaignName,
            test_group: this.onboardingCampaign?.ab_group,
        }, this.props.current.screen);
    }
    dispose() {
        this.unsubscribeOnboardingCampaignsReaction();
    }
};
OnboardingBannerModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        OnboardingCampaigns,
        OnboardingAnalytics])
], OnboardingBannerModel);
export { OnboardingBannerModel };
export const { Provider: OnboardingBannerModelProvider, useModel: useOnboardingBannerModel } = createProvider(OnboardingBannerModel, 
// eslint-disable-next-line no-restricted-syntax
{ isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=OnboardingBannerModel.js.map