export class ExternalEvents {
    listeners = [];
    send = (name, data) => {
        for (const listener of this.listeners) {
            listener(name, data);
        }
    };
    subscribe = (listener) => {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    };
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока здесь нечего подчищать
    }
}
//# sourceMappingURL=ExternalEvents.js.map