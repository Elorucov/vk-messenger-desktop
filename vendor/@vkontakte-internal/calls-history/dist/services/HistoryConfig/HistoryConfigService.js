import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
let HistoryConfigService = class HistoryConfigService {
};
HistoryConfigService = __decorate([
    scope.container()
], HistoryConfigService);
export { HistoryConfigService };
export const createHistoryConfigServiceImplementation = (config, extensions = {}) => {
    let HistoryConfigServiceImpl = class HistoryConfigServiceImpl {
        constructor() {
            this._showCreateCall = true;
            makeAutoObservable(this);
        }
        get config() {
            return config;
        }
        get isVkMe() {
            return extensions?.isVkMe ?? false;
        }
        get showCreateCall() {
            return this._showCreateCall;
        }
        setShowCreateCall(value) {
            this._showCreateCall = value;
        }
    };
    HistoryConfigServiceImpl = __decorate([
        scope.container(),
        __metadata("design:paramtypes", [])
    ], HistoryConfigServiceImpl);
    return HistoryConfigServiceImpl;
};
//# sourceMappingURL=HistoryConfigService.js.map