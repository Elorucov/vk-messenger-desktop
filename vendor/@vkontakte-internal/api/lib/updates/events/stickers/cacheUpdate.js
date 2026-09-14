import { StickersQueueEvent, StickersQueueEventType } from './base';
export class StickersCacheUpdate extends StickersQueueEvent {
    constructor(detail) {
        super(StickersQueueEventType.CACHE_UPDATE, detail);
    }
}
//# sourceMappingURL=cacheUpdate.js.map