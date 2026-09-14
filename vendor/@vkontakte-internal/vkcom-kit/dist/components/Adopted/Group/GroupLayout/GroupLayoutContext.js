import { createContext, useContext } from 'react';
export const emptyGroupLayoutContext = {
    isInsideGroupLayout: false,
    padding: 'm',
    spacing: 'm',
};
const GroupLayoutContext = createContext(emptyGroupLayoutContext);
export const GroupLayoutContextProvider = GroupLayoutContext.Provider;
export const useGroupLayoutContext = () => useContext(GroupLayoutContext);
//# sourceMappingURL=GroupLayoutContext.js.map