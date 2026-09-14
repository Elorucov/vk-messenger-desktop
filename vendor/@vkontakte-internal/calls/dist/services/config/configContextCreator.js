import { createContext, useContext } from 'react';
export function configContextCreator(config) {
    const context = createContext(config);
    const useConfig = () => useContext(context);
    return {
        CallsConfigProvider: context.Provider,
        useConfig,
    };
}
//# sourceMappingURL=configContextCreator.js.map