import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { MessagesApi } from '@vkontakte-internal/plugins';
import { COUNT_OF_CHAT_MEMBERS_TO_LOAD } from '../../constants';
import { mapAndNormalizeChatMembers } from '../../helpers/user';
import { userFields } from '../users';
import { CallsConfigService } from '../config';
let MessagesService = class MessagesService {
    constructor(configService, messagesApi) {
        this.configService = configService;
        this.messagesApi = messagesApi;
    }
    getCallParticipants({ options, params: { fields = userFields, ...params }, }) {
        return this.messagesApi.getCallParticipants({ ...params, fields }, options);
    }
    getConversationMembers({ options, params: { count, extended = 1, fields = userFields.concat(',can_call'), offset = 0, ...params }, }) {
        return this.messagesApi.getConversationMembers({
            ...params,
            extended,
            fields,
            ...(count ? { count, offset } : {}),
        }, options);
    }
    getConversationMembersPage({ options, params: { loadedPage = 0, ...params }, }) {
        return this.getConversationMembers({
            options,
            params: {
                ...params,
                count: COUNT_OF_CHAT_MEMBERS_TO_LOAD,
                offset: loadedPage * COUNT_OF_CHAT_MEMBERS_TO_LOAD,
            },
        });
    }
    searchConversationMembers({ options, params: { count = 10, extended = 1, fields = userFields.concat(',can_call'), q = '', ...params }, }) {
        return this.messagesApi.searchConversationMembers({
            ...params,
            count,
            extended,
            fields,
            q,
        }, options);
    }
    getChatMembers(myPeerId, vkId) {
        const { enableChatMembersPagination } = this.configService.getConfig();
        const count = enableChatMembersPagination ? COUNT_OF_CHAT_MEMBERS_TO_LOAD : undefined;
        return this.getConversationMembers({ params: { count, peer_id: vkId } }).then((response) => {
            let members = [];
            if (response.profiles) {
                members = mapAndNormalizeChatMembers(response).sort((a, b) => {
                    return a.peerId === myPeerId ? -1 : b.peerId === myPeerId ? 1 : 0;
                });
            }
            return {
                members,
                count: response.count || 0,
            };
        });
    }
};
MessagesService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsConfigService,
        MessagesApi])
], MessagesService);
export { MessagesService };
//# sourceMappingURL=MessagesService.js.map