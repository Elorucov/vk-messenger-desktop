import * as idb from 'idb-keyval';
export class Storage {
    dbName;
    storageId;
    logger;
    idbStorage;
    idbStoreName = 'storage';
    constructor(dbName, storageId, logger) {
        this.dbName = dbName;
        this.storageId = storageId;
        this.logger = logger;
        try {
            this.storageId = storageId;
            this.idbStorage =
                window.indexedDB && idb.createStore(dbName, this.idbStoreName);
        }
        catch (e) {
            logger?.info('Не удалось создать Storage', e);
        }
    }
    get = (key, useSessionStorage) => {
        const mappedKey = this.mapKey(key);
        try {
            const value = (useSessionStorage ? sessionStorage : localStorage).getItem(mappedKey);
            if (!value) {
                return undefined;
            }
            return JSON.parse(value, parser);
        }
        catch (e) {
            this.logger?.info('Не удалось получить значение из Storage', e);
            return undefined;
        }
    };
    set = (key, value, useSessionStorage) => {
        const mappedKey = this.mapKey(key);
        try {
            ;
            (useSessionStorage ? sessionStorage : localStorage).setItem(mappedKey, JSON.stringify(value, stringifier));
        }
        catch (e) {
            this.logger?.info('Не удалось записать значение в Storage', e);
        }
    };
    del = (key, useSessionStorage) => {
        const mappedKey = this.mapKey(key);
        try {
            ;
            (useSessionStorage ? sessionStorage : localStorage).removeItem(mappedKey);
        }
        catch (e) {
            this.logger?.info('Не удалось удалить значение из Storage', e);
        }
    };
    getIDB = async (key) => {
        try {
            const mappedKey = this.mapKey(key);
            return await idb.get(mappedKey, this.idbStorage);
        }
        catch (e) {
            this.logger?.info('Не удалось получить значение из IndexedDB Storage', e);
            return;
        }
    };
    setIDB = async (key, value) => {
        try {
            const mappedKey = this.mapKey(key);
            return await idb.set(mappedKey, value, this.idbStorage);
        }
        catch (e) {
            this.logger?.info('Не удалось записать значение в IndexedDB Storage', e);
        }
    };
    updateIDB = async (key, updater) => {
        try {
            const mappedKey = this.mapKey(key);
            return idb.update(mappedKey, updater, this.idbStorage);
        }
        catch (e) {
            this.logger?.info('Не удалось обновить значение в IndexedDB Storage', e);
        }
    };
    delIDB = async (key) => {
        try {
            const mappedKey = this.mapKey(key);
            return await idb.del(mappedKey, this.idbStorage);
        }
        catch (e) {
            this.logger?.info('Не удалось удалить значение из IndexedDB Storage', e);
        }
    };
    mapKey(key) {
        return `${this.dbName}-${this.storageId}-${key}`;
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        // Пока здесь нечего освобождать
    }
}
function stringifier(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            entries: Array.from(value.entries()),
        };
    }
    if (value instanceof Set) {
        return {
            dataType: 'Set',
            values: Array.from(value.values()),
        };
    }
    return value;
}
function parser(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.entries);
        }
        if (value.dataType === 'Set') {
            return new Set(value.values);
        }
    }
    return value;
}
//# sourceMappingURL=Storage.js.map