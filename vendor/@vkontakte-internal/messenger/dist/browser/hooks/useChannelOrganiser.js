import * as Channel from '../../core/model/Channel';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import { useMemo, useState } from 'react';
import { exhaustivenessCheck, isShallowEqual } from '../../core/utils/misc';
import { useMemoWithCustomCompare } from '../hooks/misc';
export function useChannelOrganiser(organisers, channelsCache, initial, disabled) {
    const [selectedOrganiser, setSelectedOrganiser] = useState(initial);
    const currentOrganiser = useMemo(() => {
        if (disabled) {
            const mockOrganiser = {
                organiser: selectedOrganiser,
                channels: [],
                hasMore: false,
            };
            return mockOrganiser;
        }
        let channels = [];
        switch (selectedOrganiser.kind) {
            case 'channelFilters': {
                if (!(selectedOrganiser.filter in organisers.channelFilters)) {
                    throw new Error('Выбрана несуществущая папка');
                }
                const filter = organisers.channelFilters[selectedOrganiser.filter];
                channels = Array.from(filter.channelIds)
                    .reduce((acc, channelId) => {
                    const channel = Channel.safeGet(channelsCache, channelId);
                    if (channel.kind === 'Channel') {
                        acc.push(channel);
                    }
                    return acc;
                }, [])
                    .sort(ChannelFilters.sorter);
                return {
                    organiser: selectedOrganiser,
                    channels,
                    hasMore: filter.hasMore,
                };
            }
            default:
                exhaustivenessCheck(selectedOrganiser.kind);
        }
    }, [disabled, selectedOrganiser, organisers.channelFilters, channelsCache]);
    const channelIds = currentOrganiser.channels.map(({ id }) => id);
    const memoizedChannelIds = useMemoWithCustomCompare(() => channelIds, channelIds, isShallowEqual);
    return {
        selectedOrganiser: currentOrganiser.organiser,
        channelIds: memoizedChannelIds,
        hasMore: currentOrganiser.hasMore,
        setSelectedOrganiser,
    };
}
//# sourceMappingURL=useChannelOrganiser.js.map