import { __decorate } from "tslib";
import { ApiNamespace } from '../ApiNamespace';
import { scope } from '@vkontakte-internal/di';
let UsersApi = class UsersApi extends ApiNamespace {
    constructor() {
        super(...arguments);
        this.getWithPrefetch = this.makeMethod('get', true);
        this.get = this.makeMethod('get');
        this.getFollowers = this.makeMethod('getFollowers');
        this.search = this.makeMethod('search');
        this.getSubscriptions = this.makeMethod('getSubscriptions');
        this.getWallTabsWithPrefetch = this.makeMethod('getWallTabs', true);
    }
    get namespace() {
        return 'users';
    }
};
UsersApi = __decorate([
    scope.global()
], UsersApi);
export { UsersApi };
//# sourceMappingURL=UsersApi.js.map