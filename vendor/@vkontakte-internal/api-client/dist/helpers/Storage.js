// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Storage {
    static { this.setItemToStorage = (key, value) => {
        try {
            localStorage.setItem(key, value);
        }
        catch (e) { }
    }; }
    static { this.getItemFromStorage = (key) => {
        try {
            return localStorage.getItem(key);
        }
        catch (e) { }
    }; }
    static { this.removeItemFromStorage = (key) => {
        try {
            localStorage.removeItem(key);
        }
        catch (e) { }
    }; }
}
//# sourceMappingURL=Storage.js.map