import { debugMessage, DebugMessageType, MediaType } from '@vkontakte/calls-sdk';
export const pipLog = (...args) => {
    debugMessage(DebugMessageType.DEBUG, '[📹 PiP]', ...args);
};
export const getTypeSizeOfStream = (type) => {
    if ([MediaType.SCREEN, MediaType.MOVIE, MediaType.STREAM].includes(type)) {
        return 'wide';
    }
    else {
        return 'general';
    }
};
//# sourceMappingURL=utils.js.map