import { createContext, useContext } from 'react';
const ContentBadgeContext = createContext({
    isSingleChild: false,
    size: 'm',
});
export const ContentBadgeProvider = ContentBadgeContext.Provider;
export const useContentBadgeContext = () => useContext(ContentBadgeContext);
//# sourceMappingURL=ContentBadgeContext.js.map