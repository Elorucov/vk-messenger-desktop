import { StickersQueueEvent, StickersQueueEventType } from './base';
export class StickersUGCUserUpdate extends StickersQueueEvent {
    constructor(detail) {
        super(StickersQueueEventType.UGC_USER_UPDATE, detail);
    }
}
//# sourceMappingURL=ugcUserUpdate.js.map