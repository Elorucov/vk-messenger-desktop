import { useEffect, useRef } from 'react';
import * as Peer from '../../core/model/Peer';
import { useBrowserEnv, useInsertIntoCache, usePeers, useViewer, } from '../hooks/misc';
import { exhaustivenessCheck, noop } from '../../core/utils/misc';
const HINT_SIZE = 3;
/**
 * Хук позволяет получить информацию,
 * для того чтобы выводить красивый хинт общих друзей
 * с пользователем или сообществом.
 */
export function useMutualHint(peer) {
    const { viewer } = useViewer();
    const peers = usePeers();
    const { api } = useBrowserEnv();
    const insertIntoCache = useInsertIntoCache();
    const lock = useRef(false);
    useEffect(() => {
        if (!peer || peer.mutualFriends !== undefined) {
            return;
        }
        if (lock.current) {
            return;
        }
        lock.current = true;
        switch (peer.kind) {
            case 'User':
                api
                    .fetch('friends.getMutual', {
                    source_uid: viewer.id,
                    target_uid: peer.id,
                    order: 'random',
                })
                    .then((ids) => {
                    const hint = cached(ids.map(Peer.resolveId), peers);
                    if (ids.length === 0 || hint.length === HINT_SIZE) {
                        insertIntoCache({
                            mutualFriends: {
                                peerId: peer.id,
                                hint: ids,
                                count: ids.length,
                            },
                        });
                        return;
                    }
                    return api
                        .fetch('users.get', {
                        user_ids: ids.slice(0, HINT_SIZE).join(','),
                    })
                        .then((responseUsers) => {
                        insertIntoCache({
                            profiles: responseUsers,
                            mutualFriends: {
                                peerId: peer.id,
                                hint: ids,
                                count: ids.length,
                            },
                        });
                    });
                })
                    .catch(noop)
                    .finally(() => (lock.current = false));
                break;
            case 'Group':
                api
                    .fetch('groups.getMembers', {
                    group_id: Peer.toRealId(peer.id).toString(),
                    filter: 'friends',
                    count: HINT_SIZE,
                })
                    .then((response) => {
                    insertIntoCache({
                        profiles: response.items,
                        mutualFriends: {
                            peerId: peer.id,
                            hint: response.items.map((item) => item.id),
                            count: response.count,
                        },
                    });
                })
                    .catch(noop)
                    .finally(() => (lock.current = false));
                break;
            default:
                exhaustivenessCheck(peer);
        }
    }, [peer, peers, viewer.id, api, insertIntoCache]);
    return (peer?.mutualFriends && {
        hint: cached(peer.mutualFriends.hint, peers),
        count: peer.mutualFriends.count,
    });
}
function cached(ids, peers) {
    return (ids || []).reduce((acc, id) => {
        const existing = peers.get(id);
        if (existing && existing.kind === 'User') {
            acc.push(existing);
        }
        return acc;
    }, []);
}
//# sourceMappingURL=useMutualFriends.js.map