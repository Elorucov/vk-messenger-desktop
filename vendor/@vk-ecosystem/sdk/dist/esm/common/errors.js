var ERROR_CODES;
(function(ERROR_CODES) {
    ERROR_CODES[ERROR_CODES["UNKNOWN"] = 1] = "UNKNOWN";
    ERROR_CODES[ERROR_CODES["MISSING_PARAM"] = 2] = "MISSING_PARAM";
    ERROR_CODES[ERROR_CODES["CONNECTION_LOST"] = 3] = "CONNECTION_LOST";
    ERROR_CODES[ERROR_CODES["USER_DENIED"] = 4] = "USER_DENIED";
    ERROR_CODES[ERROR_CODES["INVALID_PARAMS"] = 5] = "INVALID_PARAMS";
    ERROR_CODES[ERROR_CODES["CUSTOM"] = 6] = "CUSTOM";
    ERROR_CODES[ERROR_CODES["LOADING_ERROR"] = 7] = "LOADING_ERROR";
    // Connect auth errors
    ERROR_CODES[ERROR_CODES["CONNECT_WINDOW_CLOSED"] = 7] = "CONNECT_WINDOW_CLOSED";
    ERROR_CODES[ERROR_CODES["CONNECT_WINDOW_NOT_OPENED"] = 8] = "CONNECT_WINDOW_NOT_OPENED";
    ERROR_CODES[ERROR_CODES["CONNECT_DOMAIN_NOT_ALLOWED"] = 9] = "CONNECT_DOMAIN_NOT_ALLOWED";
    ERROR_CODES[ERROR_CODES["CONNECT_UNKNOWN_SDK_MESSAGE"] = 10] = "CONNECT_UNKNOWN_SDK_MESSAGE";
    ERROR_CODES[ERROR_CODES["CONNECT_CLIENT_SDK_ERROR"] = 11] = "CONNECT_CLIENT_SDK_ERROR";
    ERROR_CODES[ERROR_CODES["VALIDATE_ERROR"] = 12] = "VALIDATE_ERROR";
    ERROR_CODES[ERROR_CODES["CAPTCHA_ERROR"] = 14] = "CAPTCHA_ERROR";
    ERROR_CODES[ERROR_CODES["OLD_MISSING_PARAM"] = 100] = "OLD_MISSING_PARAM";
})(ERROR_CODES || (ERROR_CODES = {}));
const CommonErrorReasons = {
    wrongParam: (param, message)=>`Wrong "${param}" param. ${message ? message : ''}`,
    connectWindowNotOpened: ()=>'Connect window was not opened.',
    loadingTimeout: ()=>'Loading timeout',
    validationIsNumber: (param)=>'The ' + param + ' parameter must be a number',
    validationIsString: (param)=>'The ' + param + ' parameter must be a string',
    validationIsRequired: (param)=>'The ' + param + ' is required parameter',
    validationIsNumberOrString: (param)=>'The ' + param + ' parameter must be a number or a string',
    validationIsFunction: (param)=>'The ' + param + ' parameter must be а function'
};

export { CommonErrorReasons, ERROR_CODES };
