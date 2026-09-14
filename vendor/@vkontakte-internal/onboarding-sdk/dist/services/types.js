/**
 * Перечисление, представляющее группы обратного A/B тестирования для кампании онбординга.
 */
export var OnboardingCampaignAbGroup;
(function (OnboardingCampaignAbGroup) {
    /**
     * Основная группа, не участвующая в тестировании. Онбординги показываются
     */
    OnboardingCampaignAbGroup[OnboardingCampaignAbGroup["MAIN"] = 0] = "MAIN";
    /**
     * Контрольная группа, участвующая в тестировании. Онбординги показываются
     */
    OnboardingCampaignAbGroup[OnboardingCampaignAbGroup["CONTROL"] = 1] = "CONTROL";
    /**
     * Экспериментальная группа, частвующая в тестировании. Онбординги не показываются
     */
    OnboardingCampaignAbGroup[OnboardingCampaignAbGroup["EXPERIMENTAL"] = 2] = "EXPERIMENTAL";
})(OnboardingCampaignAbGroup || (OnboardingCampaignAbGroup = {}));
//# sourceMappingURL=types.js.map