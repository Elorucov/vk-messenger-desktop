/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * статический класс-хелпер для работы с глобальным стором редакса
 * "звонков" (__обратите внимание, что у страницы "истории звонков" свой
 * экземпляр стора!__) в разных частях приложения и позволяющий не
 * прокидывать ссылку на стор через `useSelector` в хелперы внутри
 * компонентов.
 *
 * `setStore` выставляется __только__ в `index.tsx` внутри функции `init`
 */
export class GlobalStore {
    /** ссылка на стор звонков */
    static { this._callsStore = null; }
    static { this.listeners = new Map(); }
    /**
     * @do_not_use_directly
     *
     * выставляется __только__ в index.tsx внутри функции init
     */
    static setCallsStore(store) {
        GlobalStore.unsubscribeAllListeners();
        GlobalStore._callsStore = store;
        if (store) {
            // resubscribe to new store instance
            this.listeners.forEach((_, listener) => {
                this.listeners.set(listener, store.subscribe(listener));
                // при создании стора подписки не вызываются, актуально только для тестов
                listener();
            });
        }
    }
    /** возвращает ссылку на текущий стор звонков */
    static getCallsStore() {
        if (!GlobalStore._callsStore) {
            throw new Error('store was not initiated!');
        }
        return GlobalStore._callsStore;
    }
    static isSet() {
        return !!GlobalStore._callsStore;
    }
    /** возвращает ссылку на текущий стейт стора звонков */
    static getCallsState() {
        return GlobalStore.getCallsStore().getState();
    }
    /**
     * For tests/stories only when store instance may be replaced
     * Adds listener to every state update
     */
    static addStoreUpdateListener(listener) {
        this.listeners.set(listener, this.getCallsStore().subscribe(listener));
        return () => {
            // call unsubscribe fn
            this.listeners.get(listener)?.();
            this.listeners.delete(listener);
        };
    }
    static unsubscribeAllListeners() {
        this.listeners.forEach((unsubscribeFn) => {
            unsubscribeFn();
        });
    }
}
//# sourceMappingURL=globalStore.js.map