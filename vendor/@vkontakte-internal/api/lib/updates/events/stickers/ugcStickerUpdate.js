import { StickersQueueEvent, StickersQueueEventType } from './base';
export class StickersUGCStickerUpdate extends StickersQueueEvent {
    constructor(detail) {
        super(StickersQueueEventType.UGC_STICKER_UPDATE, detail);
    }
}
//# sourceMappingURL=ugcStickerUpdate.js.map