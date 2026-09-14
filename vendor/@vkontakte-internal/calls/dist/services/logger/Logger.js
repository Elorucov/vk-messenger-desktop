import { DebugMessageType } from '@vkontakte/calls-sdk';
class Logger {
    constructor(tag, sdk) {
        this.tag = tag;
        this.sdk = sdk;
        this.error = this.createMethod(DebugMessageType.ERROR);
        this.warn = this.createMethod(DebugMessageType.WARN);
        this.debug = this.createMethod(DebugMessageType.DEBUG);
    }
    createMethod(type) {
        return (...args) => {
            this.sdk.debugMessage(type, this.tag, ...args);
        };
    }
}
export const createLogger = (tag, sdk) => new Logger(tag, sdk);
//# sourceMappingURL=Logger.js.map