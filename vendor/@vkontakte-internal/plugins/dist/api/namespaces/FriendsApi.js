import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ApiNamespace } from '../ApiNamespace';
let FriendsApi = class FriendsApi extends ApiNamespace {
    constructor() {
        super(...arguments);
        this.get = this.makeMethod('get');
        this.getIds = this.makeMethod('get');
        this.getUsers = (params, options) => {
            return this.makeMethod('get')(params.fields ? params : { ...params, fields: 'first_name' }, options);
        };
        this.getUsersWithPrefetch = (params, options) => {
            return this.makeMethod('get', true)(params.fields ? params : { ...params, fields: 'first_name' }, options);
        };
        this.search = this.makeMethod('search');
        this.getLists = this.makeMethod('getLists');
        this.getListsWithPrefetch = this.makeMethod('getLists', true);
        this.getFriendsDeletionSuggestions = this.makeMethod('getFriendsDeletionSuggestions');
        this.getFriendsDeletionSuggestionsWithPrefetch = this.makeMethod('getFriendsDeletionSuggestions', true);
        this.getOnlineExtended = (params, options) => {
            return this.makeMethod('getOnline')({ ...params, extended: 1 }, options);
        };
        this.getOnlineExtendedWithPrefetch = (params, options) => {
            return this.makeMethod('getOnline', true)({ ...params, extended: 1 }, options);
        };
        this.getMutualTotalCount = (params, options) => {
            return this.makeMethod('getMutual')({ ...params, need_common_count: 1 }, options);
        };
        this.getMutualTotalCountWithPrefetch = (params, options) => {
            return this.makeMethod('getMutual', true)({ ...params, need_common_count: 1 }, options);
        };
        this.getRequestsExtended = this.makeMethod('getRequests');
        this.getRequestsExtendedWithPrefetch = this.makeMethod('getRequests', true);
        this.getCounters = this.makeMethod('getCounters');
        this.getCountersWithPrefetch = this.makeMethod('getCounters', true);
        this.add = this.makeMethod('add');
        this.delete = this.makeMethod('delete');
        this.deleteBulk = this.makeMethod('deleteBulk');
        this.getRecommendations = this.makeMethod('getRecommendations');
        this.getRecommendationsWithPrefetch = this.makeMethod('getRecommendations', true);
        this.getFollowers = this.makeMethod('getFollowers');
        this.getFollowersWithPrefetch = this.makeMethod('getFollowers', true);
        this.hideSuggestion = this.makeMethod('hideSuggestion');
        this.requestsToSubscribers = this.makeMethod('requestsToSubscribers');
        this.deleteSubscriber = this.makeMethod('deleteSubscriber');
    }
    get namespace() {
        return 'friends';
    }
};
FriendsApi = __decorate([
    scope.global()
], FriendsApi);
export { FriendsApi };
//# sourceMappingURL=FriendsApi.js.map