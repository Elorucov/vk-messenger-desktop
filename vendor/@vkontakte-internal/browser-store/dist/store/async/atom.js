import { del, get, set } from 'idb-keyval';
import { Atom } from '../atom';
export class AsyncAtom extends Atom {
    constructor(options) {
        super(options);
        const { base } = options;
        this.base = base;
    }
    async get() {
        const key = this.getKey();
        try {
            const value = await get(key, this.base.store);
            return value || this.cache || null;
        }
        catch (error) {
            console.log(`${key}: Ошибка чтения данных из хранилища`);
            console.log(error);
            return this.cache || null;
        }
    }
    async set(value, options) {
        const key = this.getKey();
        try {
            await set(key, value, this.base.store);
        }
        catch (error) {
            console.log(`${key}: Не удалось записать данные в хранилище`);
            console.log(error);
            this.cache = value;
        }
        super.set(value, options);
    }
    async delete() {
        const key = this.getKey();
        delete this.cache;
        try {
            await del(key, this.base.store);
            this.base.notify(this.key);
        }
        catch (error) {
            console.log(`${key}: Ошибка удаления ключа из хранилища`);
            console.log(error);
        }
    }
}
//# sourceMappingURL=atom.js.map