import { __decorate, __metadata } from "tslib";
import { CallsConfigService } from '../config';
import { scope } from '@vkontakte-internal/di';
/**
 * Класс для определения показа определенного баннера
 *
 * Правки в OnboardingFeature (@vkontakte-internal/calls/services/onboarding)
 * и в https://pmcmanager.mvk.com/Confdata/key/ok_call_section.call_disable_banners_by_app_id/
 * должны быть согласованы по наименования онбордингов, сейчас это
 *   WATCH_TOGETHER = 'voip:call_web_feature_onboarding:watch_together',
 *   REACTIONS = 'voip:call_web_feature_onboarding:reactions',
 *   VMOJI = 'voip:call_web_feature_onboarding:vmoji',
 *   ASR = 'voip:call_web_feature_onboarding:subtitles',
 *
 * Для показа нотификации о десктопном приложении использовать ключ
 *   'call_web_banners.desktop_app'
 */
let DisabledBannersService = class DisabledBannersService {
    constructor(configService) {
        this.configService = configService;
        this.ALL_BANNERS_FLAG = '*';
        this.DESKTOP_APP_BANNER = 'call_web_banners.desktop_app';
    }
    getEnabledOnboarding(feature) {
        const disabledBanners = this.configService.getConfig().disabledBanners;
        if (!disabledBanners.length) {
            return true;
        }
        if (disabledBanners.includes(this.ALL_BANNERS_FLAG) || !feature) {
            return false;
        }
        return !disabledBanners.includes(feature);
    }
    get enableDesktopAppNotification() {
        const disabledBanners = this.configService.getConfig().disabledBanners;
        if (disabledBanners.includes(this.ALL_BANNERS_FLAG) ||
            disabledBanners.includes(this.DESKTOP_APP_BANNER)) {
            return false;
        }
        return !disabledBanners.length;
    }
};
DisabledBannersService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsConfigService])
], DisabledBannersService);
export { DisabledBannersService };
//# sourceMappingURL=DisabledBannersService.js.map