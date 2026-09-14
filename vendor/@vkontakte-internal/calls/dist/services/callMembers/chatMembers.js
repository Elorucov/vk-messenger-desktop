import { COUNT_OF_CHAT_MEMBERS_TO_LOAD } from '../../constants';
import { getConversationMembers, searchChatMembers as searchChatMembersApi } from '../../services/backend';
import { mapAndNormalizeChatMembers } from '../../helpers/user';
import { handlePromiseError } from '../../helpers/logger';
/**
 * @deprecated use MessagesService
 */
export function loadChatMembers(me, vkId, enableChatMembersPagination) {
    const count = enableChatMembersPagination ? COUNT_OF_CHAT_MEMBERS_TO_LOAD : undefined;
    return getConversationMembers(vkId, count)
        .then((response) => {
        let data = [];
        if (response.profiles) {
            data = mapAndNormalizeChatMembers(response).sort((a, b) => {
                return a.peerId === me ? -1 : b.peerId === me ? 1 : 0;
            });
        }
        return {
            data,
            count: response.count || 0,
        };
    })
        .catch(handlePromiseError);
}
/**
 * @deprecated use MessagesService
 */
export function loadMoreChatMembers(me, vkId, chatMembersCache, loadedPage = 1) {
    const offset = loadedPage * COUNT_OF_CHAT_MEMBERS_TO_LOAD;
    return getConversationMembers(vkId, COUNT_OF_CHAT_MEMBERS_TO_LOAD, offset)
        .then((response) => {
        let filteredChatMembers = [];
        if (response.profiles) {
            const data = mapAndNormalizeChatMembers(response).sort((a, b) => {
                return a.peerId === me ? -1 : b.peerId === me ? 1 : 0;
            });
            data.forEach((profile) => {
                if (!(profile.id in chatMembersCache)) {
                    filteredChatMembers.push(profile);
                }
            });
        }
        return {
            data: filteredChatMembers,
            count: response.count,
        };
    })
        .catch(handlePromiseError);
}
/**
 * @deprecated use MessagesService
 */
export function searchChatMembers(vkId, q, chatMembersCache) {
    return searchChatMembersApi(vkId, q)
        .then((data) => {
        const foundCharMembers = mapAndNormalizeChatMembers(data);
        const filteredCharMembers = [];
        if (foundCharMembers.length) {
            foundCharMembers.forEach((member) => {
                if (!(member.id in chatMembersCache)) {
                    filteredCharMembers.push(member);
                }
            });
        }
        return { data: filteredCharMembers };
    })
        .catch(handlePromiseError);
}
//# sourceMappingURL=chatMembers.js.map