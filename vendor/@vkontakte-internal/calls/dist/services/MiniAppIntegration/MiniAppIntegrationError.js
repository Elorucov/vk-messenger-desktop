export var MiniAppIntegrationErrorCode;
(function (MiniAppIntegrationErrorCode) {
    MiniAppIntegrationErrorCode[MiniAppIntegrationErrorCode["NO_URL"] = 0] = "NO_URL";
    MiniAppIntegrationErrorCode[MiniAppIntegrationErrorCode["UNKNOWN"] = 1] = "UNKNOWN";
})(MiniAppIntegrationErrorCode || (MiniAppIntegrationErrorCode = {}));
export class MiniAppIntegrationError extends Error {
    constructor({ code, message, title }) {
        super(message);
        this.code = code;
        this.title = title;
    }
}
export const isMiniAppIntegrationError = (err) => {
    return err?.message && typeof err?.code === 'number';
};
//# sourceMappingURL=MiniAppIntegrationError.js.map