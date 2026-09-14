// iOS 13 и ниже не поддерживает расширение EventTarget класса
export class EventDispatcher {
    constructor() {
        this.listeners = [];
    }
    hasEventListener(type, listener) {
        return this.listeners.some((item) => item.type === type && item.listener === listener);
    }
    addEventListener(type, listener, options = {}) {
        if (!this.hasEventListener(type, listener)) {
            this.listeners.push({
                type: type,
                listener,
                options,
            });
        }
        return this;
    }
    removeEventListener(type, listener) {
        const index = this.listeners.findIndex((item) => item.type === type && item.listener === listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
        return this;
    }
    removeEventListeners() {
        this.listeners = [];
        return this;
    }
    dispatchEvent(type, ...args) {
        this.listeners
            .filter((item) => item.type === type)
            .forEach((item) => {
            const { type, listener, options } = item;
            listener(...args);
            if (options?.once) {
                this.removeEventListener(type, listener);
            }
        });
        return this;
    }
}
//# sourceMappingURL=index.js.map