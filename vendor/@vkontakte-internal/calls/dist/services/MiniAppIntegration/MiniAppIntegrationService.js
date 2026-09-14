import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { LangUtils } from '../Lang';
import { MiniAppIntegrationError, MiniAppIntegrationErrorCode } from './MiniAppIntegrationError';
import { getApp } from './api';
import { PlatformMiniAppsBridge } from './PlatformMiniAppsBridge';
import { sendStats } from '../../stats/clickHouse';
let MiniAppIntegrationService = class MiniAppIntegrationService {
    constructor(langUtils, miniAppsBridge) {
        this.langUtils = langUtils;
        this.miniAppsBridge = miniAppsBridge;
        this.getIsFeatureEnabled = this.miniAppsBridge.getIsFeatureEnabled;
        this.sendProductStatEvent = sendStats;
        this.sendMiniAppSdkStats = this.miniAppsBridge.writeAndSendWebStats;
    }
    async getApp(appId) {
        const response = await getApp(appId, this.miniAppsBridge.getAppShortUrl(appId));
        const app = response.items[0];
        if (!app) {
            throw new MiniAppIntegrationError({
                code: MiniAppIntegrationErrorCode.UNKNOWN,
                message: `Application was not found by id ${appId}`,
            });
        }
        if (!app.webview_url) {
            if (app.placeholder_info) {
                const { title, subtitle } = app.placeholder_info;
                throw new MiniAppIntegrationError({
                    code: MiniAppIntegrationErrorCode.UNKNOWN,
                    message: subtitle,
                    title,
                });
            }
            throw new MiniAppIntegrationError({
                code: MiniAppIntegrationErrorCode.NO_URL,
                message: this.langUtils.getLang('calls_miniapp_error_message_no_url'),
            });
        }
        return app;
    }
    getApiUrl() {
        return this.miniAppsBridge.getApiUrl();
    }
    getAuthUrl() {
        return this.miniAppsBridge.getAuthUrl();
    }
};
MiniAppIntegrationService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [LangUtils,
        PlatformMiniAppsBridge])
], MiniAppIntegrationService);
export { MiniAppIntegrationService };
//# sourceMappingURL=MiniAppIntegrationService.js.map