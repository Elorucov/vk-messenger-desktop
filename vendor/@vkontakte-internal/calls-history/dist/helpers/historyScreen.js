import { Ranges } from '@vkontakte-internal/shared';
import { EMPTY_PEER_ID, vkIdToPeerId } from '@vkontakte-internal/calls-core';
export function getHistoryCallPeerId(call) {
    const { chat, participant_ids, items } = call;
    let peerId = EMPTY_PEER_ID;
    if (chat) {
        if (chat.id) {
            peerId = vkIdToPeerId(Ranges.convertChatIdToChatPeerId(chat.id));
        }
    }
    else if (participant_ids?.length) {
        peerId = participant_ids[0];
    }
    else {
        if (items?.length && items[0]?.chat) {
            if (items[0].chat.id) {
                peerId = vkIdToPeerId(Ranges.convertChatIdToChatPeerId(items[0].chat.id));
            }
        }
    }
    return peerId;
}
export function getHistoryItemOwner(call, profiles) {
    let { chat, participant_ids, items } = call;
    let member = undefined;
    if (!chat) {
        if (participant_ids?.length) {
            let peerId = participant_ids[0];
            if (peerId in profiles) {
                member = profiles[peerId];
            }
        }
        else {
            if (items?.length && items[0]?.chat) {
                chat = items[0]?.chat;
            }
        }
    }
    return {
        member,
        chat,
    };
}
//# sourceMappingURL=historyScreen.js.map