import { createContext, useContext } from 'react';
const RoundedGroupContext = createContext({
    direction: 'vertical',
});
export const RoundedGroupContextProvider = RoundedGroupContext.Provider;
export const useRoundedGroupContext = () => {
    return useContext(RoundedGroupContext);
};
//# sourceMappingURL=RoundedGroupContext.js.map