import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { normalizeUser } from '@vkontakte-internal/calls-core';
import { FriendsApi } from '@vkontakte-internal/plugins';
import { handlePromiseError } from '../helpers/logger';
import { userFields } from '../constants';
const PER_PAGE = 100;
const FRIENDS_FIELDS = [userFields, 'can_call', 'online_info'].join(',');
const FRIENDS_FILTERS = 'without_banned,without_deleted,without_dead';
let FriendsService = class FriendsService {
    constructor(friendsApi) {
        this.friendsApi = friendsApi;
        this._friends = [];
        this.totalCount = 0;
        this.nextFrom = 0;
        this.hasMore = false;
        this.isLoading = false;
        makeAutoObservable(this, {
            _friends: observable.shallow,
        });
    }
    get friends() {
        return this._friends;
    }
    async loadInitialFriends() {
        if (this.isLoading)
            return false;
        runInAction(() => {
            this.isLoading = true;
        });
        try {
            const { count, items } = await this.friendsApi.get({
                count: PER_PAGE,
                offset: 0,
                order: 'hints',
                fields: FRIENDS_FIELDS,
                filters: FRIENDS_FILTERS,
            });
            runInAction(() => {
                this._friends = items.map(normalizeUser);
                this.totalCount = count;
                this.nextFrom = PER_PAGE;
                this.hasMore = PER_PAGE < count;
            });
            return true;
        }
        catch (error) {
            handlePromiseError(error);
            return false;
        }
        finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }
    async loadMoreFriends() {
        if (this.isLoading || !this.hasMore)
            return false;
        runInAction(() => {
            this.isLoading = true;
        });
        try {
            const { items } = await this.friendsApi.get({
                count: PER_PAGE,
                offset: this.nextFrom,
                order: 'hints',
                fields: FRIENDS_FIELDS,
                filters: FRIENDS_FILTERS,
            });
            const newFriends = items.map(normalizeUser);
            runInAction(() => {
                this._friends = [...this._friends, ...newFriends];
                const nextOffset = this.nextFrom + PER_PAGE;
                this.hasMore = nextOffset < this.totalCount;
                this.nextFrom = nextOffset;
            });
            return true;
        }
        catch (error) {
            handlePromiseError(error);
            return false;
        }
        finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }
    reset() {
        runInAction(() => {
            this._friends = [];
            this.totalCount = 0;
            this.nextFrom = 0;
            this.hasMore = false;
            this.isLoading = false;
        });
    }
};
FriendsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [FriendsApi])
], FriendsService);
export { FriendsService };
//# sourceMappingURL=FriendsService.js.map