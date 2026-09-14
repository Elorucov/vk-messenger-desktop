import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { FriendsApi } from '@vkontakte-internal/plugins';
import { COUNT_OF_FRIENDS_TO_LOAD } from '../../constants';
import { userFields } from '../users';
let FriendsService = class FriendsService {
    constructor(friendsApi) {
        this.friendsApi = friendsApi;
    }
    get({ options, params: { count = 10, fields = userFields.concat(',can_call,online_info'), filters = 'without_banned,without_deleted,without_dead', offset = 0, order = 'hints', ...params } = {}, } = {}) {
        return this.friendsApi.getUsers({
            ...params,
            count,
            fields,
            filters,
            offset,
            order,
        }, options);
    }
    getPage({ options, params: { loadedPage = 0, ...params } = {}, } = {}) {
        return this.get({
            options,
            params: {
                ...params,
                count: COUNT_OF_FRIENDS_TO_LOAD,
                offset: loadedPage * COUNT_OF_FRIENDS_TO_LOAD,
            },
        });
    }
    search({ options, params: { count = 10, fields = userFields.concat(',can_call,online_info,photo_50'), filters = 'without_banned,without_deleted,without_dead', offset = 0, q = '', ...params } = {}, } = {}) {
        return this.friendsApi.search({
            ...params,
            count,
            fields,
            filters,
            offset,
            q,
        }, options);
    }
};
FriendsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [FriendsApi])
], FriendsService);
export { FriendsService };
//# sourceMappingURL=FriendsService.js.map