import { useCallback, useMemo } from 'react';
import { useBrowserEnv } from './misc';
import { useStorageValue } from './useStorageValue';
const SELECTED_CONVOS_LIMIT = 20;
/**
 * Хук для работы с беседами, ранее открытыми из списка найденных.
 * Получает их из storage. Добавляет в кэш беседы, которых там нет.
 * Умеет добавлять и удалять беседы .
 */
export const useSelectedConvosFromSearch = () => {
    const { storage } = useBrowserEnv();
    const [selectedConvosFromSearch, setSelectedConvosFromSearch] = useStorageValue(storage, 'selected-convos-from-search');
    const push = useCallback((peerId) => setSelectedConvosFromSearch((prevConvos) => pushWithLimit(peerId, prevConvos, SELECTED_CONVOS_LIMIT)), [setSelectedConvosFromSearch]);
    const remove = useCallback((peerId) => {
        setSelectedConvosFromSearch((prevConvos) => {
            return (prevConvos ?? []).filter((id) => id !== peerId);
        });
    }, [setSelectedConvosFromSearch]);
    const removeAll = useCallback(() => setSelectedConvosFromSearch(() => []), [setSelectedConvosFromSearch]);
    return useMemo(() => ({
        convos: selectedConvosFromSearch,
        push,
        remove,
        removeAll,
    }), [selectedConvosFromSearch, push, remove, removeAll]);
};
export function pushWithLimit(newValue, prev, limit) {
    const withoutNewValue = (prev ?? []).filter((item) => item !== newValue);
    return [newValue, ...withoutNewValue].slice(0, limit);
}
//# sourceMappingURL=useSelectedConvosFromSearch.js.map