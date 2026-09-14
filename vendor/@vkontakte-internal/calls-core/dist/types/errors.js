export var ErrorHandleType;
(function (ErrorHandleType) {
    ErrorHandleType[ErrorHandleType["DECLINE"] = 0] = "DECLINE";
    ErrorHandleType[ErrorHandleType["PROCESS"] = 1] = "PROCESS";
    ErrorHandleType[ErrorHandleType["FATAL"] = 2] = "FATAL";
    ErrorHandleType[ErrorHandleType["EMPTY"] = 3] = "EMPTY";
})(ErrorHandleType || (ErrorHandleType = {}));
/**
 * Коды ошибок от сервера
 * Ошибки с префиксом MESSAGES являются ошибками из старого диапазона мессенджера
 */
export var ServerError;
(function (ServerError) {
    ServerError[ServerError["UNKNOWN"] = 1] = "UNKNOWN";
    ServerError[ServerError["INVALID_REQUEST"] = 8] = "INVALID_REQUEST";
    ServerError[ServerError["FLOOD_CONTROL"] = 9] = "FLOOD_CONTROL";
    ServerError[ServerError["INTERNAL"] = 10] = "INTERNAL";
    ServerError[ServerError["CAPTCHA_ERROR"] = 14] = "CAPTCHA_ERROR";
    ServerError[ServerError["MESSAGES_REQUIRE_AUTH"] = 960] = "MESSAGES_REQUIRE_AUTH";
    ServerError[ServerError["REQUIRE_AUTH"] = 9005] = "REQUIRE_AUTH";
    ServerError[ServerError["MESSAGES_PRIVACY"] = 928] = "MESSAGES_PRIVACY";
    ServerError[ServerError["MESSAGES_OLD_RECEIVER_APP"] = 923] = "MESSAGES_OLD_RECEIVER_APP";
    ServerError[ServerError["MESSAGES_BUSY"] = 948] = "MESSAGES_BUSY";
    ServerError[ServerError["MESSAGES_OUTDATED_CALL_LINK"] = 961] = "MESSAGES_OUTDATED_CALL_LINK";
    ServerError[ServerError["OUTDATED_CALL_LINK"] = 9006] = "OUTDATED_CALL_LINK";
    ServerError[ServerError["MESSAGES_CALL_JOIN_NOT_ALLOWED"] = 963] = "MESSAGES_CALL_JOIN_NOT_ALLOWED";
    ServerError[ServerError["CALL_JOIN_NOT_ALLOWED"] = 15] = "CALL_JOIN_NOT_ALLOWED";
    ServerError[ServerError["MESSAGES_CALL_NOT_FOUND"] = 951] = "MESSAGES_CALL_NOT_FOUND";
    ServerError[ServerError["CALL_NOT_FOUND"] = 9000] = "CALL_NOT_FOUND";
    ServerError[ServerError["MESSAGES_CALL_INVALID_JOIN_LINK"] = 954] = "MESSAGES_CALL_INVALID_JOIN_LINK";
    ServerError[ServerError["CALL_INVALID_JOIN_LINK"] = 9008] = "CALL_INVALID_JOIN_LINK";
    ServerError[ServerError["CALL_PASSWORD_IS_MISSING"] = 9015] = "CALL_PASSWORD_IS_MISSING";
})(ServerError || (ServerError = {}));
//# sourceMappingURL=errors.js.map