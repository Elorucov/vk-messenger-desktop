import { createContext, useContext } from 'react';
const TabsContext = createContext({});
export const TabsContextProvider = TabsContext.Provider;
export const useTabsContext = () => useContext(TabsContext);
//# sourceMappingURL=TabsContext.js.map