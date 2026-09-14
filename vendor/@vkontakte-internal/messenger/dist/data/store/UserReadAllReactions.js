import { exhaustivenessCheck } from '../../core/utils/misc';
import { getOwnerGroupId } from './State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserReadAllReactions': {
            const { peerId } = action;
            if (draft.locks.readAllReactions.has(peerId)) {
                return [];
            }
            draft.locks.readAllReactions.add(peerId);
            const groupId = getOwnerGroupId(draft.ownerId);
            const convo = draft.convos.get(peerId);
            let prevUnreadReactions = new Map();
            if (convo) {
                prevUnreadReactions = new Map(convo.unreadReactions.entries());
                convo.unreadReactions.clear();
            }
            return [
                async function readAllReactions({ api }) {
                    try {
                        const response = await api.fetch('messages.markReactionsAsRead', {
                            peer_id: peerId,
                            // @TODO: убрать передачу cmid когда поправят метод и он будет прочитывать всё с пустым параметром
                            cmids: Array.from(prevUnreadReactions.keys()).join(','),
                            group_id: groupId,
                        });
                        return {
                            type: 'UserReadAllReactions_RequestCompleted',
                            peerId,
                            hasFailed: response !== 1,
                            unreadReactions: prevUnreadReactions,
                        };
                    }
                    catch {
                        return {
                            type: 'UserReadAllReactions_RequestCompleted',
                            peerId,
                            hasFailed: true,
                            unreadReactions: prevUnreadReactions,
                        };
                    }
                },
            ];
        }
        case 'UserReadAllReactions_RequestCompleted': {
            const { hasFailed, peerId, unreadReactions } = action;
            draft.locks.readAllReactions.delete(peerId);
            if (!hasFailed) {
                return [];
            }
            const convo = draft.convos.get(peerId);
            if (convo) {
                convo.unreadReactions = new Map([
                    ...unreadReactions,
                    ...convo.unreadReactions,
                ]);
            }
            return [];
        }
        default:
            return exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserReadAllReactions.js.map