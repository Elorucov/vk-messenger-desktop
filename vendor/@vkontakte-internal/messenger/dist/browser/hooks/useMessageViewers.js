import { useCallback, useMemo, useState } from 'react';
import { useInsertIntoCache } from './misc';
import * as Peer from '../../core/model/Peer';
import { fromApiGroup, fromApiUser } from '../../data/converter/PeerConverter';
import { useApiFetch } from '../hooks/useApiFetch';
import { useLoadingStage } from './useLoadingStage';
export const useMessageViewers = ({ message }) => {
    const apiFetch = useApiFetch();
    const insertIntoCache = useInsertIntoCache();
    const [isLoading, setIsLoading] = useState(false);
    const { stage, setReady, setFailed } = useLoadingStage();
    const [viewers, setViewers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const hasMore = useMemo(() => {
        return totalCount - viewers.length > 0;
    }, [totalCount, viewers.length]);
    const fetchViewers = useCallback(async () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        try {
            const { profiles = [], groups = [], items = [], total_count = 0, } = await apiFetch('messages.getMessageReadPeers', {
                cmid: message.cmid,
                peer_id: message.peerId,
                offset_major_id: viewers.length,
                extended: 1,
            });
            insertIntoCache({
                profiles,
                groups,
            });
            const newViewers = items.reduce((acc, viewerId) => {
                const id = Peer.resolveAnyId(viewerId);
                if (viewers.find((viewer) => viewer.id === id)) {
                    return acc;
                }
                if (Peer.isUserPeerId(id)) {
                    const profile = profiles.find((el) => el.id === id);
                    return profile ? [...acc, fromApiUser(profile).user] : acc;
                }
                if (Peer.isGroupPeerId(id)) {
                    const group = groups.find((el) => el.id === Peer.resolveRealId('Group', id));
                    return group ? [...acc, fromApiGroup(group)] : acc;
                }
                return acc;
            }, []);
            setViewers((viewers) => {
                return [...viewers, ...newViewers];
            });
            setTotalCount(total_count);
            setReady();
        }
        catch (e) {
            setFailed();
        }
        finally {
            setIsLoading(false);
        }
    }, [
        setViewers,
        viewers,
        setReady,
        setFailed,
        apiFetch,
        message,
        isLoading,
        insertIntoCache,
    ]);
    return {
        stage,
        viewers,
        hasMore,
        fetchViewers,
        totalCount,
    };
};
//# sourceMappingURL=useMessageViewers.js.map