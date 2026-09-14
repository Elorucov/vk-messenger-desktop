import { useCallback, useMemo } from 'react';
import { useBrowserEnv } from './misc';
import { useStorageValue } from './useStorageValue';
import { pushWithLimit } from '../hooks/useSelectedConvosFromSearch';
const SELECTED_CHANNELS_LIMIT = 20;
/**
 * Хук для работы с каналами, ранее открытыми из списка найденных.
 * Получает их из storage. Добавляет в кэш каналов, которых там нет.
 * Умеет добавлять и удалять каналы.
 */
export const useSelectedChannelsFromSearch = () => {
    const { storage } = useBrowserEnv();
    const [selectedChannelsFromSearch, setSelectedChannelsFromSearch] = useStorageValue(storage, 'selected-channels-from-search', []);
    const push = useCallback((channelId) => setSelectedChannelsFromSearch((prevChannels) => {
        const isInList = prevChannels?.findIndex((id) => id === channelId) !== -1;
        if (isInList) {
            return prevChannels || [];
        }
        return pushWithLimit(channelId, prevChannels, SELECTED_CHANNELS_LIMIT);
    }), [setSelectedChannelsFromSearch]);
    const remove = useCallback((channelId) => {
        setSelectedChannelsFromSearch((prevChannels) => {
            return (prevChannels ?? []).filter((id) => id !== channelId);
        });
    }, [setSelectedChannelsFromSearch]);
    const removeAll = useCallback(() => setSelectedChannelsFromSearch(() => []), [setSelectedChannelsFromSearch]);
    return useMemo(() => ({
        channels: selectedChannelsFromSearch || [],
        push,
        remove,
        removeAll,
    }), [selectedChannelsFromSearch, push, remove, removeAll]);
};
//# sourceMappingURL=useSelectedChannelsFromSearch.js.map