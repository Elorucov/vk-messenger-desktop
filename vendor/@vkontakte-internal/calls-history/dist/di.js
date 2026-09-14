// eslint-disable-next-line no-restricted-imports
import { rootContainer } from '@vkontakte-internal/di';
import { APIClient, Langs } from '@vkontakte-internal/plugins';
import { createHistoryConfigServiceImplementation, HistoryConfigService } from './services/HistoryConfig';
import { QueueService, createQueueServiceImplementation } from './services/QueueService';
import { BridgeService, createBridgeServiceImplementation } from './services/BridgeService';
import { NavigationService, createNavigationServiceImplementation } from './services/NavigationService';
let callDiContainer;
export const createDiContainer = () => {
    if (callDiContainer) {
        return callDiContainer;
    }
    callDiContainer = rootContainer.child('calls-history');
    return callDiContainer;
};
export const ensureCallsHistoryDIContainer = (diContainer, { APIClientImpl, LangsImpl, HistoryConfig, isVkMe, subscribe, Bridge, navigateToConvo, navigateToProfile, }) => {
    diContainer.replace(APIClient, APIClientImpl);
    diContainer.replace(Langs, LangsImpl);
    diContainer.replace(HistoryConfigService, createHistoryConfigServiceImplementation(HistoryConfig, { isVkMe }));
    diContainer.replace(QueueService, createQueueServiceImplementation(subscribe));
    diContainer.replace(BridgeService, createBridgeServiceImplementation(Bridge));
    diContainer.replace(NavigationService, createNavigationServiceImplementation(navigateToConvo, navigateToProfile));
    return diContainer;
};
//# sourceMappingURL=di.js.map