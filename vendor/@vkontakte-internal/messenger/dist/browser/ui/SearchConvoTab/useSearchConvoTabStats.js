import { useOwner, useBrowserEnv } from '../../hooks/misc';
import { useCallback, useRef, useEffect } from 'react';
export const useSearchConvoTabStats = ({ query, isActive, debouncedQuery, importantUsers, friends, selectedConvos, isLoadingFriends, globalResults, searchQueryUuid, }) => {
    const owner = useOwner();
    const { stats } = useBrowserEnv();
    const isQueryEmpty = query.length === 0;
    const getStatsBlockData = useCallback((entrypoint) => {
        switch (entrypoint) {
            case 'popular_suggestions': {
                return {
                    peerIds: [owner.id, ...(importantUsers ?? [])],
                    service: 'search_dialogs_recommendations',
                    block_name: 'search_cache_recommendations_important',
                    block_position: 1,
                };
            }
            case 'recent_searches': {
                const { convos } = selectedConvos;
                if (!convos || convos === 'loading') {
                    return null;
                }
                return {
                    peerIds: convos,
                    service: 'search_dialogs_recommendations',
                    block_name: 'search_cache_recommendations_recent',
                    block_position: 2,
                };
            }
            case 'conversations_search': {
                if (friends === 'loading') {
                    return null;
                }
                return {
                    peerIds: friends === 'empty' ? [] : [...friends],
                    service: 'search_dialogs',
                    block_name: 'search_local_dialogs',
                    block_position: 1,
                };
            }
            case 'global_search': {
                if (isLoadingFriends) {
                    return null;
                }
                return {
                    peerIds: globalResults === 'empty' ? [] : globalResults,
                    service: 'search_dialogs',
                    block_name: 'search_other_dialogs',
                    block_position: 2,
                };
            }
            default:
                return null;
        }
    }, [
        friends,
        globalResults,
        importantUsers,
        isLoadingFriends,
        owner.id,
        selectedConvos,
    ]);
    const $loggedResults = useRef({});
    const logResults = useCallback((entrypoint, shouldSkip) => {
        if (shouldSkip) {
            $loggedResults.current[entrypoint] = undefined;
            return;
        }
        const statsBlock = getStatsBlockData(entrypoint);
        if (!statsBlock) {
            $loggedResults.current[entrypoint] = undefined;
            return;
        }
        const { peerIds, ...blockData } = statsBlock;
        if ($loggedResults.current[entrypoint]?.resultsCount === peerIds.length) {
            return;
        }
        $loggedResults.current[entrypoint] = {
            resultsCount: peerIds.length,
        };
        stats.logEvent({
            type: 'type_action',
            screen: 'im_search_chats',
            type_action: {
                type: 'type_local_search_item',
                type_local_search_item: {
                    search_query_uuid: searchQueryUuid,
                    query_text: query,
                    query_duration: 0,
                    total_results: peerIds.length,
                    ...blockData,
                },
            },
        });
    }, [query, getStatsBlockData, searchQueryUuid, stats]);
    useEffect(() => {
        if (!isActive || debouncedQuery !== query) {
            $loggedResults.current = {};
            return;
        }
        logResults('popular_suggestions', !isQueryEmpty);
        logResults('recent_searches', !isQueryEmpty);
        logResults('conversations_search', isQueryEmpty);
        logResults('global_search', isQueryEmpty || globalResults === 'empty' || globalResults.length === 0);
    }, [debouncedQuery, globalResults, isActive, isQueryEmpty, logResults, query]);
    const logSelect = useCallback((entrypoint, peerId) => {
        const statsBlockData = getStatsBlockData(entrypoint);
        if (!statsBlockData) {
            return;
        }
        const { peerIds, ...blockData } = statsBlockData;
        const positionInBlock = peerIds.findIndex((id) => id === peerId) + 1;
        stats.logEvent({
            type: 'type_click',
            screen: 'im_search_chats',
            type_click: {
                type: 'type_search_local_click_item',
                item: {
                    type: 'click_item',
                    id: peerId,
                },
                position: positionInBlock,
                type_search_local_click_item: {
                    search_query_uuid: searchQueryUuid,
                    action: 'tap',
                    ...blockData,
                },
            },
        });
    }, [getStatsBlockData, searchQueryUuid, stats]);
    return { logSelect };
};
//# sourceMappingURL=useSearchConvoTabStats.js.map