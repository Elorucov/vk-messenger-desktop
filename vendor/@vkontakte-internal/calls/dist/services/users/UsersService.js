import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { UsersApi } from '@vkontakte-internal/plugins';
export const userFields = [
    'photo_100',
    'photo_200',
    'sex',
    'screen_name',
    'first_name_gen',
    'is_nft',
    'animated_avatar',
    'custom_names_for_calls',
].join(',');
let UsersService = class UsersService {
    constructor(usersApi) {
        this.usersApi = usersApi;
    }
    search({ options, params: { fields = userFields.concat(',can_call_from_group'), q = '', ...params } = {}, } = {}) {
        return this.usersApi.search({
            ...params,
            fields,
            q,
        }, options);
    }
};
UsersService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [UsersApi])
], UsersService);
export { UsersService };
//# sourceMappingURL=UsersService.js.map