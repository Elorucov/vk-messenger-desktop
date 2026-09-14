import { useMemo } from 'react';
/**
 * Хук возвращает true если выделен хотябы один элемент группы (включая корневой).
 */
export function useSelectedState(id, items, selectedId) {
    const isRootSelected = selectedId === id;
    return useMemo(() => isRootSelected || items.some((item) => item.id === selectedId), [items, selectedId, isRootSelected]);
}
//# sourceMappingURL=useSelectedState.js.map