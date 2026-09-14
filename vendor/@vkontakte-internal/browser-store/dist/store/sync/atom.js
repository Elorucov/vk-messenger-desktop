import { Atom } from '../atom';
export var SyncAtomType;
(function (SyncAtomType) {
    SyncAtomType["OBJECT"] = "object";
    SyncAtomType["STRING"] = "string";
    SyncAtomType["NUMBER"] = "number";
    SyncAtomType["BOOLEAN"] = "boolean";
    SyncAtomType["STRING_NUMBER"] = "string_number";
})(SyncAtomType || (SyncAtomType = {}));
export class SyncAtom extends Atom {
    constructor(options) {
        super(options);
        const { base, type } = options;
        this.base = base;
        this.type = type;
    }
    /**
     * Получает значение ключа
     */
    get() {
        const key = this.getKey();
        try {
            let item = localStorage.getItem(key);
            if (!item) {
                return null;
            }
            switch (this.type) {
                case SyncAtomType.OBJECT:
                    try {
                        item = JSON.parse(item);
                    }
                    catch {
                        return null;
                    }
                    break;
                case SyncAtomType.NUMBER:
                    item = Number(item) || 0;
                    break;
                case SyncAtomType.STRING_NUMBER:
                    item = Number(item) || item;
                    break;
                case SyncAtomType.BOOLEAN:
                    item = Boolean(Number(item));
                    break;
            }
            return item;
        }
        catch (error) {
            console.log(`${key}: Ошибка чтения данных из хранилища`);
            console.log(error);
            return this.cache || null;
        }
    }
    /**
     * Устанавливает значение ключа
     */
    set(value, options) {
        const key = this.getKey();
        let serializedValue;
        switch (this.type) {
            case SyncAtomType.OBJECT:
                serializedValue = JSON.stringify(value);
                break;
            case SyncAtomType.BOOLEAN:
                serializedValue = String(Number(value));
                break;
            default:
                serializedValue = String(value);
                break;
        }
        try {
            localStorage.setItem(key, serializedValue);
        }
        catch (error) {
            console.log(`${key}: Не удалось записать данные в хранилище`);
            console.log(error);
            this.cache = value;
        }
        super.set(value, options);
    }
    /**
     * Удаляет ключ
     */
    delete() {
        const key = this.getKey();
        try {
            delete this.cache;
            localStorage.removeItem(key);
        }
        catch (error) {
            console.log(`${key}: Ошибка удаления ключа из хранилища`);
            console.log(error);
        }
    }
    getKey() {
        return `${this.base.key}-${this.key}`;
    }
}
//# sourceMappingURL=atom.js.map