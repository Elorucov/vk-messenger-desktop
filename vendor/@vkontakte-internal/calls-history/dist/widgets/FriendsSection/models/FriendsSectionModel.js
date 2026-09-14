import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, runInAction } from 'mobx';
import { scope, init, createProvider, Props } from '@vkontakte-internal/di';
import { CallStatSource, normalizeUser, } from '@vkontakte-internal/calls-core';
import { Langs, FriendsApi, AuthService } from '@vkontakte-internal/plugins';
import { handlePromiseError } from '../../../helpers/logger';
import { throttle } from '@vkontakte/vkjs';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
import { userFields } from '../../../constants';
import { FriendsService } from '../../../services/FriendsService';
const PER_PAGE = 100;
const SEARCH_PER_PAGE = 50;
const FRIENDS_FIELDS = [userFields, 'can_call', 'online_info'].join(',');
const FRIENDS_FILTERS = 'without_banned,without_deleted,without_dead';
function formatLastSeen(langs, time) {
    const diff = Math.floor((Date.now() - time) / 1000);
    let res;
    if (diff < 60) {
        res = langs.getLang('global_just_now');
    }
    else if (diff < 3600) {
        res = langs.numeric(Math.floor(diff / 60), langs.getLang('global_mins_ago', true));
    }
    else if (diff < 6 * 3600) {
        res = langs.numeric(Math.floor(diff / 3600), langs.getLang('global_hours_ago', true));
    }
    else {
        res = langs.compactDate(new Date(time));
    }
    return res;
}
let FriendsSectionModel = class FriendsSectionModel {
    get mode() {
        return this.searchQuery ? 'search' : 'initial';
    }
    get allFriends() {
        return this.friendsService.friends;
    }
    get friends() {
        return this.mode === 'initial' ? this.friendsService.friends : this.foundFriends;
    }
    get hasMoreFriends() {
        return this.mode === 'initial' ? this.friendsService.hasMore : this.hasSearchMore;
    }
    constructor(langs, authService, friendsApi, props, rightMenuSpinnerService, friendsService) {
        this.langs = langs;
        this.authService = authService;
        this.friendsApi = friendsApi;
        this.props = props;
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.friendsService = friendsService;
        this.foundFriends = [];
        this.hasSearchMore = false;
        this.searchNextFrom = 0;
        this.searchQuery = '';
        this.isSearching = false;
        this._loading = false;
        this.loadMoreFriends = async () => {
            if (this.searchQuery && this.needServerSearch) {
                return this.loadMoreSearch();
            }
            const newFriends = await this.friendsService.loadMoreFriends();
            if (!newFriends) {
                return false;
            }
            return true;
        };
        this.callFriend = (peerId, isWithVideo) => {
            this.props.current.bridge.call({
                vkId: peerId,
                isWithVideo,
                entryPoint: CallStatSource.HISTORY_FRIENDS_LIST,
            });
        };
        this.searchFriendsDebounced = throttle(async (searchQuery) => {
            runInAction(() => {
                this.isSearching = true;
            });
            try {
                const { count, items } = await this.friendsApi.search({
                    user_id: this.authService.userIdOrAnonim,
                    q: searchQuery,
                    count: SEARCH_PER_PAGE,
                    offset: 0,
                    fields: FRIENDS_FIELDS,
                    filters: FRIENDS_FILTERS,
                });
                runInAction(() => {
                    this.hasSearchMore = SEARCH_PER_PAGE < count;
                    this.searchNextFrom = SEARCH_PER_PAGE;
                    this.foundFriends = items.map(normalizeUser);
                });
            }
            catch (error) {
                handlePromiseError(error);
            }
            finally {
                runInAction(() => {
                    this.isSearching = false;
                });
            }
        }, 1e3);
        makeAutoObservable(this);
    }
    get needServerSearch() {
        return this.friendsService.totalCount > PER_PAGE;
    }
    get loading() {
        return this._loading;
    }
    setLoading(loading) {
        this._loading = loading;
    }
    async [init]() {
        if (this.friendsService.friends.length === 0) {
            this.setLoading(true);
        }
        await this.friendsService.loadInitialFriends();
        this.setLoading(false);
        this.rightMenuSpinnerService.hide();
    }
    setSearchQuery(query) {
        this.searchQuery = query;
        this.handleSearch();
    }
    handleSearch() {
        if (!this.needServerSearch) {
            return;
        }
        if (this.searchQuery.length >= 1 && !this.isSearching) {
            this.searchFriendsDebounced(this.searchQuery);
        }
    }
    getDescription(friend) {
        if (friend.onlineInfo?.is_online) {
            return 'Online';
        }
        if (friend.onlineInfo?.last_seen) {
            return this.props.current.isVkme
                ? this.langs.formatTime(friend.onlineInfo.last_seen * 1000)
                : formatLastSeen(this.langs, friend.onlineInfo.last_seen * 1000);
        }
        if (friend.onlineInfo?.status) {
            switch (friend.onlineInfo.status) {
                case 'recently':
                    return this.langs.sex(friend.sex ?? 0, this.langs.getLang('global_online_was_recently', true));
                case 'last_week':
                    return this.langs.sex(friend.sex ?? 0, this.langs.getLang('global_online_was_week', true));
                default:
                    return this.langs.sex(friend.sex ?? 0, this.langs.getLang('global_online_long_ago', true));
            }
        }
        return '';
    }
    async loadMoreSearch() {
        try {
            const { count, items } = await this.friendsApi.search({
                user_id: this.authService.userIdOrAnonim,
                q: this.searchQuery,
                count: SEARCH_PER_PAGE,
                offset: this.searchNextFrom,
                fields: FRIENDS_FIELDS,
                filters: FRIENDS_FILTERS,
            });
            runInAction(() => {
                const nextOffset = this.searchNextFrom + SEARCH_PER_PAGE;
                this.hasSearchMore = nextOffset < count;
                this.searchNextFrom = nextOffset;
                this.foundFriends = [...this.foundFriends, ...items.map(normalizeUser)];
            });
            return true;
        }
        catch (error) {
            handlePromiseError(error);
            return false;
        }
    }
};
FriendsSectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Langs,
        AuthService,
        FriendsApi,
        Props,
        RightMenuSpinnerService,
        FriendsService])
], FriendsSectionModel);
export { FriendsSectionModel };
export const { Provider: HistoryScreenSectionFriendsViewModelProvider, useModel: useHistoryScreenSectionFriendsViewModel, } = createProvider(FriendsSectionModel);
//# sourceMappingURL=FriendsSectionModel.js.map