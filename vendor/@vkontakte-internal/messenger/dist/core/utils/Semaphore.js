export class Semaphore {
    capacity;
    window;
    resources;
    queue = [];
    constructor(capacity, window) {
        this.capacity = capacity;
        this.window = window;
        this.resources = capacity;
    }
    async lock() {
        if (this.resources > 0) {
            this.resources--;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.queue.push(resolve);
        });
    }
    release() {
        setTimeout(() => {
            const nextJob = this.queue.shift();
            if (nextJob) {
                return nextJob();
            }
            this.resources++;
        }, this.window);
    }
}
//# sourceMappingURL=Semaphore.js.map