import { Updates, UpdatesSource } from '../updates';
export class UpdatesManager {
    constructor(api, options) {
        this.api = api;
        const keys = [
            UpdatesSource.STICKERS,
            UpdatesSource.VMOJI,
            UpdatesSource.GROUP,
            UpdatesSource.USER,
        ];
        this.queues = this.createObjectWithQueueKeys(keys, (key) => {
            return new Updates(api, {
                ...options,
                source: key,
            });
        });
        this.listenersCount = this.createObjectWithQueueKeys(keys, (key) => 0);
        this.activeQueues = new Set();
    }
    createObjectWithQueueKeys(keys, callback) {
        const result = {};
        keys.forEach((key) => {
            result[key] = callback(key);
        });
        return result;
    }
    startListenToQueue(source) {
        this.activeQueues.add(source);
        this.queues[source].start();
    }
    stopListenToQueue(source) {
        this.activeQueues.delete(source);
        this.listenersCount[source] = 0;
        this.queues[source].stop();
    }
    started(source) {
        return this.activeQueues.has(source);
    }
    start(source) {
        this.listenersCount[source] += 1;
        if (this.started(source)) {
            return;
        }
        this.startListenToQueue(source);
    }
    stop(source) {
        if (this.listenersCount[source] < 2) {
            this.stopListenToQueue(source);
            return;
        }
        this.listenersCount[source] -= 1;
    }
}
export class StaticUpdatesManager {
    static { this.updates = undefined; }
    static setup(api, options) {
        if (!StaticUpdatesManager.updates) {
            StaticUpdatesManager.updates = new UpdatesManager(api, options);
        }
        return StaticUpdatesManager.updates;
    }
}
//# sourceMappingURL=index.js.map