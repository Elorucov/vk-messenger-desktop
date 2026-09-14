import { __decorate, __metadata } from "tslib";
// eslint-disable-next-line no-restricted-imports
import { makeAutoObservable, reaction } from 'mobx';
import { createProvider, init, Props, scope, update, destroy } from '@vkontakte-internal/di';
import { OnboardingEventTypes, OnboardingTypes, } from '@vkontakte-internal/vk-analytics-events';
import { OnboardingCampaignAbGroup, OnboardingCampaigns } from '../../../services';
import { OnboardingAnalytics } from '../../../analytics';
let OnboardingFullscreenModel = class OnboardingFullscreenModel {
    constructor(props, onboardingCampaigns, onboardingAnalytics) {
        this.props = props;
        this.onboardingCampaigns = onboardingCampaigns;
        this.onboardingAnalytics = onboardingAnalytics;
        /**
         * Флаг отображения фуллскрина
         */
        this.isVisible = false;
        /**
         * Время начала показа фуллскрина
         */
        this.shownTime = null;
        /**
         * Айди текущего шага в компоненте Fullscreen
         */
        this.currentStepId = '';
        makeAutoObservable(this);
        /**
         * Подписка на изменение списка онбординговых компаний и показ онбординга в зависимости от условий(canDisplayOnboardingCampaign)
         */
        this.unsubscribeOnboardingCampaignsReaction = reaction(() => this.onboardingCampaigns.onboardingCampaigns, () => {
            if (this.canDisplayOnboarding)
                this.displayOnboarding();
        });
    }
    [init]() {
        this.currentStepId = this.restProps.steps[0].id;
        if (this.canDisplayOnboarding)
            this.displayOnboarding();
    }
    [update]() {
        if (this.canDisplayOnboarding) {
            this.displayOnboarding();
        }
        if (!this.props.current.shown)
            this.closeOnboarding();
    }
    [destroy]() {
        this.closeOnboarding();
    }
    /**
     * Возвращает время, которое тултип показывался в ms
     */
    get shownDuration() {
        return this.shownTime ? Date.now() - this.shownTime : 0;
    }
    get isFullscreenVisible() {
        return this.isVisible;
    }
    /**
     * Возвращает список нативных пропсов для OnboardingMarkedFullscreen
     */
    get restProps() {
        const { campaignName, enableQuarantine, shown, modalPageProps, ...restProps } = this.props.current;
        return restProps;
    }
    /**
     * Возвращает список нативных пропсов для ModalPage
     */
    get modalPageProps() {
        return this.props.current.modalPageProps;
    }
    get onboardingCampaignName() {
        return this.props.current.campaignName;
    }
    get enableQuarantine() {
        return this.props.current.enableQuarantine;
    }
    get currentStepNumber() {
        return this.restProps.steps.findIndex((step) => step.id === this.currentStepId) + 1;
    }
    get onboardingCampaign() {
        return this.onboardingCampaigns.getOnboardingCampaign(this.onboardingCampaignName);
    }
    get canDisplayOnboarding() {
        this.handleExperimentalGroupEntry();
        return (this.props.current.shown &&
            this.onboardingCampaigns.canDisplayOnboardingCampaign(this.onboardingCampaignName) &&
            this.onboardingCampaigns.isOnboardingCampaignActive(this.onboardingCampaignName));
    }
    /**
     * Показывает онбординг на странице
     */
    displayOnboarding() {
        this.shownTime = Date.now();
        this.showOnboarding();
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'fullscreen',
            event: 'view',
        });
        this.logAnalyticsEventView({ event_type: OnboardingEventTypes.VIEW });
        this.logAnalyticsEventView({
            event_type: OnboardingEventTypes.VIEW_N_SCREEN,
            screen_number: this.currentStepNumber,
        });
    }
    /**
     * Выполняет отправку аналитики и добавление в карантин, если онбординг включен в тестовую группу обратного АБ тестирования
     */
    handleExperimentalGroupEntry() {
        if (this.onboardingCampaign?.ab_group === OnboardingCampaignAbGroup.EXPERIMENTAL) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
            this.onboardingCampaigns.interactOnboarding({
                element_type: 'fullscreen',
                event: 'view',
            });
            this.logAnalyticsEventView({ event_type: OnboardingEventTypes.VIEW_SKIP });
        }
    }
    /**
     * Обработчик изменения шага
     */
    onStepChange(newStepId) {
        this.currentStepId = newStepId;
        if (this.restProps.steps.at(-1)?.id === newStepId) {
            this.logAnalyticsEventView({ event_type: OnboardingEventTypes.VIEW_ALL_SCREEN });
            return;
        }
        this.logAnalyticsEventView({
            event_type: OnboardingEventTypes.VIEW_N_SCREEN,
            screen_number: this.currentStepNumber,
        });
    }
    /**
     * Обработчик клика по кнопке переключения следующего шага
     */
    onNextClick() {
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'fullscreen',
            event: 'click',
        });
        this.logAnalyticsEventClick({
            event_type: OnboardingEventTypes.CLICK_CTA_N_SCREEN,
            screen_number: this.currentStepNumber,
        });
    }
    /**
     * Обработчик закрытия фулсскрина
     */
    onClose() {
        this.logAnalyticsEventClick({
            event_type: OnboardingEventTypes.CLOSE_N_SCREEN,
            screen_number: this.currentStepNumber,
            watch_time_ms: this.shownDuration,
        });
        this.closeOnboarding();
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
    }
    /**
     * Обработчик клика по кнопке действия на последнем шаге
     */
    onDone() {
        this.logAnalyticsEventClick({
            event_type: OnboardingEventTypes.CLICK_CTA_N_SCREEN,
            screen_number: this.currentStepNumber,
            watch_time_ms: this.shownDuration,
        });
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'fullscreen',
            event: 'click',
        });
        this.closeOnboarding();
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
    }
    /**
     * Обработчик пропуска онбординга
     */
    onSkip() {
        this.onboardingCampaigns.interactOnboarding({
            element_type: 'fullscreen',
            event: 'click',
        });
        if (this.enableQuarantine) {
            this.onboardingCampaigns.saveOnboardingQuarantineTime(this.onboardingCampaignName);
        }
    }
    showOnboarding() {
        this.isVisible = true;
        this.onboardingCampaigns.setActiveOnboardingCampaign(this.onboardingCampaignName);
    }
    closeOnboarding() {
        this.isVisible = false;
        this.onboardingCampaigns.setActiveOnboardingCampaign(null);
    }
    logAnalyticsEventClick(params) {
        this.onboardingAnalytics.logClickEvent({
            ...params,
            onboarding_type: OnboardingTypes.FULLSCREEN,
            campaign_name: this.onboardingCampaignName,
            test_group: this.onboardingCampaign?.ab_group,
        }, this.props.current.screen);
    }
    logAnalyticsEventView(params) {
        this.onboardingAnalytics.logViewEvent({
            ...params,
            onboarding_type: OnboardingTypes.FULLSCREEN,
            campaign_name: this.onboardingCampaignName,
            test_group: this.onboardingCampaign?.ab_group,
        }, this.props.current.screen);
    }
    dispose() {
        this.unsubscribeOnboardingCampaignsReaction();
    }
};
OnboardingFullscreenModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        OnboardingCampaigns,
        OnboardingAnalytics])
], OnboardingFullscreenModel);
export { OnboardingFullscreenModel };
export const { Provider: OnboardingFullscreenModelProvider, useModel: useOnboardingFullscreenModel } = 
// eslint-disable-next-line no-restricted-syntax
createProvider(OnboardingFullscreenModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=OnboardingFullscreenModel.js.map