import * as Peer from '../../core/model/Peer';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedGroupMembership': {
            const group = draft.peers.get(action.groupId);
            if (group?.kind !== 'Group' ||
                draft.locks.updateFriendshipOrMembership.has(group.id)) {
                return [];
            }
            const prevMembership = group.membership;
            Peer.updateMembership(group, action.change);
            if (prevMembership === group.membership) {
                return [];
            }
            draft.locks.updateFriendshipOrMembership.add(group.id);
            return [
                async function joinLeaveGroup({ api }) {
                    const method = `groups.${action.change}`;
                    let hasFailed = false;
                    try {
                        await api.fetch(method, { group_id: -action.groupId });
                    }
                    catch (err) {
                        hasFailed = true;
                    }
                    return {
                        type: 'UserChangedGroupMembership_RequestCompleted',
                        groupId: action.groupId,
                        change: action.change,
                        hasFailed,
                    };
                },
            ];
        }
        case 'UserChangedGroupMembership_RequestCompleted': {
            draft.locks.updateFriendshipOrMembership.delete(action.groupId);
            const group = draft.peers.get(action.groupId);
            if (group?.kind !== 'Group') {
                return [];
            }
            if (action.hasFailed) {
                Peer.updateMembership(group, { join: 'leave', leave: 'join' }[action.change]);
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedGroupMembership.js.map