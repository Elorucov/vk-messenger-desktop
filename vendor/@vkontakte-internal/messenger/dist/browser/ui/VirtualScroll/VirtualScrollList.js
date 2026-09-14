import React, { createContext, useContext, useMemo } from 'react';
const VirtualListContext = createContext(undefined);
export const VirtualScrollList = ({ virtualizerCore, virtualizerState, children, }) => {
    return (React.createElement(VirtualListContext.Provider, { value: useMemo(
        /**
         * Передаем в контекст virtualizerState для обновления компонентов,
         * использующих VirtualListContext.
         */
        () => ({ virtualizerCore, virtualizerState }), [virtualizerCore, virtualizerState]) }, children));
};
VirtualScrollList.displayName = 'VirtualScrollList';
export const useVirtualList = () => {
    const virtualizerContext = useContext(VirtualListContext);
    if (!virtualizerContext) {
        throw new Error('VirtualListContext.Provider не добавлен в дерево Реакта!');
    }
    return virtualizerContext.virtualizerCore;
};
//# sourceMappingURL=VirtualScrollList.js.map