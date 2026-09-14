import { StickersQueueEventType } from './base';
import { StickersUGCPackUpdate } from './ugcPackUpdate';
import { StickersUGCUserUpdate } from './ugcUserUpdate';
import { StickersUGCOwnerUpdate } from './ugcOwnerUpdate';
import { StickersUGCStickerUpdate } from './ugcStickerUpdate';
import { StickersCacheUpdate } from './cacheUpdate';
export function handlerStickersQueueEvent(updates, { data }) {
    const { type } = data;
    switch (type) {
        case StickersQueueEventType.UGC_PACK_UPDATE:
            updates.dispatchEvent(new StickersUGCPackUpdate(data));
            break;
        case StickersQueueEventType.UGC_USER_UPDATE:
            updates.dispatchEvent(new StickersUGCUserUpdate(data));
            break;
        case StickersQueueEventType.UGC_OWNER_UPDATE:
            updates.dispatchEvent(new StickersUGCOwnerUpdate(data));
            break;
        case StickersQueueEventType.UGC_STICKER_UPDATE:
            updates.dispatchEvent(new StickersUGCStickerUpdate(data));
            break;
        case StickersQueueEventType.CACHE_UPDATE:
            updates.dispatchEvent(new StickersCacheUpdate(data));
            break;
    }
}
//# sourceMappingURL=index.js.map