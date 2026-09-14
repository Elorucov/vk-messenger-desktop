import { createContext, useContext } from 'react';
export const PopupAnimationObserverContext = createContext(undefined);
export function usePopupAnimationObserver() {
    const context = useContext(PopupAnimationObserverContext);
    if (!context) {
        return { observerRef: { current: undefined } };
    }
    return context;
}
//# sourceMappingURL=usePopupAnimationObserver.js.map