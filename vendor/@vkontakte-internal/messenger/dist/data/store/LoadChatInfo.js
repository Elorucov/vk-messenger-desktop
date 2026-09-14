import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Convo from '../../core/model/Convo';
import * as ChatMembers from '../../core/model/ChatMembers';
import { getOwnerGroupId } from '../store/State';
import { fromApiConvo } from '../converter/ConvoConverter';
export const handler = (draft, action, featureFlags) => {
    switch (action.type) {
        case 'LoadChatInfo': {
            const { peerId } = action;
            const groupId = getOwnerGroupId(draft.ownerId);
            if (draft.locks.getConversationInfo.has(peerId)) {
                return [];
            }
            draft.locks.getConversationInfo.add(peerId);
            return [
                async function loadChatInfo({ api }) {
                    try {
                        const response = await api.fetch('messages.getConversationsById', {
                            peer_ids: peerId.toString(),
                            group_id: groupId,
                            extended: 0,
                        });
                        return {
                            type: 'LoadChatInfo_RequestComplete',
                            peerId,
                            convo: response.items[0],
                            hasFailed: !response.items[0],
                        };
                    }
                    catch {
                        return {
                            type: 'LoadChatInfo_RequestComplete',
                            peerId,
                            hasFailed: true,
                        };
                    }
                },
            ];
        }
        case 'LoadChatInfo_RequestComplete': {
            const { peerId, convo, hasFailed } = action;
            draft.locks.getConversationInfo.delete(peerId);
            const currentConvo = draft.convos.get(peerId);
            if (currentConvo?.kind !== 'ChatConvo' || hasFailed || !convo) {
                return [];
            }
            const newConvo = fromApiConvo(featureFlags, convo);
            if (newConvo?.convo.kind !== 'ChatConvo') {
                return [];
            }
            Convo.updateAcl(currentConvo, { ...newConvo.convo.acl });
            ChatMembers.setCount(currentConvo.members, newConvo.convo.members.count);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=LoadChatInfo.js.map