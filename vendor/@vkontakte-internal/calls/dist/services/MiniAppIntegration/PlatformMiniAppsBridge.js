import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
let PlatformMiniAppsBridge = class PlatformMiniAppsBridge {
};
PlatformMiniAppsBridge = __decorate([
    scope.container()
], PlatformMiniAppsBridge);
export { PlatformMiniAppsBridge };
export const wrapPlatformMiniAppsBridgeImplementation = (platformBridge) => {
    let PlatformMiniAppsBridgeImpl = class PlatformMiniAppsBridgeImpl {
        getIsFeatureEnabled(key) {
            return platformBridge.getIsFeatureEnabled(key);
        }
        writeAndSendWebStats(...args) {
            platformBridge.writeAndSendWebStats(...args);
        }
        getApiUrl() {
            return platformBridge.getApiUrl();
        }
        getAppShortUrl(appId) {
            return platformBridge.getAppShortUrl(appId);
        }
        getAuthUrl() {
            return platformBridge.getAuthUrl();
        }
    };
    PlatformMiniAppsBridgeImpl = __decorate([
        scope.container()
    ], PlatformMiniAppsBridgeImpl);
    return PlatformMiniAppsBridgeImpl;
};
//# sourceMappingURL=PlatformMiniAppsBridge.js.map