export class EventEmitter {
    subscriptions = {};
    subscribe(eventType, handler) {
        if (Array.isArray(this.subscriptions[eventType])) {
            this.subscriptions[eventType]?.push(handler);
        }
        else {
            this.subscriptions[eventType] = [handler];
        }
    }
    unsubscribe(eventType, handler) {
        if (Array.isArray(this.subscriptions[eventType])) {
            this.subscriptions[eventType] =
                this.subscriptions[eventType]?.filter((fn) => fn !== handler) || [];
        }
    }
    emit(eventType, payload) {
        if (Array.isArray(this.subscriptions[eventType])) {
            this.subscriptions[eventType]?.forEach((handler) => handler(payload));
        }
    }
}
//# sourceMappingURL=EventEmitter.js.map