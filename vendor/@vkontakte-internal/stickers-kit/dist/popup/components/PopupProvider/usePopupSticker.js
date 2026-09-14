import { createContext, useContext } from 'react';
export const PopupContext = createContext(null);
/**
 * Используем тогда внутри либы. В ней всегда должен быть popupStore.
 */
export function usePopupStickerWithError() {
    const context = useContext(PopupContext);
    if (context === null) {
        throw new Error('You have forgotten to wrap your root component with PopupProvider');
    }
    return context;
}
export function usePopupSticker() {
    const context = useContext(PopupContext);
    if (context === null) {
        return { popupStore: undefined };
    }
    return context;
}
//# sourceMappingURL=usePopupSticker.js.map