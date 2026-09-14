import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { MessagesApi } from '@vkontakte-internal/plugins';
import { userFields } from '../constants';
import { ProfileService } from './ProfileService';
import { handlePromiseError } from '../helpers/logger';
let CurrentCallsService = class CurrentCallsService {
    constructor(messagesApi, profileService) {
        this.messagesApi = messagesApi;
        this.profileService = profileService;
        this._items = [];
        this._loading = false;
        makeAutoObservable(this, {
            _items: observable.ref,
        });
    }
    get loading() {
        return this._loading;
    }
    setLoading(value) {
        this._loading = value;
    }
    async loadCurrentCalls() {
        this.setLoading(true);
        try {
            const currentCalls = await this.messagesApi.getCurrentCalls({
                fields: userFields,
            });
            runInAction(() => {
                this._items = currentCalls?.items ?? [];
            });
            this.profileService.loadProfilesFromResponse(currentCalls);
            this.setLoading(false);
        }
        catch (error) {
            handlePromiseError(error);
            this.setLoading(false);
        }
    }
    removeCurrentCallByCallId(callId) {
        this._items = this._items.filter((call) => call.call_id !== callId);
    }
    get currentCalls() {
        return this._items;
    }
};
CurrentCallsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [MessagesApi,
        ProfileService])
], CurrentCallsService);
export { CurrentCallsService };
//# sourceMappingURL=CurrentCallsService.js.map