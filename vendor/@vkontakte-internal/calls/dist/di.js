// eslint-disable-next-line no-restricted-imports
import { rootContainer } from '@vkontakte-internal/di';
import { APIClient, Langs } from '@vkontakte-internal/plugins';
import { LangUtils, wrapLangUtilsImplementation } from './services/Lang';
import { PlatformMiniAppsBridge, wrapPlatformMiniAppsBridgeImplementation, } from './services/MiniAppIntegration';
import { AccountService, createAccountServiceImplementation } from './services/account';
import { createInternalBridgeImplementation, InternalBridgeWrapper } from './services/bridge';
import { CallsConfigService, createCallsConfigServiceImplementation } from './services/config';
import { CallsQueueProcessor, createCallsQueueProcessorImplementation } from './services/queue';
import { CallsSdkService, createCallsSdkServiceImplementation } from './services/sdk';
import { createNavServiceImplementation, NavigationService } from './services/navigation';
let callDiContainer;
export const ensureCallsLegacyDIDependencies = (container, { SDK, bridge, config, credentials, apiBaseUrl, langUtils, miniAppsBridge, nav, store, }) => {
    container.replace(AccountService, createAccountServiceImplementation(credentials));
    container.replace(CallsConfigService, createCallsConfigServiceImplementation(config));
    container.replace(CallsQueueProcessor, createCallsQueueProcessorImplementation(bridge));
    container.replace(LangUtils, wrapLangUtilsImplementation(langUtils));
    miniAppsBridge &&
        container.replace(PlatformMiniAppsBridge, wrapPlatformMiniAppsBridgeImplementation(miniAppsBridge));
    container.replace(CallsSdkService, createCallsSdkServiceImplementation({ SDK, apiBaseUrl, bridge, store }));
    container.replace(InternalBridgeWrapper, createInternalBridgeImplementation(bridge));
    container.replace(NavigationService, createNavServiceImplementation(nav));
    return container;
};
export const ensureCallsDIContainer = ({ APIClientImpl, LangsImpl }, legacyDIDependencies) => {
    if (callDiContainer) {
        return callDiContainer;
    }
    callDiContainer = rootContainer.child('calls');
    callDiContainer.replace(APIClient, APIClientImpl);
    callDiContainer.replace(Langs, LangsImpl);
    return ensureCallsLegacyDIDependencies(callDiContainer, legacyDIDependencies);
};
//# sourceMappingURL=di.js.map