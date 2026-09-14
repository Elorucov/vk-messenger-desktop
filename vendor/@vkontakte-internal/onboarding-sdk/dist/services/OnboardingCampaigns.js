import { __decorate, __metadata } from "tslib";
// eslint-disable-next-line no-restricted-imports
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { OnboardingApi } from '@vkontakte-internal/plugins';
/**
 * Сервис, представляющий управление онбординговыми кампаниями.
 * Отвечает за получение онбординговых кампаний,
 * регулирование отображения текущих онбордингов в приложении
 * а также за взаимодействие с API онбординга.
 */
let OnboardingCampaigns = class OnboardingCampaigns {
    constructor(onboardingApi) {
        this.onboardingApi = onboardingApi;
        /**
         * Список онбордингов
         */
        this.onboarding_campaigns = [];
        /**
         * Активный онбординг на странице
         */
        this.activeOnboardingCampaign = null;
        makeAutoObservable(this);
        this.fetchOnboardingCampaigns();
    }
    /**
     * Флаг показа онбординга на текущей странице
     */
    get hasActiveOnboarding() {
        return Boolean(this.activeOnboardingCampaign);
    }
    /**
     * Флаг проверки доступна ли компания онбординга для показа
     * @param campaignName
     */
    isOnboardingCampaignActive(campaignName) {
        return Boolean(this.getOnboardingCampaign(campaignName));
    }
    /**
     * Флаг проверки имеет ли компания активный баннер
     * @param campaignName
     */
    hasActiveBanner(campaignName) {
        return this.getOnboardingCampaign(campaignName)?.has_active_banner;
    }
    /**
     * Проверяет включен ли карантин на клиенте
     */
    get isLocalQuarantineEnabled() {
        const onboardingQuarantineTime = localStorage.getItem('onboarding_quarantine_time');
        if (!onboardingQuarantineTime) {
            return false;
        }
        const currentTime = new Date().getTime();
        const onboardingQuarantineEndTime = new Date(onboardingQuarantineTime).getTime();
        return currentTime < onboardingQuarantineEndTime;
    }
    /**
     * Флаг отвечает за возможность показа онбординговой кампании на странице
     * @param campaignName
     */
    canDisplayOnboardingCampaign(campaignName) {
        return this.hasActiveBanner(campaignName) || !(this.hasActiveOnboarding || this.isLocalQuarantineEnabled);
    }
    /**
     * Возвращает список онбординговых компаний
     */
    get onboardingCampaigns() {
        return this.onboarding_campaigns;
    }
    /**
     * Получения активного онбординга
     */
    getOnboardingCampaign(campaignName) {
        return this.onboarding_campaigns.find((onboarding) => onboarding.name === campaignName);
    }
    /**
     * Сохраняет дату окончания клиентского карантина в изо-формате(чтобы ограничить пользователя лимитом показов онбординговых компаний в день)
     */
    saveOnboardingQuarantineTime(campaignName) {
        const onboardingCampaign = this.getOnboardingCampaign(campaignName);
        const currentTime = new Date();
        const currentTimeSeconds = currentTime.getTime() / 1000;
        if (onboardingCampaign?.quarantine_time) {
            const quarantineEndTimeSeconds = currentTimeSeconds + onboardingCampaign.quarantine_time;
            const quarantineEndTime = new Date(quarantineEndTimeSeconds * 1000);
            localStorage.setItem('onboarding_quarantine_time', quarantineEndTime.toISOString());
            return;
        }
        const onboardingEndTimeSeconds = currentTimeSeconds + 84000; // Прибавляем дефолтную длительность карантина в секундах(сутки)
        const onboardingEndTime = new Date(onboardingEndTimeSeconds * 1000);
        localStorage.setItem('onboarding_quarantine_time', onboardingEndTime.toISOString());
    }
    /**
     * Метод запроса списка доступных онбордингов
     */
    async fetchOnboardingCampaigns() {
        this.onboarding_campaigns = await this.onboardingApi.getOnboardings({});
    }
    /**
     * Метод запроса взаимодействия с онбордингом
     */
    async interactOnboarding(params) {
        if (!this.activeOnboardingCampaign) {
            return;
        }
        await this.onboardingApi.interactOnboarding({
            ...params,
            campaign_name: this.activeOnboardingCampaign.name,
            ab_group: this.activeOnboardingCampaign.ab_group,
        });
    }
    /**
     * Устанавливает значение для флага показа онбординга на текущей странице
     * @param campaignName
     */
    setActiveOnboardingCampaign(campaignName) {
        this.activeOnboardingCampaign = this.getOnboardingCampaign(campaignName) || null;
    }
};
OnboardingCampaigns = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [OnboardingApi])
], OnboardingCampaigns);
export { OnboardingCampaigns };
//# sourceMappingURL=OnboardingCampaigns.js.map