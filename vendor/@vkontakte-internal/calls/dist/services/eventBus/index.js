import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { EventBus } from './EventBus';
export const eventBus = new EventBus();
export const bridgeEventBus = {
    on: (type, listener, params) => {
        eventBus.on(type, listener, params);
        return () => eventBus.off(type, listener);
    },
    emit: eventBus.emit.bind(eventBus),
};
let EventBusProvider = class EventBusProvider {
    getEventBus() {
        return bridgeEventBus;
    }
};
EventBusProvider = __decorate([
    scope.container()
], EventBusProvider);
export { EventBusProvider };
//# sourceMappingURL=index.js.map