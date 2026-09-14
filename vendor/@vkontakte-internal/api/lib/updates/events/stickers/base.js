export var StickersQueueEventType;
(function (StickersQueueEventType) {
    StickersQueueEventType["UGC_USER_UPDATE"] = "ugc_user_update";
    StickersQueueEventType["UGC_PACK_UPDATE"] = "ugc_pack_update";
    StickersQueueEventType["UGC_OWNER_UPDATE"] = "ugc_owner_update";
    StickersQueueEventType["UGC_STICKER_UPDATE"] = "ugc_sticker_update";
    StickersQueueEventType["CACHE_UPDATE"] = "cache_update";
})(StickersQueueEventType || (StickersQueueEventType = {}));
export class StickersQueueEvent extends CustomEvent {
    constructor(eventName, detail) {
        super(eventName, {
            detail,
        });
    }
}
//# sourceMappingURL=base.js.map