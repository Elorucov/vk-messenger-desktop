import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { Langs, MessagesApi } from '@vkontakte-internal/plugins';
import { handlePromiseError } from '../helpers/logger';
import { PRIVATE_CALL_OWNER } from '../constants';
let CallOwnersService = class CallOwnersService {
    constructor(langs, messagesApi) {
        this.langs = langs;
        this.messagesApi = messagesApi;
        this._groups = [];
        this._loading = false;
        makeAutoObservable(this, {
            _groups: observable.shallow,
        });
    }
    get defaultOwner() {
        return {
            id: PRIVATE_CALL_OWNER,
            name: this.langs.getLang('calls_history_list_personal_option'),
        };
    }
    get groups() {
        return this._groups;
    }
    get loading() {
        return this._loading;
    }
    get ownerOptions() {
        return [this.defaultOwner, ...this.groups];
    }
    setGroups(groups) {
        this._groups = groups;
    }
    setLoading(value) {
        this._loading = value;
    }
    async fetchGroups() {
        try {
            this.setLoading(true);
            const response = await this.messagesApi.getGroupsForCall({ count: 200 });
            runInAction(() => {
                if (response.count === 0) {
                    return;
                }
                const groups = response.items.map((item) => ({
                    id: -item.id,
                    name: item.name ?? '',
                }));
                this.setGroups(groups);
            });
        }
        catch (error) {
            handlePromiseError(error);
        }
        finally {
            this.setLoading(false);
        }
    }
};
CallOwnersService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [Langs,
        MessagesApi])
], CallOwnersService);
export { CallOwnersService };
//# sourceMappingURL=CallOwnersService.js.map