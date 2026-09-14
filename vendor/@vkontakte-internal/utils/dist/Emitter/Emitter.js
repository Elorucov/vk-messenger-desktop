/* eslint-disable @typescript-eslint/unified-signatures */
/**
 * Emitter со строгой типизацией
 */
export class Emitter {
    #catchListener;
    #listeners = new Map();
    constructor({ catchListener } = {}) {
        this.#catchListener = catchListener;
        this.listenable = new EmitterListenable(this.#listeners);
    }
    emit(eventName, ...data) {
        const catchListener = this.#catchListener;
        const listeners = this.#listeners.get(eventName);
        if (!listeners || !listeners.length) {
            return false;
        }
        for (const listener of [...listeners]) {
            try {
                // Ослабление типа для обхода ошибки TS2556, чтобы не передавать пустой аргумент туда, где он не должен быть
                listener(...data);
            }
            catch (e) {
                if (!catchListener) {
                    throw e;
                }
                catchListener(e);
            }
        }
        return true;
    }
    /**
     * @deprecated используйте `listenable.on`
     */
    on(eventName, listener) {
        this.listenable.on(eventName, listener);
        return this;
    }
    /**
     * @deprecated используйте `listenable.once`
     */
    once(eventName, listener) {
        this.listenable.once(eventName, listener);
        return this;
    }
    /**
     * @deprecated используйте `listenable.off`
     */
    off(eventName, listener) {
        this.listenable.off(eventName, listener);
        return this;
    }
    /**
     * @deprecated используйте `listenable.createAggregator`
     */
    createAggregator() {
        return this.listenable.createAggregator();
    }
}
class EmitterListenable {
    #listeners;
    constructor(listeners) {
        this.#listeners = listeners;
    }
    on(eventName, listener, options = {}) {
        this.#ensureListeners(eventName).push(this.#wrapListener(eventName, listener, options, false));
        return this;
    }
    once(eventName, listener, options = {}) {
        this.#ensureListeners(eventName).push(this.#wrapListener(eventName, listener, options, true));
        return this;
    }
    off(eventName, listener) {
        let listeners = this.#listeners.get(eventName);
        if (!listeners) {
            return this;
        }
        for (let i = listeners.length - 1; i >= 0; i--) {
            const current = listeners[i];
            if (current.fn === listener) {
                listeners.splice(i, 1);
                try {
                    current.onUnlistened?.();
                }
                finally {
                    break;
                }
            }
        }
        /**
         * eventName может быть шаблонной строкой содержащей всякие идентификаторы
         *
         * Для экономии памяти пустые массивы слушателей удаляются
         */
        if (!listeners.length) {
            this.#listeners.delete(eventName);
        }
        return this;
    }
    createAggregator() {
        return new EmitterListenersAggregator(this);
    }
    #wrapListener(eventName, listener, options, once) {
        let fired = false;
        const wrapper = (...args) => {
            if (once && fired) {
                return;
            }
            if (once) {
                this.off(eventName, listener);
            }
            fired = true;
            // Ослабление типа для обхода ошибки TS2556, чтобы не передавать пустой аргумент туда, где он не должен быть
            // eslint-disable-next-line @typescript-eslint/no-restricted-types
            listener(...args);
        };
        wrapper.fn = listener;
        wrapper.onUnlistened = options.onUnlistened ?? null;
        return wrapper;
    }
    #ensureListeners(eventName) {
        let listeners = this.#listeners.get(eventName);
        if (!listeners) {
            listeners = [];
            this.#listeners.set(eventName, listeners);
        }
        return listeners;
    }
}
class EmitterListenersAggregator {
    #disposers = new Set();
    #emitter;
    constructor(emitter) {
        this.#emitter = emitter;
    }
    on(eventName, listener) {
        const disposer = this.#registerDisposer(eventName, listener);
        this.#emitter.on(eventName, listener, {
            onUnlistened: () => {
                this.#disposers.delete(disposer);
            },
        });
        return this;
    }
    once(eventName, listener) {
        const disposer = this.#registerDisposer(eventName, listener);
        this.#emitter.once(eventName, listener, {
            onUnlistened: () => {
                this.#disposers.delete(disposer);
            },
        });
        return this;
    }
    off(eventName, listener) {
        this.#emitter.off(eventName, listener);
        return this;
    }
    dispose() {
        for (const disposer of this.#disposers) {
            disposer();
        }
        this.#disposers.clear();
    }
    createAggregator() {
        return this.#emitter.createAggregator();
    }
    #registerDisposer(eventName, listener) {
        const disposer = () => this.#emitter.off(eventName, listener);
        this.#disposers.add(disposer);
        return disposer;
    }
}
//# sourceMappingURL=Emitter.js.map