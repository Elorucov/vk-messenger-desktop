import { HistoryConfig } from '@vkontakte-internal/calls-core';
import { createContext, useContext } from 'react';
export function configContextCreator(config) {
    const context = createContext(config);
    const useConfig = () => useContext(context);
    return {
        CallsConfigProvider: context.Provider,
        useConfig,
    };
}
const { useConfig: useHistoryConfig, CallsConfigProvider: CallsHistoryConfigProvider } = configContextCreator(new HistoryConfig());
export { useHistoryConfig, CallsHistoryConfigProvider };
//# sourceMappingURL=context.js.map