import * as Peer from '../../core/model/Peer';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserChangedFriendship': {
            const user = draft.peers.get(action.userId);
            if (user?.kind !== 'User' ||
                draft.locks.updateFriendshipOrMembership.has(user.id)) {
                return [];
            }
            const prevFriendship = user.friendship;
            Peer.updateFriendship(user, action.change);
            if (prevFriendship === user.friendship) {
                return [];
            }
            draft.locks.updateFriendshipOrMembership.add(user.id);
            return [
                async function addDeleteFriend({ api }) {
                    let hasFailed = false;
                    try {
                        await api.fetch(`friends.${action.change}`, {
                            user_id: Peer.toRealId(action.userId),
                        });
                    }
                    catch (err) {
                        hasFailed = true;
                    }
                    return {
                        type: 'UserChangedFriendship_RequestCompleted',
                        userId: action.userId,
                        change: action.change,
                        hasFailed,
                    };
                },
            ];
        }
        case 'UserChangedFriendship_RequestCompleted': {
            draft.locks.updateFriendshipOrMembership.delete(action.userId);
            const user = draft.peers.get(action.userId);
            if (user?.kind !== 'User') {
                return [];
            }
            if (action.hasFailed) {
                Peer.updateFriendship(user, { add: 'delete', delete: 'add' }[action.change]);
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserChangedFriendship.js.map