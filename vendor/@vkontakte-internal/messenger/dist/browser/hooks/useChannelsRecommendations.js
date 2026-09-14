import { useChannels, useDispatch, useOrganisers } from '../hooks/misc';
import * as Channel from '../../core/model/Channel';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import { useLayoutData } from '../ui/LayoutDataProvider/LayoutDataProvider';
import { useMemo, useState } from 'react';
export function useChannelsRecommendations() {
    const { isMobileLayout } = useLayoutData();
    const { recommended } = useOrganisers().channelFilters;
    const [countOfShownChannels, setCountOfShownChannels] = useState(0);
    const channelsCache = useChannels();
    const dispatch = useDispatch();
    const channelsRecommendations = useMemo(() => Array.from(recommended.channelIds)
        .map((channelId) => Channel.safeGet(channelsCache, channelId))
        .filter((channel) => channel.kind === 'Channel')
        .sort(ChannelFilters.sorter)
        .slice(0, countOfShownChannels)
        .filter((channel) => Boolean(channel)), [recommended.channelIds, channelsCache, countOfShownChannels]);
    // на сервере есть ещё рекомендованные каналы
    const hasMoreOnServer = recommended.totalCount > recommended.channelIds.size;
    // в кэше на клиенте есть что ещё показать
    const hasMoreInCache = recommended.channelIds.size > countOfShownChannels;
    const hasMore = hasMoreOnServer || hasMoreInCache;
    const loadMore = () => {
        const COUNT_PER_PAGE = isMobileLayout ? 10 : 20; // микрооптимизация для мобилок
        const nextCountOfShownChannels = countOfShownChannels + COUNT_PER_PAGE;
        if (hasMoreInCache) {
            setCountOfShownChannels(() => nextCountOfShownChannels > recommended.channelIds.size
                ? recommended.channelIds.size
                : nextCountOfShownChannels);
        }
        else if (hasMoreOnServer) {
            /**
             * Для отбражения след страницы рекомендаций данных из кэша недостаточно - нужно сходить на сервер
             */
            dispatch({ type: 'ChannelsRecommendationsLoad' });
            /**
             * Не увеличиваем кол-во показываемых страниц пока не загрузится текущая.
             * Ждём пока 'ChannelsRecommendationsLoad' догрузит кэш recommended.channelIds до желаемого кол-ва countOfShownChannels
             */
            if (countOfShownChannels > recommended.channelIds.size) {
                return;
            }
            setCountOfShownChannels(() => nextCountOfShownChannels > recommended.totalCount
                ? recommended.totalCount
                : nextCountOfShownChannels);
        }
    };
    return { channelsRecommendations, loadMore, hasMore };
}
//# sourceMappingURL=useChannelsRecommendations.js.map