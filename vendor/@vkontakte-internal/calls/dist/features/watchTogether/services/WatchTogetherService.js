import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
let WatchTogetherService = class WatchTogetherService {
    constructor() {
        this._owner = null;
        this._movieInfo = null;
        this._movieState = null;
        this._stream = null;
        this.setOwner = (data) => {
            this._owner = data;
        };
        this.setMovieInfo = (data) => {
            this._movieInfo = data;
        };
        this.setMovieState = (data) => {
            this._movieState = data;
        };
        this.setStream = (data) => {
            this._stream = data;
        };
        this.clear = () => {
            this._owner = null;
            this._movieInfo = null;
            this._movieState = null;
            this._stream = null;
        };
        makeAutoObservable(this);
    }
    get owner() {
        return this._owner;
    }
    get movieInfo() {
        return this._movieInfo;
    }
    get movieState() {
        return this._movieState;
    }
    get stream() {
        return this._stream;
    }
};
WatchTogetherService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [])
], WatchTogetherService);
export { WatchTogetherService };
//# sourceMappingURL=WatchTogetherService.js.map