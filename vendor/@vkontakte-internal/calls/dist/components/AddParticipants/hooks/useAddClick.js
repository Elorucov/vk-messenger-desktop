import { useCallback, useState } from 'react';
import { loadChatMembers, loadFriends, loadGroupMembers, } from '../../../services/callMembers';
import { isChatPeer } from '@vkontakte-internal/vkjs/lib/im/Helpers';
import { ManagementModalView, peerIdToVkId, useCallsBridge } from '@vkontakte-internal/calls-core';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getCallData, getFriends, getGroupMembers, getMyId, getPeerId } from '../../../selectors';
import { useConfig } from '../../../services/config';
import { setChatInfo, setFriends, setGroupMembers } from '../../../actions/callMembers';
import { batch } from 'react-redux';
export const useAddClick = (setView) => {
    const dispatch = useTypedDispatch();
    const { enableChatMembersPagination } = useConfig();
    const bridge = useCallsBridge();
    const groupMembers = useTypedSelector(getGroupMembers);
    const friends = useTypedSelector(getFriends);
    const myId = useTypedSelector(getMyId);
    const peerId = useTypedSelector(getPeerId);
    const callData = useTypedSelector(getCallData);
    const [fetching, setFetching] = useState(false);
    const onAddClick = useCallback(() => {
        setFetching(true);
        const vkId = peerIdToVkId(peerId);
        const promises = [
            !bridge.authorizedGroupId && friends.length === 0 && !bridge.getFriends ? loadFriends() : {},
            isChatPeer(vkId) ? loadChatMembers(myId, vkId, enableChatMembersPagination) : {},
            bridge.authorizedGroupId && groupMembers.length === 0 ? loadGroupMembers(bridge.authorizedGroupId) : {},
        ];
        return Promise.all(promises)
            .then(([friends, chatMembers, groupMembers]) => {
            batch(() => {
                friends?.data &&
                    !bridge.getFriends &&
                    dispatch(setFriends({ count: friends.count, members: friends.data }));
                if (bridge.getFriends) {
                    const friends = bridge.getFriends();
                    if (friends !== null) {
                        dispatch(setFriends({ members: friends }));
                    }
                }
                chatMembers?.data &&
                    dispatch(setChatInfo({
                        count: chatMembers.count,
                        conversation: callData.conversation,
                        members: chatMembers.data,
                    }));
                groupMembers?.data &&
                    dispatch(setGroupMembers({
                        count: groupMembers.count,
                        members: groupMembers.data,
                        unableToCallGroupMembersIds: groupMembers.unableToCallGroupMembersIds,
                    }));
            });
            setFetching(false);
            setView(ManagementModalView.ADD_PARTICIPANTS);
        })
            .catch((err) => {
            console.error(err);
            setFetching(false);
        });
    }, [peerId, callData, friends, groupMembers, setView]);
    return {
        action: onAddClick,
        fetching,
    };
};
//# sourceMappingURL=useAddClick.js.map