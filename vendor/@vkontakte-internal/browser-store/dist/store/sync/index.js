import { Store } from '../store';
import { SyncAtom } from './atom';
export class SyncStore extends Store {
    constructor(options) {
        super(options);
    }
    createAtom(key, type) {
        return new SyncAtom({
            key,
            type,
            base: this,
        });
    }
}
export function createSyncStore(options) {
    return new SyncStore(options);
}
//# sourceMappingURL=index.js.map