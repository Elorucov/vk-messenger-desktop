import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { HistoryFetchService } from './HistoryFetchService';
import { ProfileService } from './ProfileService';
const HISTORY_CALL_PAGE_COUNT = 25;
let CallHistoryService = class CallHistoryService {
    constructor(historyFetchService, profileService) {
        this.historyFetchService = historyFetchService;
        this.profileService = profileService;
        this.history = [];
        this._loading = false;
        this.hasMore = false;
        this.nextFrom = 0;
        this.ownerId = 0;
        this.filter = 'all';
        makeAutoObservable(this, {
            _history: observable.shallow,
        });
    }
    get loading() {
        return this._loading;
    }
    setLoading(value) {
        this._loading = value;
    }
    async fetchHistory({ groupId = 0, filter = 'all', offset = 0, count = HISTORY_CALL_PAGE_COUNT, shadowUpdate = false, }) {
        if (!shadowUpdate) {
            this.setLoading(true);
        }
        try {
            const response = await this.historyFetchService.fetchHistory({
                groupId,
                filter,
                offset,
                count,
            });
            runInAction(() => {
                if (offset === 0) {
                    this.history = response.items ?? [];
                }
                else {
                    this.history = [...this.history, ...(response.items ?? [])];
                }
                this.hasMore = response.has_more ?? false;
                this.nextFrom = response.next_from ?? 0;
            });
            this.profileService.loadProfilesFromResponse(response);
        }
        finally {
            if (!shadowUpdate) {
                this.setLoading(false);
            }
        }
    }
    async loadHistory(groupId, filter) {
        this.ownerId = groupId;
        this.filter = filter;
        await this.fetchHistory({
            offset: 0,
            groupId: this.ownerId,
            filter: this.filter,
        });
    }
    async refresh() {
        await this.fetchHistory({
            offset: 0,
            groupId: this.ownerId,
            filter: this.filter,
            shadowUpdate: true,
        });
    }
    async loadMoreHistory() {
        await this.fetchHistory({
            offset: this.nextFrom,
            groupId: this.ownerId,
            filter: this.filter,
        });
    }
    get items() {
        return this.history;
    }
    get canLoadMore() {
        return this.hasMore;
    }
    get currentOwnerId() {
        return this.ownerId;
    }
    removeItemByIndex(index) {
        this.history.splice(index, 1);
    }
};
CallHistoryService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [HistoryFetchService,
        ProfileService])
], CallHistoryService);
export { CallHistoryService };
//# sourceMappingURL=CallHistoryService.js.map