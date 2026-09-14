import { useBrowserEnv, useInsertIntoCache, useOwner } from './misc';
import { useCallback } from 'react';
import { getOwnerGroupId } from '../../data/store/State';
import { useApiFetch } from '../hooks/useApiFetch';
export function useFetchConvosByIds() {
    const owner = useOwner();
    const insertIntoCache = useInsertIntoCache();
    const { logger } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const fetchConvosByIds = useCallback(async (peerIds) => {
        try {
            const { profiles, contacts, items, groups } = await apiFetch('messages.getConversationsById', {
                peer_ids: peerIds.join(','),
                extended: 1,
                group_id: getOwnerGroupId(owner.id),
            }, { retries: 3 });
            insertIntoCache({
                profiles,
                groups,
                conversations: items,
                contacts,
            });
        }
        catch (error) {
            logger.info('Не удалось загрузить чаты!');
        }
    }, [apiFetch, logger, insertIntoCache, owner.id]);
    return {
        fetchConvosByIds,
    };
}
//# sourceMappingURL=useFetchConvosByIds.js.map