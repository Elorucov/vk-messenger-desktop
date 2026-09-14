import { useMemo, useReducer, useRef } from 'react';
import { useCallback } from 'react';
export function useFocusItemsCache() {
    const $focusItems = useRef(new Map());
    const [state, forceUpdate] = useReducer((x) => ++x, 0);
    const setFocusItem = useCallback((historyId, focusItem, shouldRerender = true) => {
        if (focusItem !== null) {
            $focusItems.current.set(historyId, focusItem);
        }
        else {
            $focusItems.current.delete(historyId);
        }
        if (shouldRerender) {
            $focusItems.current = new Map($focusItems.current);
            forceUpdate();
        }
    }, [forceUpdate]);
    const getFocusItem = useCallback((historyId) => {
        return $focusItems.current.get(historyId);
    }, 
    // Добавляем в зависимости state, для обновления компонентов,
    // в которые передаем пропсом.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]);
    return useMemo(() => ({
        getFocusItem,
        setFocusItem,
    }), [getFocusItem, setFocusItem]);
}
//# sourceMappingURL=useFocusItemsCache.js.map