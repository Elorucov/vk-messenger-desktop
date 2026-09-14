import { insertChannels, insertChatMembers, insertConvos, insertPeers, } from '../store/State';
import { fromApiMessage } from '../converter/MessageConverter';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
export const handler = (draft, action, featureFlags) => {
    const { profiles, groups, conversations, mutualFriends, contacts, chatMembers, dangerouslyOverwrite, channels, messages, } = action;
    insertConvos(draft, conversations || [], featureFlags);
    insertPeers(draft, {
        apiUsers: profiles || [],
        apiGroups: groups || [],
        apiContacts: contacts || [],
    }, {
        dangerouslyOverwrite,
    });
    if (mutualFriends) {
        const peer = draft.peers.get(Peer.resolveId(mutualFriends.peerId));
        if (peer) {
            Peer.updateMutualFriends(peer, mutualFriends.hint.map(Peer.resolveId), mutualFriends.count);
        }
    }
    if (chatMembers) {
        const convo = draft.convos.get(chatMembers.peerId);
        if (!convo || convo.kind !== 'ChatConvo') {
            return [];
        }
        insertChatMembers(convo.members, chatMembers.members);
    }
    if (channels) {
        insertChannels(draft, {
            apiChannels: channels.items || [],
            apiGroups: channels.groups || [],
            trackCodes: channels.trackCodes,
            dangerouslyMerge: dangerouslyOverwrite,
            featureFlags,
        });
        insertPeers(draft, {
            apiUsers: channels.profiles || [],
            apiGroups: channels.groups || [],
            apiContacts: [],
        });
    }
    if (messages) {
        for (const message of messages) {
            replaceMessage(featureFlags, draft, message);
        }
    }
    return [];
};
/**
 * Заменяет сообщение, сущесвующиее в истории, новым из апи.
 */
export function replaceMessage(featureFlags, draft, apiMessage, keyboardEvent) {
    const { message, mentions } = fromApiMessage(featureFlags, apiMessage);
    const convo = draft.convos.get(message.peerId);
    if (!convo) {
        return;
    }
    Convo.replaceMessage(convo, message, mentions.hasDirect || mentions.hasMass, keyboardEvent);
}
//# sourceMappingURL=CacheUpdateReceived.js.map