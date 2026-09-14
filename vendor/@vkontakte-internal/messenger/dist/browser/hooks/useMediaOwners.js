import { useCallback, useEffect, useState } from 'react';
import * as Peer from '../../core/model/Peer';
import { fromApiGroup, fromApiUser } from '../../data/converter/PeerConverter';
import { useInsertIntoCache, usePeers } from '../hooks/misc';
import { useApiFetchMany } from '../hooks/useApiFetch';
export const useMediaOwners = ({ media }) => {
    const apiFetchMany = useApiFetchMany();
    const peers = usePeers();
    const insertIntoCache = useInsertIntoCache();
    const [mediaOwners, setMediaOwners] = useState(new Map());
    /* Устанавливаем владельцев медиа */
    useEffect(() => {
        ;
        (async () => {
            const owners = new Map();
            const usersToFetch = [];
            const groupsToFetch = [];
            /*
              Для каждого медиа либо берем владельца из кэша,
              либо кладем его ID в массив для последующей дозагрузки
            */
            media.forEach((mediaItem) => {
                const ownerId = Peer.resolveAnyId(mediaItem.ownerId);
                const isUser = Peer.isUserPeerId(ownerId);
                const isGroup = Peer.isGroupPeerId(ownerId);
                if (!isUser && !isGroup) {
                    return;
                }
                const peerFromCache = peers.get(ownerId);
                if (peerFromCache &&
                    (peerFromCache.kind === 'User' || peerFromCache.kind === 'Group')) {
                    owners.set(peerFromCache.id, peerFromCache);
                }
                else if (isUser) {
                    usersToFetch.push(Peer.toRealId(ownerId));
                }
                else if (isGroup) {
                    groupsToFetch.push(Peer.toRealId(ownerId));
                }
            });
            try {
                const [usersResponse, groupsResponse] = await apiFetchMany([
                    usersToFetch.length > 0 && {
                        method: 'users.get',
                        params: {
                            user_ids: usersToFetch.join(','),
                        },
                    },
                    groupsToFetch.length > 0 && {
                        method: 'groups.getById',
                        params: {
                            group_ids: groupsToFetch.join(','),
                        },
                    },
                ]);
                const usersProfiles = usersResponse ?? [];
                const groupsProfiles = groupsResponse?.profiles ?? [];
                const groups = groupsResponse?.groups ?? [];
                const profilesToInsertIntoCache = [...usersProfiles, ...groupsProfiles];
                if (profilesToInsertIntoCache.length || groups.length) {
                    insertIntoCache({
                        profiles: profilesToInsertIntoCache,
                        groups,
                    });
                }
                usersProfiles.forEach((profile) => {
                    const user = fromApiUser(profile).user;
                    owners.set(user.id, user);
                });
                groups.forEach((apiGroup) => {
                    const group = fromApiGroup(apiGroup);
                    owners.set(group.id, group);
                });
            }
            catch {
                // pass
            }
            setMediaOwners(owners);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media]);
    const getMediaOwner = useCallback((ownerId) => {
        const EMPTY_RETURN = {
            photo: undefined,
            name: '',
        };
        if (!ownerId) {
            return EMPTY_RETURN;
        }
        const resolvedOwnerId = Peer.resolveAnyId(ownerId);
        if (!Peer.isUserPeerId(resolvedOwnerId) &&
            !Peer.isGroupPeerId(resolvedOwnerId)) {
            return EMPTY_RETURN;
        }
        const owner = mediaOwners.get(resolvedOwnerId);
        if (!owner) {
            return EMPTY_RETURN;
        }
        return {
            photo: owner.photo,
            name: Peer.name(owner),
        };
    }, [mediaOwners]);
    return {
        getMediaOwner,
    };
};
//# sourceMappingURL=useMediaOwners.js.map