import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { CallsEventType } from '@vkontakte-internal/calls-core';
import { eventBus } from './eventBus';
export function createDeviceChangeHandler(sdkCallbackHandler) {
    return () => {
        debugMessage(DebugMessageType.WARN, 'onDeviceChange');
        if (eventBus.has(CallsEventType.DEVICE_CHANGED)) {
            eventBus.emit(CallsEventType.DEVICE_CHANGED);
        }
        sdkCallbackHandler?.('onDeviceChange', []);
    };
}
//# sourceMappingURL=device.js.map