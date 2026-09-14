import { createStore, clear, get, set, del } from 'idb-keyval';
var LocalStorageItemType;
(function (LocalStorageItemType) {
    LocalStorageItemType["OBJECT"] = "object";
    LocalStorageItemType["STRING"] = "string";
    LocalStorageItemType["NUMBER"] = "number";
    LocalStorageItemType["BOOLEAN"] = "boolean";
    LocalStorageItemType["STRING_NUMBER"] = "string_number";
})(LocalStorageItemType || (LocalStorageItemType = {}));
export var CacheKey;
(function (CacheKey) {
    CacheKey["HELP_HINTS"] = "helpHints";
})(CacheKey || (CacheKey = {}));
export class Cache {
    /**
     * Название базы данных
     */
    static { this.DB_NAME = 'help-hints'; }
    /**
     * Версия кеша, поднимите для обновления сломанных данных
     */
    static { this.VERSION = 1; }
    /**
     * Ключ, для вызова обновления кеша у всех слушателей
     */
    static { this.CACHE_UPDATE_EVENT_NAME = `${this.DB_NAME}_cache_update`; }
    /**
     * Fallback кеша для браузеров с маленькой квотой
     */
    static { this.cache = new Map(); }
    constructor({ userId = window.vk?.id, categories } = {}) {
        this.userId = userId || 0;
        let storeName = 'cache';
        if (categories?.length) {
            storeName = `${storeName}-${categories.join('-')}`;
        }
        this.store = createStore(Cache.DB_NAME, storeName);
    }
    /**
     * Получает данные для отображения онбординга
     */
    getHelpHints() {
        return this.getItem(CacheKey.HELP_HINTS);
    }
    /**
     * Устанавливает данные для отображения онбординга
     */
    setHelpHints(value) {
        return this.setItem(CacheKey.HELP_HINTS, value);
    }
    /**
     * Отчищает хранилище
     */
    clear() {
        return clear(this.store);
    }
    /**
     * Получает значение ключа из асинхронного хранилища
     */
    async getItem(key) {
        const cacheKey = this.buildItemKey(key);
        const fallback = Cache.cache.get(cacheKey);
        return get(cacheKey, this.store)
            .then((value) => value || fallback)
            .catch(() => fallback);
    }
    /**
     * Устанавливает значение ключа в асинхронном хранилище
     */
    async setItem(key, value) {
        const cacheKey = this.buildItemKey(key);
        Cache.cache.set(cacheKey, value);
        await set(cacheKey, value, this.store).catch(() => undefined);
    }
    /**
     * Удаляет значение ключа из асинхронного хранилища
     */
    deleteItem(key) {
        const cacheKey = this.buildItemKey(key);
        return del(cacheKey, this.store);
    }
    /**
     * Собирает ключ для асинхронного хранилища
     */
    buildItemKey(key) {
        return `${key}-${Cache.VERSION}-${this.userId}`;
    }
    /**
     * Получает значение ключа в синхронном хранилище
     */
    getItemSync(key, type) {
        const cacheKey = this.buildSyncItemKey(key);
        try {
            let item = localStorage.getItem(cacheKey);
            if (!item) {
                return;
            }
            switch (type) {
                case LocalStorageItemType.OBJECT:
                    try {
                        item = JSON.parse(item);
                    }
                    catch {
                        return;
                    }
                    break;
                case LocalStorageItemType.NUMBER:
                    item = Number(item) || 0;
                    break;
                case LocalStorageItemType.STRING_NUMBER:
                    item = Number(item) || item;
                    break;
                case LocalStorageItemType.BOOLEAN:
                    item = Boolean(Number(item));
                    break;
            }
            return item;
        }
        catch {
            return Cache.cache.get(cacheKey);
        }
    }
    /**
     * Устанавливает значение ключа в синхронном хранилище
     */
    setItemSync(key, item, type) {
        const cacheKey = this.buildSyncItemKey(key);
        switch (type) {
            case LocalStorageItemType.OBJECT:
                item = JSON.stringify(item);
                break;
            case LocalStorageItemType.BOOLEAN:
                item = String(Number(item));
                break;
        }
        try {
            localStorage.setItem(cacheKey, item);
        }
        catch {
            Cache.cache.set(cacheKey, item);
        }
    }
    /**
     * Собирает ключ для синхронного хранилища
     */
    buildSyncItemKey(key) {
        return `${Cache.DB_NAME}_${key}_${Cache.VERSION}_${this.userId}`;
    }
}
//# sourceMappingURL=cache.js.map