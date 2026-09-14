import { createContext, useContext } from 'react';
const context = createContext({});
export const LoadableMediaContextProvider = context.Provider;
export const useLoadableMediaContext = () => useContext(context);
//# sourceMappingURL=LoadableMediaContext.js.map