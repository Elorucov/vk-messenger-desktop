var ValidationMethodsType;
(function (ValidationMethodsType) {
  ValidationMethodsType["Push"] = "push";
  ValidationMethodsType["Email"] = "email";
  ValidationMethodsType["Phone"] = "phone";
  ValidationMethodsType["Password"] = "password";
  ValidationMethodsType["Max"] = "max";
})(ValidationMethodsType || (ValidationMethodsType = {}));
var CuaLibverifyStates;
(function (CuaLibverifyStates) {
  CuaLibverifyStates["SMS"] = "sms";
  CuaLibverifyStates["CALL_RESET"] = "call_reset";
  CuaLibverifyStates["MOBILE_ID"] = "mobile_id";
  CuaLibverifyStates["COMPLETED"] = "completed";
  CuaLibverifyStates["ERROR"] = "error";
})(CuaLibverifyStates || (CuaLibverifyStates = {}));
var CuaLibverifyError;
(function (CuaLibverifyError) {
  CuaLibverifyError[CuaLibverifyError["DEFAULT"] = 1] = "DEFAULT";
  CuaLibverifyError[CuaLibverifyError["UNSUPPORTED_NUMBER"] = 2] = "UNSUPPORTED_NUMBER";
  CuaLibverifyError[CuaLibverifyError["INCORRECT_PHONE_NUMBER"] = 3] = "INCORRECT_PHONE_NUMBER";
  CuaLibverifyError[CuaLibverifyError["BLACK_LIST"] = 4] = "BLACK_LIST";
  CuaLibverifyError[CuaLibverifyError["INCORRECT_SMS_CODE"] = 5] = "INCORRECT_SMS_CODE";
  CuaLibverifyError[CuaLibverifyError["RATE_LIMIT"] = 6] = "RATE_LIMIT";
  CuaLibverifyError[CuaLibverifyError["NETWORK"] = 7] = "NETWORK";
  CuaLibverifyError[CuaLibverifyError["NO_NETWORK"] = 8] = "NO_NETWORK";
  CuaLibverifyError[CuaLibverifyError["NO_MORE_ROUTES"] = 9] = "NO_MORE_ROUTES";
})(CuaLibverifyError || (CuaLibverifyError = {}));
var CuaLibverifyEvents;
(function (CuaLibverifyEvents) {
  CuaLibverifyEvents["CHANGE_STATE"] = "VKWebAppLibverifyChangeState";
  CuaLibverifyEvents["CANCEL"] = "VKWebAppLibverifyCancel";
  CuaLibverifyEvents["SUPPORTED"] = "VKWebAppLibverifySupported";
  CuaLibverifyEvents["START"] = "VKWebAppLibverifyStart";
  CuaLibverifyEvents["CHECK"] = "VKWebAppLibverifyCheck";
  CuaLibverifyEvents["RESEND"] = "VKWebAppLibverifyResend";
})(CuaLibverifyEvents || (CuaLibverifyEvents = {}));
export { CuaLibverifyError, CuaLibverifyEvents, CuaLibverifyStates, ValidationMethodsType };
