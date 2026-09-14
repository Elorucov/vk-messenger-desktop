import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { AccountApi } from '@vkontakte-internal/plugins';
let AccountService = class AccountService {
};
AccountService = __decorate([
    scope.container({ abstract: true })
], AccountService);
export { AccountService };
export const createAccountServiceImplementation = (callsCredentials) => {
    let AccountServiceImpl = class AccountServiceImpl {
        constructor(accountApi) {
            this.accountApi = accountApi;
        }
        get me() {
            return callsCredentials.me;
        }
        getUserId() {
            return this.me.id;
        }
        isAnonym() {
            return Boolean(callsCredentials.is_anonym);
        }
        getToken() {
            return callsCredentials.token ?? '';
        }
        getAnimatedAvatar() {
            return this.me.animated_avatar;
        }
        getCallsApiKey() {
            return callsCredentials.key;
        }
        isDevEnv() {
            return callsCredentials.is_dev;
        }
        getContactList({ options, params = {} } = {}) {
            return this.accountApi.getContactList(params, options);
        }
    };
    AccountServiceImpl = __decorate([
        scope.container(),
        __metadata("design:paramtypes", [AccountApi])
    ], AccountServiceImpl);
    return AccountServiceImpl;
};
//# sourceMappingURL=AccountService.js.map