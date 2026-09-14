export var VmojiQueueEventType;
(function (VmojiQueueEventType) {
    VmojiQueueEventType["AVATAR"] = "avatar";
    VmojiQueueEventType["STICKERS"] = "stickers";
    VmojiQueueEventType["CHARACTER"] = "character";
    VmojiQueueEventType["STICKERS_PRINT_REQUEST"] = "stickers_print_request";
})(VmojiQueueEventType || (VmojiQueueEventType = {}));
export class VmojiQueueEvent extends CustomEvent {
    constructor(eventName, detail) {
        super(eventName, {
            detail,
        });
    }
}
//# sourceMappingURL=base.js.map