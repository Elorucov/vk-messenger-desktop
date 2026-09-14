import { APIError } from './api';
export class ExecuteError extends APIError {
    constructor(options) {
        super({
            error_code: options.error_code,
            error_msg: options.error_msg,
            request_params: []
        });
        this.method = options.method;
    }
}
//# sourceMappingURL=execute.js.map