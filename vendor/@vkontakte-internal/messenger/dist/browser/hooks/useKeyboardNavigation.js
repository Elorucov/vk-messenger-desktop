import { useState, useRef, useCallback } from 'react';
export const INITIAL_INDEX_TO_SELECT = 0;
// TODO orientation: если horizontal, то ArrowLeft | ArrowRight обрабатывать.
export function useTabListNavigation({ hasMore = false, }) {
    const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX_TO_SELECT);
    const [forceScrollToLoader, setForceScrollToLoader] = useState(false);
    const tabsCount = useRef(0);
    const setTabsCount = useCallback((value) => (tabsCount.current = value), []);
    const selectHandler = useRef();
    const setSelectHandler = useCallback((handler) => (selectHandler.current = handler), []);
    const resetIndexToSelect = useCallback((index = INITIAL_INDEX_TO_SELECT) => {
        setForceScrollToLoader(false);
        setCurrentIndex(index);
    }, []);
    const onKeyDown = useCallback((keyCombo, event) => {
        if (tabsCount.current === 0) {
            // Не умеем навигироваться по пустому списку табов
            return;
        }
        switch (keyCombo) {
            // Обрабатываем Mod+Enter тоже для инпута с чипсами, чтобы добиться
            // аналогичного поведения как при клике.
            case 'Enter':
            case 'Mod+Enter':
                event.stopPropagation();
                event.preventDefault();
                selectHandler.current?.(currentIndex);
                break;
            case 'ArrowDown':
                event.stopPropagation();
                event.preventDefault();
                setForceScrollToLoader(hasMore && currentIndex + 1 === tabsCount.current);
                setCurrentIndex((current) => {
                    return current + 1 < tabsCount.current ? current + 1 : current;
                });
                break;
            case 'ArrowUp':
                event.stopPropagation();
                event.preventDefault();
                setCurrentIndex((current) => (current > 0 ? current - 1 : 0));
                setForceScrollToLoader(false);
                break;
            default:
                break;
        }
    }, [currentIndex, hasMore]);
    return {
        setTabsCount,
        setSelectHandler,
        indexToSelect: currentIndex,
        onKeyDown,
        resetIndexToSelect,
        forceScrollToLoader,
    };
}
//# sourceMappingURL=useKeyboardNavigation.js.map