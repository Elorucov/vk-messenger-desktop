export class Store {
    static { this.instances = new Map(); }
    static {
        window.addEventListener('storage', ({ key, newValue }) => {
            if (!key || newValue === null) {
                return;
            }
            const store = this.instances.get(key);
            store?.notify();
        });
    }
    constructor(options) {
        /**
         * Обработчики изменения хранилища
         */
        this.listeners = new Set();
        /**
         * Обработчики синхронизации между вкладками
         */
        this.syncListeners = new Set();
        this.options = options;
        Store.instances.set(this.key, this);
    }
    /**
     * Подписывает на обновления хранилища
     */
    subscribe(listener, sync) {
        const listeners = this.getListeners(sync);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
    /**
     * Оповещает слушателей об обновлении ключа
     *
     * @hidden
     */
    notify(key, sync) {
        const listeners = this.getListeners(sync);
        listeners.forEach((listener) => {
            listener(key);
        });
    }
    /**
     * Вызывает событие обновления для всех вкладок браузера
     */
    refresh() {
        try {
            localStorage.setItem(this.key, '');
            localStorage.removeItem(this.key);
        }
        catch { }
    }
    /**
     * Функция отчистки
     */
    destroy() {
        this.listeners.clear();
        this.syncListeners.clear();
        Store.instances.delete(this.key);
    }
    /**
     * Ключ хранилища
     */
    get key() {
        const { dbName, storeName, version } = this.options;
        return `${dbName}-v${version}-${storeName}`;
    }
    getListeners(sync) {
        return sync ? this.syncListeners : this.listeners;
    }
}
//# sourceMappingURL=store.js.map