import { __decorate, __metadata } from "tslib";
import { makeObservable, observable, runInAction } from 'mobx';
import { Emitter } from '@vkontakte-internal/utils';
import { MediaSessionObject } from './MediaSessionController';
import { CONFIGS } from './config';
export class MediaFocusChannel {
    constructor(id, actions) {
        this.emitter = new Emitter();
        this.currentAction = null;
        this.mediaSession = new MediaSessionObject();
        this.active = false;
        this.paused = false;
        this.activatedAt = 0;
        this.start = this.createAction('start', () => {
            if (this.active) {
                return;
            }
            this.active = true;
            this.activatedAt = +new Date();
            this.paused = false;
        });
        this.stop = this.createAction('stop', () => {
            if (!this.active) {
                return;
            }
            this.active = false;
            this.paused = false;
        });
        this.pause = this.createAction('pause', () => {
            if (this.paused) {
                return;
            }
            const { isAlreadyPaused } = this.actions.pause();
            if (isAlreadyPaused) {
                return;
            }
            this.paused = true;
        });
        this.resume = this.createAction('resume', () => {
            if (!this.paused) {
                return;
            }
            this.actions.resume();
            this.paused = false;
        });
        this.id = id;
        this.config = CONFIGS[id];
        this.actions = actions;
        makeObservable(this);
    }
    get events() {
        return this.emitter.listenable;
    }
    createAction(name, method) {
        const action = (...args) => {
            if (this.currentAction) {
                throw new Error(`Unexpected action ${name} call while another action ${this.currentAction} is in progress`);
            }
            try {
                this.currentAction = name;
                const result = runInAction(() => method(...args));
                this.emitter.emit(name);
                return result;
            }
            finally {
                this.currentAction = null;
            }
        };
        return action;
    }
}
__decorate([
    observable,
    __metadata("design:type", Object)
], MediaFocusChannel.prototype, "active", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], MediaFocusChannel.prototype, "paused", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], MediaFocusChannel.prototype, "activatedAt", void 0);
//# sourceMappingURL=MediaFocusChannel.js.map