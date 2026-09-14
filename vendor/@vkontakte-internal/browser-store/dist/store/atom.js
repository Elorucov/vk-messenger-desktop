export class Atom {
    constructor({ key, base }) {
        this.key = key;
        this.base = base;
    }
    set(value, { notify = true } = {}) {
        if (notify) {
            this.base.notify(this.key);
        }
    }
    getKey() {
        return `${this.base.options.storeName}-${this.key}`;
    }
}
//# sourceMappingURL=atom.js.map