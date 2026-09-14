import { createContext, useContext } from 'react';
const context = createContext(false);
export const RightMenuContextProvider = context.Provider;
export const useRightMenuContext = () => useContext(context);
//# sourceMappingURL=RightMenuContext.js.map