import { useModalContext } from '../../ui/Modals/Modals';
import { isDev } from '../../../core/utils/misc';
import React, { createContext, useState, useMemo, useContext, useEffect, } from 'react';
export const RightPanelContext = createContext({});
/**
 * Поставляет компонентам правых панелей ссылку на DOM-элемент, в котором их надо рендерить.
 * И позволяет управлять сжатием содержимого RightPanelContainer под видимую панель. Важно,
 * чтобы в каждом контексте панелей был только один сжатый контейнер, иначе будет пустая область.
 */
export const RightPanelContextProvider = ({ containerRef, children }) => {
    const [compressedElementId, setCompressedElementId] = useState(null);
    const { getStackSize } = useModalContext();
    const stackSize = getStackSize('rightPanel');
    const [activePanelWidth, setActivePanelWidth] = useState(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const { position } = window.getComputedStyle(container);
        if (position === 'static' && isDev) {
            throw new Error(`Элемент, в котором рендерим правые панели должен иметь 
      position отличный от static, чтобы формировать содержащий блок для правой
      панели, так как она позиционируется через absolute.`);
        }
    }, [containerRef]);
    useEffect(() => {
        if (stackSize === 0) {
            setActivePanelWidth(null);
        }
    }, [stackSize]);
    return (React.createElement(RightPanelContext.Provider, { value: useMemo(() => ({
            containerRef,
            compressedElementId,
            setCompressedElementId,
            activePanelWidth,
            setActivePanelWidth,
            stackSize,
        }), [
            containerRef,
            compressedElementId,
            setCompressedElementId,
            activePanelWidth,
            setActivePanelWidth,
            stackSize,
        ]) }, children));
};
export function useRightPanelContext() {
    const context = useContext(RightPanelContext);
    if (!context) {
        throw new Error('RightPanelContext не добавлен в дерево react');
    }
    return context;
}
//# sourceMappingURL=RightPanelContext.js.map