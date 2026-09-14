import { __decorate, __metadata } from "tslib";
import { makeAutoObservable, observable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { v4 as uuidv4 } from 'uuid';
let SnackbarService = class SnackbarService {
    constructor() {
        this._snackbars = [];
        makeAutoObservable(this, {
            _snackbars: observable.shallow,
        });
    }
    get snackbars() {
        return this._snackbars;
    }
    show(config) {
        this._snackbars.push({ ...config, id: uuidv4() });
    }
    hide(id) {
        this._snackbars = this._snackbars.filter((snackbar) => snackbar.id !== id);
    }
};
SnackbarService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], SnackbarService);
export { SnackbarService };
//# sourceMappingURL=SnackbarService.js.map