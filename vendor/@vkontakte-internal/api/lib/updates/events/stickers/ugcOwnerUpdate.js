import { StickersQueueEvent, StickersQueueEventType } from './base';
export class StickersUGCOwnerUpdate extends StickersQueueEvent {
    constructor(detail) {
        super(StickersQueueEventType.UGC_OWNER_UPDATE, detail);
    }
}
//# sourceMappingURL=ugcOwnerUpdate.js.map