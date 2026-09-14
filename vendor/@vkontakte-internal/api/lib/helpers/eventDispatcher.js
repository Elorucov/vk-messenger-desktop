// iOS 13 и ниже не позволяет расширять EventTarget класс
export class EventDispatcher {
    constructor() {
        this.listeners = [];
    }
    hasEventListener(type, listener, id) {
        return this.listeners.some((item) => {
            // идентификатор имеет приоритет над остальными параметрами
            if (id && item.id === id) {
                return true;
            }
            return item.type === type && item.listener === listener;
        });
    }
    addEventListener(type, listener, options = {}, id) {
        if (!this.hasEventListener(type, listener, id)) {
            this.listeners.push({
                type: type,
                listener,
                options,
                id,
            });
        }
        return this;
    }
    removeEventListener(type, listener, id) {
        if (id) {
            this.listeners = this.listeners.filter((listener) => listener.id !== id);
            return this;
        }
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
    dispatchEvent(event) {
        this.listeners
            .filter((item) => item.type === event.type)
            .forEach((item) => {
            const { type, listener, options: { once }, } = item;
            listener.call(this, event);
            if (once) {
                this.removeEventListener(type, listener);
            }
        });
        return this;
    }
}
//# sourceMappingURL=eventDispatcher.js.map