import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { isMessagesContact, normalizeContact, normalizeUser, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { AuthService, UsersApi } from '@vkontakte-internal/plugins';
import { userFields } from '../constants';
let ProfileService = class ProfileService {
    constructor(authService, userApi) {
        this.authService = authService;
        this.userApi = userApi;
        this._profiles = {};
        makeAutoObservable(this, {
            _profiles: observable.shallow,
        });
    }
    get localProfile() {
        const userId = this.authService.userId;
        if (!userId) {
            return null;
        }
        return this.getProfile(vkIdToPeerId(userId));
    }
    async loadLocalProfile() {
        const userId = this.authService.userId;
        if (!userId) {
            return;
        }
        const profiles = await this.userApi.get({
            user_ids: userId.toString(),
            fields: userFields,
        });
        if (profiles.length === 0) {
            return;
        }
        const mappedProfiles = mapProfiles(profiles);
        runInAction(() => {
            this._profiles = {
                ...this._profiles,
                ...mappedProfiles,
            };
        });
    }
    loadProfilesFromResponse(response) {
        const allProfiles = [
            ...(response.profiles ?? []),
            ...('anonyms' in response ? response.anonyms ?? [] : []),
            ...('contacts' in response ? response.contacts ?? [] : []),
            ...(response.groups ?? []),
        ];
        const profiles = mapProfiles(allProfiles);
        this._profiles = {
            ...this._profiles,
            ...profiles,
        };
    }
    get profiles() {
        return this._profiles;
    }
    getProfile(id) {
        return this._profiles[id];
    }
};
ProfileService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [AuthService,
        UsersApi])
], ProfileService);
export { ProfileService };
export function mapProfiles(updateProfiles) {
    return updateProfiles.reduce((map, profile) => {
        const key = isMessagesContact(profile) ? profile.calls_id : vkIdToPeerId(profile.id);
        if (key && !(key in map)) {
            let member = isMessagesContact(profile) ? normalizeContact(profile) : normalizeUser(profile);
            if ('type' in profile &&
                (profile.type === 'group' || profile.type === 'page' || profile.type === 'event')) {
                map['-' + key] = member;
            }
            else {
                map[key] = member;
            }
        }
        return map;
    }, {});
}
//# sourceMappingURL=ProfileService.js.map