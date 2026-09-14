import { createContext, useContext } from 'react';
import { HistoryScreenSections } from '../types';
export const VkmeContext = createContext({
    isVkme: false,
    startedSection: HistoryScreenSections.ALL,
});
export const useVkmeContext = () => useContext(VkmeContext);
//# sourceMappingURL=useVkmeContext.js.map