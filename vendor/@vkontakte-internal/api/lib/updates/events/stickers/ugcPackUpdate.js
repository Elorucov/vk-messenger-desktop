import { StickersQueueEvent, StickersQueueEventType } from './base';
export class StickersUGCPackUpdate extends StickersQueueEvent {
    constructor(detail) {
        super(StickersQueueEventType.UGC_USER_UPDATE, detail);
    }
}
//# sourceMappingURL=ugcPackUpdate.js.map