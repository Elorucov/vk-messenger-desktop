import { createContext, useContext } from 'react';
const defaultConfig = {
    isSsr: false,
};
const DIReactConfigContext = createContext(defaultConfig);
export const DIReactConfigProvider = DIReactConfigContext.Provider;
export const useDIReactConfig = () => useContext(DIReactConfigContext);
//# sourceMappingURL=di-react-config.js.map