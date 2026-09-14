import * as Peer from '../../core/model/Peer';
import { useInsertIntoCache, useOwner, } from '../hooks/misc';
import { fromApiConvoAttach } from '../../data/converter/AttachConverter';
import { useCallback, useLayoutEffect, useState } from 'react';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { getOwnerGroupId } from '../../data/store/State';
import { useApiFetch, useApiFetchMany } from '../hooks/useApiFetch';
const CONVO_ATTACHES_PER_PAGE = 30;
/**
 * Хук позволяет получить вложения для открытого чата,
 */
export function useConvoAttaches(peerId) {
    const [attaches, setAttaches] = useState(null);
    const insertIntoCache = useInsertIntoCache();
    const apiFetch = useApiFetch();
    const owner = useOwner();
    /**
     * Сброс списка вложений в случае смены peerId
     */
    useLayoutEffect(() => () => {
        setAttaches(null);
    }, [peerId]);
    const getNextPage = useCallback(async (type) => {
        const updatedAttaches = attaches || {};
        if (updatedAttaches[type]?.isLoading ||
            updatedAttaches[type]?.isAllLoaded) {
            return;
        }
        setConvoAttachesLoadingState(updatedAttaches, true, type);
        setAttaches({ ...updatedAttaches });
        const loadedAttaches = await loadConvoAttaches(apiFetch, peerId, owner.id, type, insertIntoCache, updatedAttaches[type]?.cursorNextLoad || undefined);
        insertAttaches(updatedAttaches, loadedAttaches);
        setConvoAttachesLoadingState(updatedAttaches, false, type);
        setAttaches({ ...updatedAttaches });
    }, [apiFetch, attaches, owner.id, peerId, insertIntoCache]);
    return {
        attaches,
        getNextPage,
    };
}
async function loadConvoAttaches(apiFetch, peerId, ownerId, attachesType, insertIntoCache, startFrom) {
    try {
        const response = await apiFetch('messages.getHistoryAttachments', {
            peer_id: peerId,
            media_type: typeConvector(attachesType),
            count: CONVO_ATTACHES_PER_PAGE,
            start_from: startFrom,
            extended: 1,
            group_id: getOwnerGroupId(ownerId),
        }, { retries: 5 });
        /**
         * Если не пришли результаты,
         * значит дошли до лимита вложений
         */
        if (!response.items || response.items.length === 0) {
            return {
                [attachesType]: {
                    items: [],
                    isAllLoaded: true,
                    cursorNextLoad: null,
                },
            };
        }
        insertIntoCache({
            profiles: response.profiles,
            groups: response.groups,
            contacts: response.contacts,
        });
        const parsedAttaches = fromApiConvoAttach(response.items)[attachesType]?.map((attach) => {
            if ('messageAccessKey' in attach.attach) {
                // Тот access_key, что присылает бэк в messages.getHistoryAttachments не дружит с запросом на шаринг
                // Он отправляется там как параметр list и не проходит проверку
                // Чтоб все работало отдаём понятный access key
                attach.attach = {
                    ...attach.attach,
                    messageAccessKey: `mail${peerId}-${attach.cmid}`,
                };
            }
            return attach;
        }) || [];
        return {
            [attachesType]: {
                items: parsedAttaches,
                isAllLoaded: !response.next_from,
                cursorNextLoad: response.next_from,
            },
        };
    }
    catch (err) {
        return {};
    }
}
const typeConvector = (type) => ({
    audios: 'audio',
    videos: 'video',
    docs: 'doc',
    links: 'share',
    photos: 'photo',
    miniAppWidgets: 'app_action_mini_apps',
})[type];
function setConvoAttachesLoadingState(cache, state, mediaType) {
    if (!cache[mediaType]) {
        createAttachesByType(cache, mediaType);
    }
    const typeCache = cache[mediaType];
    if (typeCache) {
        typeCache.isLoading = state;
    }
}
/**
 * Добавляет вложения в кеш.
 * cache - draft вложений
 * cacheChunk - новые вложения
 */
function insertAttaches(cache, cacheChunk) {
    if (cacheChunk.audios) {
        cache.audios = {
            items: (cache.audios?.items || []).concat(cacheChunk.audios.items),
            cursorNextLoad: cacheChunk.audios.cursorNextLoad || null,
            isAllLoaded: cacheChunk.audios.isAllLoaded,
        };
    }
    if (cacheChunk.docs) {
        cache.docs = {
            items: (cache.docs?.items || []).concat(cacheChunk.docs.items),
            cursorNextLoad: cacheChunk.docs.cursorNextLoad || null,
            isAllLoaded: cacheChunk.docs.isAllLoaded,
        };
    }
    if (cacheChunk.links) {
        cache.links = {
            items: (cache.links?.items || []).concat(cacheChunk.links.items),
            cursorNextLoad: cacheChunk.links.cursorNextLoad || null,
            isAllLoaded: cacheChunk.links.isAllLoaded,
        };
    }
    if (cacheChunk.photos) {
        cache.photos = {
            items: (cache.photos?.items || []).concat(cacheChunk.photos.items),
            cursorNextLoad: cacheChunk.photos.cursorNextLoad || null,
            isAllLoaded: cacheChunk.photos.isAllLoaded,
        };
    }
    if (cacheChunk.videos) {
        cache.videos = {
            items: (cache.videos?.items || []).concat(cacheChunk.videos.items),
            cursorNextLoad: cacheChunk.videos.cursorNextLoad || null,
            isAllLoaded: cacheChunk.videos.isAllLoaded,
        };
    }
    if (cacheChunk.miniAppWidgets) {
        cache.miniAppWidgets = {
            items: (cache.miniAppWidgets?.items || []).concat(cacheChunk.miniAppWidgets.items),
            cursorNextLoad: cacheChunk.miniAppWidgets.cursorNextLoad || null,
            isAllLoaded: cacheChunk.miniAppWidgets.isAllLoaded,
        };
    }
}
function createAttachesByType(cache, type) {
    switch (type) {
        case 'audios':
        case 'videos':
        case 'docs':
        case 'links':
        case 'photos':
        case 'miniAppWidgets':
            cache[type] = {
                items: [],
                cursorNextLoad: null,
                isAllLoaded: false,
            };
            break;
        default: {
            exhaustivenessCheck(type);
        }
    }
}
export function useConvoAttachesGetMissedPeers(requiredIds) {
    const insertIntoCache = useInsertIntoCache();
    const apiFetchMany = useApiFetchMany();
    const userIds = requiredIds.filter((id) => Peer.isUserPeerId(id)).join(',');
    const groupIds = requiredIds
        .filter((id) => Peer.isGroupPeerId(id))
        .map((groupId) => Peer.toRealId(groupId))
        .join(',');
    const fetchProfilesAndGroups = useCallback(async () => {
        if (userIds.length === 0 && groupIds.length === 0) {
            return;
        }
        const [profiles, groups] = await apiFetchMany([
            userIds.length !== 0 && {
                method: 'users.get',
                params: { user_ids: userIds, extended: 1 },
            },
            groupIds.length !== 0 && {
                method: 'groups.getById',
                params: { group_ids: groupIds, extended: 1 },
            },
        ], { retries: 3 });
        insertIntoCache({
            profiles: profiles || [],
            groups: groups?.groups || [],
        });
    }, [apiFetchMany, groupIds, insertIntoCache, userIds]);
    return { fetchProfilesAndGroups };
}
//# sourceMappingURL=useConvoAttaches.js.map