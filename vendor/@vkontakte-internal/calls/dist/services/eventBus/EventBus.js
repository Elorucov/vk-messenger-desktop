import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
export class EventBus {
    constructor() {
        this._events = new Map();
    }
    on(type, listener, params) {
        if (!this._events.has(type)) {
            this._events.set(type, []);
        }
        this._events.get(type)?.push({ listener, ...params });
    }
    off(type, predicate) {
        const listeners = this._events.get(type);
        if (!listeners) {
            debugMessage(DebugMessageType.WARN, `'${type}' is not registered event`);
            return;
        }
        const nextListeners = listeners.filter(({ listener }) => listener !== predicate);
        if (!nextListeners.length) {
            this._events.delete(type);
        }
        else {
            this._events.set(type, nextListeners);
        }
    }
    allOff(type) {
        if (type) {
            this._events.delete(type);
        }
        else {
            this.reset();
        }
    }
    has(type) {
        return this._events.has(type);
    }
    emit(type, payload) {
        let clearListeners;
        this._events.get(type)?.forEach(({ listener, once }) => {
            listener(payload);
            if (once) {
                if (!clearListeners)
                    clearListeners = [listener];
                else
                    clearListeners.push(listener);
            }
        });
        clearListeners?.forEach((predicate) => this.off(type, predicate));
    }
    reset() {
        this._events = new Map();
    }
}
//# sourceMappingURL=EventBus.js.map