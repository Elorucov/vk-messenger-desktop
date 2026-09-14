import { ERROR_CODES } from '../common/errors.js';

function makeError(type, code, message, params) {
    return {
        type,
        code,
        message,
        params
    };
}
function makeValidateError(message, params) {
    return {
        type: ERROR_CODES[ERROR_CODES.VALIDATE_ERROR],
        code: ERROR_CODES.VALIDATE_ERROR,
        message,
        params
    };
}
function makeLegacyError(error) {
    return error.message ? {
        code: error.code,
        reason: error.message,
        data: error.params
    } : {
        code: error.code,
        data: error.params
    };
}

export { makeError, makeLegacyError, makeValidateError };
