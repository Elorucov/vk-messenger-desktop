import * as Reaction from '../../core/model/Reaction';
import * as Peer from '../../core/model/Peer';
import { useCallback, useEffect, useState } from 'react';
import { useInsertIntoCache, useOwner } from './misc';
import { getOwnerGroupId } from '../../data/store/State';
import { useApiFetch } from '../hooks/useApiFetch';
export function useMessageReactedPeers({ peerId, cmid, reactionId, }) {
    const apiFetch = useApiFetch();
    const owner = useOwner();
    const insertIntoCache = useInsertIntoCache();
    const [isLoading, setLoading] = useState(false);
    const [isFailed, setFailed] = useState(false);
    const [peers, setPeers] = useState([]);
    useEffect(() => {
        setPeers([]);
        setLoading(false);
    }, [peerId, cmid, reactionId]);
    const load = useCallback(async () => {
        try {
            setFailed(false);
            setLoading(true);
            const response = await apiFetch('messages.getReactedPeers', {
                peer_id: peerId,
                cmid: cmid,
                reaction_id: reactionId,
                group_id: getOwnerGroupId(owner.id),
                extended: 1,
            });
            insertIntoCache({
                contacts: response.contacts,
                groups: response.groups,
                profiles: response.profiles,
            });
            const reactedPeers = (reactionId
                ? response.reactions.filter((reaction) => reaction.reaction_id === reactionId)
                : response.reactions).map((reaction) => ({
                peerId: Peer.resolveId(reaction.user_id),
                reactionId: Reaction.resolveId(reaction.reaction_id),
            }));
            setPeers(reactedPeers);
        }
        catch {
            setFailed(true);
        }
        finally {
            setLoading(false);
        }
    }, [apiFetch, cmid, insertIntoCache, owner.id, peerId, reactionId]);
    const reset = useCallback(() => setPeers([]), []);
    return {
        isLoading,
        isFailed,
        load,
        reset,
        peers,
    };
}
//# sourceMappingURL=useMessageReactedPeers.js.map