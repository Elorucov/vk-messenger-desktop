export var IUploader;
(function (IUploader) {
    class AbortError extends Error {
        constructor(message = 'Aborted') {
            super(message);
            Object.setPrototypeOf(this, AbortError.prototype);
        }
    }
    IUploader.AbortError = AbortError;
    class TimeoutError extends Error {
        constructor(message = 'Timeout') {
            super(message);
            Object.setPrototypeOf(this, TimeoutError.prototype);
        }
    }
    IUploader.TimeoutError = TimeoutError;
})(IUploader || (IUploader = {}));
//# sourceMappingURL=IUploader.js.map