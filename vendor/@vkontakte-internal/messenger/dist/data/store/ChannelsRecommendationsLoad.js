import { exhaustivenessCheck } from '../../core/utils/misc';
import { insertChannels } from '../store/State';
import * as Channel from '../../core/model/Channel';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import { CHANNELS_PER_PAGE } from '../../core/config/config';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'ChannelsRecommendationsLoad': {
            if (draft.locks.loadChannelsRecommendationsIdsNew) {
                return [];
            }
            draft.locks.loadChannelsRecommendationsIdsNew = true;
            const offset = draft.organisers.channelFilters.recommended.channelIds.size;
            const totalCount = draft.organisers.channelFilters.recommended.totalCount;
            const queryUUID = draft.channelsGetRecommendationsQueryUUID;
            if (totalCount <= offset) {
                return [];
            }
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('channels.getRecommendations', {
                            extended: 1,
                            count: CHANNELS_PER_PAGE,
                            offset,
                            query_uuid: queryUUID,
                            source: 'messenger',
                        });
                        const { items, groups, count, track_codes } = response;
                        return {
                            type: 'ChannelsRecommendationsLoad_RequestCompleted',
                            channels: items,
                            groups,
                            totalCount: count,
                            trackCodes: track_codes,
                            hasFailed: false,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'ChannelsRecommendationsLoad_RequestCompleted',
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'ChannelsRecommendationsLoad_RequestCompleted': {
            draft.locks.loadChannelsRecommendationsIdsNew = false;
            const { channels = [], groups = [], trackCodes } = action;
            const cachedChannels = insertChannels(draft, {
                apiChannels: channels || [],
                apiGroups: groups || [],
                trackCodes,
                featureFlags,
                /**
                 * Если вдруг пользователь каким-то образом уже имеет канал из рекомендаций в кэше
                 * (например, переходил в него из какого-нибудь форварда поста) то перетираем его
                 * и помечаем не как просто канал в кэше, на который пользователь не подписан, а как
                 * рекомендованный канал!
                 */
                dangerouslyMerge: true,
            });
            cachedChannels.forEach((channel) => {
                const channelDraft = draft.channels.get(channel.id);
                if (!channelDraft || channelDraft.kind !== 'Channel') {
                    return;
                }
                /**
                 * Помечаем, что это не просто канал, который каким-то образом
                 * оказался у нас в кэше (на рекомендованные мы ещё не подписаны)
                 * а именно рекомендованный и он должен быть доступен в отдельном фильтре ChannelFilters.recommended
                 */
                Channel.setIsRecommended(channelDraft, true);
            });
            const totalCount = typeof action.totalCount === 'number'
                ? action.totalCount
                : cachedChannels.length;
            const hasMore = cachedChannels.length +
                draft.organisers.channelFilters.recommended.channelIds.size <
                totalCount;
            ChannelFilters.updateCounters(draft.organisers.channelFilters, {
                recommendedTotal: totalCount,
            });
            ChannelFilters.push(draft.organisers.channelFilters, 'recommended', cachedChannels, hasMore);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=ChannelsRecommendationsLoad.js.map