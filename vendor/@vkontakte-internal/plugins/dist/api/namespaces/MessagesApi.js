import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ApiNamespace } from '../ApiNamespace';
let MessagesApi = class MessagesApi extends ApiNamespace {
    constructor() {
        super(...arguments);
        this.getCallParticipants = this.makeMethod('getCallParticipants');
        this.getCallPreview = this.makeMethod('getCallPreview');
        this.getCurrentCalls = this.makeMethod('getCurrentCalls');
        this.getInboundCalls = this.makeMethod('getInboundCalls');
        this.searchConversations = this.makeMethod('searchConversations');
        this.searchConversationMembers = this.makeMethod('searchConversationMembers');
        this.getConversations = this.makeMethod('getConversations');
        this.getGroupsForCall = this.makeMethod('getGroupsForCall');
        this.getConversationMembers = this.makeMethod('getConversationMembers');
        this.editCall = this.makeMethod('editCall');
        this.getScheduledCalls = this.makeMethod('getScheduledCalls');
        this.getConversationsById = this.makeMethod('getConversationsById');
        this.deleteScheduledCall = this.makeMethod('deleteScheduledCall');
        this.vkRoomsJoinCall = this.makeMethod('vkRoomsJoinCall');
        this.send = this.makeMethod('send');
        this.sendReaction = this.makeMethod('sendReaction');
        this.deleteReaction = this.makeMethod('deleteReaction');
        this.forceCallFinish = this.makeMethod('forceCallFinish');
        this.denyMessagesFromGroup = this.makeMethod('denyMessagesFromGroup');
        this.allowMessagesFromGroup = this.makeMethod('allowMessagesFromGroup');
        this.getHistoryAttachments = this.makeMethod('getHistoryAttachments');
        this.getById = this.makeMethod('getById');
        this.getReactionsAssets = this.makeMethod('getReactionsAssets');
        this.getChatPreview = this.makeMethod('getChatPreview');
    }
    get namespace() {
        return 'messages';
    }
};
MessagesApi = __decorate([
    scope.global()
], MessagesApi);
export { MessagesApi };
//# sourceMappingURL=MessagesApi.js.map