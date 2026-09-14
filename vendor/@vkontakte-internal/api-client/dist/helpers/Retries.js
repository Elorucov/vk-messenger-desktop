export class Attempt {
    constructor(maxTries = Infinity) {
        this.tries = 0;
        this.increment = () => {
            this.tries++;
        };
        this.get = () => {
            return this.tries;
        };
        this.isExceeded = () => {
            return this.tries >= this.maxTries;
        };
        this.maxTries = maxTries;
    }
}
export class Retries {
    constructor() {
        this.retries = new Map();
        this.get = (key) => {
            return this.retries.get(key);
        };
        this.create = (key, maxRetries) => {
            this.retries.set(key, new Attempt(maxRetries));
            return this.retries.get(key);
        };
        this.delete = (key) => {
            this.retries.delete(key);
        };
    }
}
//# sourceMappingURL=Retries.js.map