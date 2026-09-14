import { createContext, useContext } from 'react';
export const NavigationContext = createContext({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    navigateToConvo: (peerId) => { },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    navigateToProfile: (event, link, peerId) => { },
});
export const useNavigationContext = () => useContext(NavigationContext);
//# sourceMappingURL=useNavigationContext.js.map