export class PendingTask {
    constructor() {
        this.get = () => {
            return this.promise;
        };
        this.resolve = (data) => {
            return this.resolveHandler(data);
        };
        this.reject = (data) => {
            return this.rejectHandler(data);
        };
        this.promise = new Promise((resolve, reject) => {
            this.resolveHandler = resolve;
            this.rejectHandler = reject;
        });
    }
}
//# sourceMappingURL=PendingTask.js.map