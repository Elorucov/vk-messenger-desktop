import { API as APIInternal, StickersQueueEventType, } from '@vkontakte-internal/api';
import { Cache } from '../cache';
import { stickersUGCOwnerUpdateHandler } from './updates/stickers/ugcOwnerUpdate';
import { stickersUGCStickerUpdateHandler } from './updates/stickers/ugcStickerUpdate';
import { isStaticUpdatesManagerEnabled } from '../userEnv';
export class API extends APIInternal {
    constructor({ onAPIRequest, language, context, logError, ...cacheOptions }) {
        super({
            requestMethod: onAPIRequest,
            language,
            logError,
        }, !isStaticUpdatesManagerEnabled()
            ? {
                userId: cacheOptions?.userId,
                source: 'stickers',
            }
            : undefined);
        this.cache = new Cache({
            api: this,
            context,
            ...cacheOptions,
        });
        if (isStaticUpdatesManagerEnabled()) {
            return;
        }
        this.updates.addEventListener(StickersQueueEventType.UGC_OWNER_UPDATE, stickersUGCOwnerUpdateHandler.bind(this));
        this.updates.addEventListener(StickersQueueEventType.UGC_STICKER_UPDATE, stickersUGCStickerUpdateHandler.bind(this));
    }
}
//# sourceMappingURL=index.js.map