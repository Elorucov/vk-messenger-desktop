import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { MessagesApi } from '@vkontakte-internal/plugins';
import { handlePromiseError } from '../helpers/logger';
import { ProfileService } from './ProfileService';
export var ScheduledCallsType;
(function (ScheduledCallsType) {
    ScheduledCallsType["Preview"] = "preview";
    ScheduledCallsType["Full"] = "full";
})(ScheduledCallsType || (ScheduledCallsType = {}));
let ScheduledCallsService = class ScheduledCallsService {
    constructor(messagesApi, profileService) {
        this.messagesApi = messagesApi;
        this.profileService = profileService;
        this._calls = [];
        this._loading = false;
        this._groups = {};
        makeAutoObservable(this, {
            _calls: observable.shallow,
            _groups: observable.shallow,
        });
    }
    get loading() {
        return this._loading;
    }
    get currentCallerId() {
        return this._currentCallerId;
    }
    get groups() {
        return Object.values(this._groups);
    }
    get calls() {
        return this._calls;
    }
    setLoading(value) {
        this._loading = value;
    }
    setCurrentCallerId(value) {
        this._currentCallerId = value;
    }
    getTimeRange(type) {
        const now = Math.round(Date.now() / 1000);
        const startTime = now;
        const finishTime = type === ScheduledCallsType.Preview
            ? now + 60 * 60 * 24 * 7 // 7 дней
            : now + 60 * 60 * 24 * 365; // год
        return { startTime, finishTime };
    }
    getCallsForRange(type) {
        if (type === ScheduledCallsType.Full) {
            return this._calls;
        }
        const { startTime, finishTime } = this.getTimeRange(type);
        return this._calls.filter((call) => call.schedule.time >= startTime && call.schedule.time <= finishTime);
    }
    async fetchCalls({ callerId, lastTime }) {
        try {
            if (this.currentCallerId !== callerId) {
                this._calls = [];
                this._groups = {};
            }
            this.setLoading(true);
            this.setCurrentCallerId(callerId);
            const response = await this.messagesApi.getScheduledCalls({
                grouped: 1,
                count: 50,
                ...(callerId ? { caller_id: callerId } : {}),
                ...(lastTime ? { start_from: lastTime } : {}),
            });
            this.profileService.loadProfilesFromResponse(response);
            runInAction(() => {
                const items = response.items ?? [];
                this._calls = lastTime ? this._calls.concat(items) : items;
                this._lastTime = response.next_from;
                for (const group of response?.groups ?? []) {
                    this._groups[group.id] = group;
                }
            });
        }
        catch (error) {
            handlePromiseError(error);
        }
        finally {
            this.setLoading(false);
        }
    }
    get hasMore() {
        // Волшебное число, так как API может вернуть бесконечное количество звонков
        return this._lastTime !== undefined && this._calls.length <= 300;
    }
    async loadCalls(callerId) {
        return this.fetchCalls({
            callerId,
        });
    }
    async loadMore() {
        if (this.currentCallerId === undefined || this._lastTime === undefined) {
            return;
        }
        return this.fetchCalls({
            callerId: this.currentCallerId,
            lastTime: this._lastTime,
        });
    }
    async refresh() {
        if (this.currentCallerId === undefined) {
            // Если ранее не было загрузок, нечего обновлять
            return;
        }
        // Обновляем данные с текущими параметрами
        await this.fetchCalls({
            callerId: this.currentCallerId,
        });
    }
};
ScheduledCallsService = __decorate([
    scope.global(),
    __metadata("design:paramtypes", [MessagesApi,
        ProfileService])
], ScheduledCallsService);
export { ScheduledCallsService };
//# sourceMappingURL=ScheduledCallsService.js.map