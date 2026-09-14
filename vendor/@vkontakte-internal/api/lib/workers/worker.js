import { MINIMUM_TIME_INTERVAL_API } from '../constants';
export class APIWorker {
    constructor(api) {
        this.busy = false;
        this.paused = false;
        this.queue = [];
        this.api = api;
        this.intervalPerRequests = Math.ceil(MINIMUM_TIME_INTERVAL_API / this.api.options.limit);
    }
    enqueue(request) {
        this.queue.push(request);
        this.immediateHeat();
    }
    requeue(request) {
        this.queue.unshift(request);
        this.immediateHeat();
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
        this.immediateHeat();
    }
    heat() {
        if (this.paused || this.busy || !this.queue.length) {
            return;
        }
        this.busy = true;
        const { requestMode } = this.api.options;
        this[requestMode]();
    }
    sequential() {
        this.execute();
        setTimeout(() => {
            this.busy = false;
            this.immediateHeat();
        }, this.intervalPerRequests);
    }
    burst() {
        const limit = Math.min(this.api.options.limit, this.queue.length);
        for (let i = 0; i < limit && this.queue.length !== 0; i += 1) {
            this.execute();
        }
        const interval = Math.ceil(MINIMUM_TIME_INTERVAL_API - limit * this.intervalPerRequests);
        setTimeout(() => {
            this.busy = false;
            this.immediateHeat();
        }, interval <= 0 ? MINIMUM_TIME_INTERVAL_API : interval);
    }
    immediateHeat() {
        setTimeout(() => this.heat());
    }
}
//# sourceMappingURL=worker.js.map