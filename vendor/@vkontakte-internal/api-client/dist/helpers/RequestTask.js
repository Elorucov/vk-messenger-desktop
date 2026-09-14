import { getApiBodyParams, getApiQueryParams } from '../modules/API/utils';
export class RequestTask {
    constructor(method, methodParams, apiConfig = {}, overrideApiConfig = {}, fetchOptions = {}) {
        this.resolve = () => { };
        this.reject = () => { };
        this.method = method;
        this.methodParams = methodParams;
        this.fetchOptions = fetchOptions;
        this.overrideApiConfig = overrideApiConfig;
        this.apiConfig = Object.assign({}, apiConfig, overrideApiConfig);
        this.grouping = this.apiConfig.grouping;
        this.queryParams = getApiQueryParams(this.apiConfig);
        if (this.apiConfig.captureAsyncStacktrace) {
            this.asyncBaseError = new Error('Async error');
        }
        const bodyParams = getApiBodyParams(this.apiConfig);
        this.bodyParams = Object.assign({}, methodParams, bodyParams);
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    setAccessToken(value) {
        this.bodyParams.access_token = value;
    }
    setGrouping(value) {
        this.grouping = value;
    }
    setParams(value) {
        this.methodParams = value;
    }
    canGroupInExecute() {
        if (this.method.includes('execute')) {
            return false;
        }
        if (!this.apiConfig.accessToken) {
            return false;
        }
        if (this.methodParams.v) {
            return false;
        }
        if (this.grouping === false) {
            return false;
        }
        if (this.fetchOptions.method !== undefined) {
            return false;
        }
        if (this.fetchOptions.headers !== undefined) {
            return false;
        }
        return this.fetchOptions.signal === undefined;
    }
    toString() {
        const executeParams = {};
        if (typeof this.methodParams === 'object') {
            Object.keys(this.methodParams).forEach((key) => {
                const value = this.methodParams[key];
                if (value === undefined || value === null) {
                    return;
                }
                if (typeof value === 'object') {
                    executeParams[key] = String(value);
                }
                else {
                    executeParams[key] = value;
                }
            });
        }
        return `API.${this.method}(${JSON.stringify(executeParams)})`;
    }
}
//# sourceMappingURL=RequestTask.js.map