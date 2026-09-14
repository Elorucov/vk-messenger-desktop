import { useEffect, useState, useRef } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
import { useFeatureFlags, useOwner } from './misc';
import { getOwnerGroupId } from '../../data/store/State';
import * as Peer from '../../core/model/Peer';
import { CHAT_ONLINE_MEMBERS_REFRESH_INTERVAL } from '../../core/config/config';
const shortPollingMap = new Map();
export const useOnlineMembersCount = (peerId) => {
    const apiFetch = useApiFetch();
    const { id: ownerId } = useOwner();
    const featureFlags = useFeatureFlags();
    const groupId = getOwnerGroupId(ownerId);
    const polling = Peer.isChatPeerId(peerId)
        ? shortPollingMap.get(peerId)
        : undefined;
    const [onlineCount, setOnlineCount] = useState(featureFlags.vkm_online_members_count_poll && polling ? polling[1] : 0);
    const shortPollingTimeoutRef = useRef();
    useEffect(() => {
        if (!featureFlags.vkm_online_members_count_poll ||
            !Peer.isChatPeerId(peerId)) {
            return;
        }
        async function updateOnlineCount() {
            if (!Peer.isChatPeerId(peerId)) {
                return;
            }
            let onlineCount = 0;
            const { online_count: count } = await apiFetch('messages.getChatOnline', {
                peer_id: peerId,
                group_id: groupId,
            });
            onlineCount = count;
            setOnlineCount(onlineCount);
            shortPollingMap.set(peerId, [performance.now(), onlineCount]);
        }
        async function shortPoll() {
            clearTimeout(shortPollingTimeoutRef.current);
            try {
                if (!Peer.isChatPeerId(peerId)) {
                    return;
                }
                const polling = shortPollingMap.get(peerId);
                let timeout = CHAT_ONLINE_MEMBERS_REFRESH_INTERVAL;
                if (polling) {
                    const timeDiff = performance.now() - polling[0];
                    if (timeDiff > timeout) {
                        await updateOnlineCount();
                    }
                    else {
                        timeout = timeDiff;
                    }
                }
                else {
                    await updateOnlineCount();
                }
                shortPollingTimeoutRef.current = window.setTimeout(() => {
                    shortPoll();
                }, timeout);
            }
            catch (err) { }
        }
        shortPoll();
        return () => {
            clearTimeout(shortPollingTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        featureFlags.vkm_online_members_count_poll,
        peerId,
        apiFetch,
        groupId,
        shortPollingTimeoutRef.current,
    ]);
    return onlineCount;
};
//# sourceMappingURL=useOnlineMembersCount.js.map