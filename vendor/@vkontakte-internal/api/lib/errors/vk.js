export var SharedErrorCode;
(function (SharedErrorCode) {
    SharedErrorCode["UNSUPPORTED_MODE"] = "UNSUPPORTED_MODE";
    SharedErrorCode["MISSING_CAPTCHA_HANDLER"] = "MISSING_CAPTCHA_HANDLER";
    SharedErrorCode["MISSING_TOKEN_REGENERATE_HANDLER"] = "MISSING_TOKEN_REGENERATE_HANDLER";
})(SharedErrorCode || (SharedErrorCode = {}));
export class VKError extends Error {
    constructor({ code, message }) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;
    }
}
//# sourceMappingURL=vk.js.map