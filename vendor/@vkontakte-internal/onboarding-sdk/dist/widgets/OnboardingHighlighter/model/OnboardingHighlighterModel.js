import { __decorate, __metadata } from "tslib";
// eslint-disable-next-line no-restricted-imports
import { makeAutoObservable, reaction } from 'mobx';
import { createProvider, init, Props, scope, update, destroy } from '@vkontakte-internal/di';
import { OnboardingEventTypes, OnboardingTypes, } from '@vkontakte-internal/vk-analytics-events';
import { OnboardingCampaignAbGroup, OnboardingCampaigns } from '../../../services';
import { OnboardingAnalytics } from '../../../analytics';
let OnboardingHighlighterModel = class OnboardingHighlighterModel {
    constructor(props, onboardingCampaigns, onboardingAnalytics) {
        this.props = props;
        this.onboardingCampaigns = onboardingCampaigns;
        this.onboardingAnalytics = onboardingAnalytics;
        /**
         * Флаг отображения хайлайтера
         */
        this.isVisible = false;
        makeAutoObservable(this);
        /**
         * Подписка на изменение списка онбординговых компаний и показ хайлайтера в зависимости от условий(canDisplayHighlighter)
         */
        this.unsubscribeOnboardingCampaignsReaction = reaction(() => this.onboardingCampaigns.onboardingCampaigns, () => {
            if (this.canDisplayHighlighter)
                this.displayHighlighter();
        });
    }
    [init]() {
        if (this.canDisplayHighlighter)
            this.displayHighlighter();
    }
    [update]() {
        if (this.canDisplayHighlighter)
            this.displayHighlighter();
    }
    [destroy]() {
        this.closeHighlighter();
    }
    get isHighlighterVisible() {
        return this.isVisible;
    }
    /**
     * Возвращает список нативных пропсов для OnboardingHighlighter
     */
    get restProps() {
        const { campaignName, enableQuarantine, shown, ...restProps } = this.props.current;
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
    get canDisplayHighlighter() {
        this.handleExperimentalGroupEntry();
        return (this.props.current.shown &&
            this.onboardingCampaigns.canDisplayOnboardingCampaign(this.onboardingCampaignName) &&
            this.onboardingCampaigns.isOnboardingCampaignActive(this.onboardingCampaignName));
    }
    /**
     * Показывает хайлайтер на странице
     */
    displayHighlighter() {
        this.showHighlighter();
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'highlighter',
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
                element_type: 'highlighter',
                event: 'view',
            });
            this.logAnalyticsEventView({ event_type: OnboardingEventTypes.VIEW_SKIP });
        }
    }
    /**
     * Обработчик закрытия хайлайтера
     */
    onHide() {
        if (!this.isVisible) {
            return;
        }
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
        this.closeHighlighter();
    }
    showHighlighter() {
        this.isVisible = true;
        this.onboardingCampaigns.setActiveOnboardingCampaign(this.onboardingCampaignName);
    }
    closeHighlighter() {
        this.isVisible = false;
        this.onboardingCampaigns.setActiveOnboardingCampaign(null);
    }
    logAnalyticsEventView(params) {
        this.onboardingAnalytics.logViewEvent({
            ...params,
            onboarding_type: OnboardingTypes.HIGHLIGHTER,
            campaign_name: this.onboardingCampaignName,
            test_group: this.onboardingCampaign?.ab_group,
        }, this.props.current.screen);
    }
    dispose() {
        this.unsubscribeOnboardingCampaignsReaction();
    }
};
OnboardingHighlighterModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        OnboardingCampaigns,
        OnboardingAnalytics])
], OnboardingHighlighterModel);
export { OnboardingHighlighterModel };
export const { Provider: OnboardingHighlighterModelProvider, useModel: useOnboardingHighlighterModel } = 
// eslint-disable-next-line no-restricted-syntax
createProvider(OnboardingHighlighterModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=OnboardingHighlighterModel.js.map