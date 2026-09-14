import { API_ERROR_FLOOD, API_ERROR_RATE_LIMIT, API_ERROR_TOO_MANY } from '../../error-codes';
import { makeParams } from '../../utils/utilsUrl';
import { API_VERSION } from './constants';
export const getApiQueryParams = (config) => {
    // Some requests do not work if client_id and v are in body.
    // Mainly those requests are auth. requests
    const params = {
        v: config.version || API_VERSION,
    };
    if (config.appId) {
        params['client_id'] = config.appId;
    }
    return params;
};
export const getApiBodyParams = (config) => {
    return {
        access_token: config.accessToken,
    };
};
export const getRequestHash = (url, params = {}) => {
    return `${url}-${makeParams(Object.assign({}, params))}`;
};
export const isNotAllowedToMakeMoreRequests = (errorCode) => {
    return (errorCode === API_ERROR_RATE_LIMIT || errorCode === API_ERROR_FLOOD || errorCode === API_ERROR_TOO_MANY);
};
export const rejectWithApiError = (task, errorBody) => {
    if (!task.apiConfig.throwFullErrors) {
        task.reject(errorBody);
        return;
    }
    const error = new Error('Api request failed', task.asyncBaseError ? { cause: task.asyncBaseError } : undefined);
    Object.entries(errorBody).forEach(([key, value]) => {
        error[key] = value;
    });
    task.reject(error);
};
//# sourceMappingURL=utils.js.map