import { createStore, clear } from 'idb-keyval';
import { Store } from '../store';
import { AsyncAtom } from './atom';
export class AsyncStore extends Store {
    constructor(options) {
        super(options);
        const { dbName, version } = options;
        try {
            this.store = createStore(`${dbName}-v${version}`, dbName);
        }
        catch { }
    }
    createAtom(key) {
        return new AsyncAtom({
            key,
            base: this,
        });
    }
    /**
     * Отчищает хранилище
     */
    async clear() {
        await clear(this.store);
        this.notify();
    }
}
export function createAsyncStore(options) {
    return new AsyncStore(options);
}
//# sourceMappingURL=index.js.map