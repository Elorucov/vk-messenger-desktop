import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
let CallsConfigService = class CallsConfigService {
};
CallsConfigService = __decorate([
    scope.container()
], CallsConfigService);
export { CallsConfigService };
export const createCallsConfigServiceImplementation = (config) => {
    let CallsConfigServiceImpl = class CallsConfigServiceImpl {
        getConfig() {
            return config;
        }
        getMiniAppsStatPlatform() {
            return this.isVkMe() ? 'web_messenger' : 'desktop_web';
        }
        isVkMe() {
            return config.vkme ?? false;
        }
    };
    CallsConfigServiceImpl = __decorate([
        scope.container()
    ], CallsConfigServiceImpl);
    return CallsConfigServiceImpl;
};
//# sourceMappingURL=CallsConfigService.js.map