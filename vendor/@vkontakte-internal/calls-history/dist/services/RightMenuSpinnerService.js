import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
let RightMenuSpinnerService = class RightMenuSpinnerService {
    constructor() {
        this._loading = false;
        makeAutoObservable(this);
    }
    get loading() {
        return this._loading;
    }
    setLoading(value) {
        this._loading = value;
    }
    hide() {
        this.setLoading(false);
    }
    show() {
        this.setLoading(true);
    }
};
RightMenuSpinnerService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], RightMenuSpinnerService);
export { RightMenuSpinnerService };
//# sourceMappingURL=RightMenuSpinnerService.js.map