import { insertChannels, insertPeers } from '../store/State';
import { CHANNELS_PER_PAGE } from '../../core/config/config';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import * as Channel from '../../core/model/Channel';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'MoreChannelsNeeded': {
            const { organiser, onComplete } = action;
            const { filter } = organiser;
            const lockId = ChannelFilters.getLockId(filter);
            if (draft.locks.getChannels[lockId] ||
                !draft.organisers.channelFilters[filter].hasMore) {
                onComplete?.(true);
                return [];
            }
            const { minorSortId, channelId } = draft.organisers.channelFilters[filter].boundary;
            draft.locks.getChannels[lockId] = true;
            /*
              Бэк возвращает айтемы с перекрытием, включая тот,
              с которого мы хотим начать выборку, поэтому делаем + 1
            */
            const count = CHANNELS_PER_PAGE + 1;
            const offsetMinorSortId = ChannelFilters.isLoaded(draft.organisers.channelFilters[filter])
                ? minorSortId
                : undefined;
            return [
                async function loadMoreChannels({ api }) {
                    try {
                        const res = await api.fetch('channels.get', {
                            count,
                            offset_minor_sort_id: offsetMinorSortId,
                            offset_channel_id: channelId,
                            filter: ChannelFilters.snakeCaseId(organiser.filter),
                            extended: 1,
                        }, {
                            retries: 3,
                        });
                        return {
                            ...action,
                            type: 'MoreChannelsNeeded_RequestCompleted',
                            hasFailed: false,
                            response: res,
                            hasMore: (res.items?.length || 0) >= count,
                            onComplete: action.onComplete,
                        };
                    }
                    catch (err) {
                        return {
                            ...action,
                            type: 'MoreChannelsNeeded_RequestCompleted',
                            hasFailed: true,
                            hasMore: false,
                            onComplete: action.onComplete,
                        };
                    }
                },
            ];
        }
        case 'MoreChannelsNeeded_RequestCompleted': {
            const { hasFailed, organiser, hasMore, onComplete } = action;
            let lockId = '';
            switch (organiser.kind) {
                case 'channelFilters': {
                    lockId = ChannelFilters.getLockId(organiser.filter);
                    break;
                }
                default:
                    exhaustivenessCheck(organiser.kind);
            }
            draft.locks.getChannels[lockId] = false;
            if (hasFailed) {
                onComplete?.(hasFailed);
                return [];
            }
            const { response } = action;
            if (response) {
                const channels = insertChannels(draft, {
                    apiChannels: response.items || [],
                    apiGroups: response.groups || [],
                    featureFlags,
                });
                insertPeers(draft, {
                    apiUsers: response.profiles || [],
                    apiGroups: response.groups || [],
                    apiContacts: [],
                });
                if (organiser.filter === 'inboundRequest') {
                    for (const { id } of channels) {
                        const channelDraft = draft.channels.get(id);
                        if (!channelDraft || channelDraft.kind !== 'Channel') {
                            continue;
                        }
                        Channel.setIsInboundRequest(channelDraft, true);
                    }
                }
                switch (organiser.kind) {
                    case 'channelFilters':
                        ChannelFilters.push(draft.organisers.channelFilters, organiser.filter, channels, hasMore);
                        if (organiser.filter === 'inboundRequest' &&
                            typeof response.total_count === 'number') {
                            ChannelFilters.updateCounters(draft.organisers.channelFilters, {
                                inboundRequestsTotal: response.total_count,
                            });
                        }
                        break;
                    default:
                        exhaustivenessCheck(organiser.kind);
                }
            }
            onComplete?.(hasFailed);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=MoreChannelsNeeded.js.map