var CuaCode;
(function (CuaCode) {
  // после check* методов
  CuaCode[CuaCode["CODE_OK"] = 0] = "CODE_OK";
  CuaCode[CuaCode["CODE_METHOD_OK"] = 1] = "CODE_METHOD_OK";
  // после send* методов
  CuaCode[CuaCode["CODE_OTP_CODE_SENT"] = 2] = "CODE_OTP_CODE_SENT";
  // после check* методов, если нужна дополнительная валидация
  CuaCode[CuaCode["CODE_NEED_MORE_VALIDATION"] = 9] = "CODE_NEED_MORE_VALIDATION";
  // что-то пошло не так
  CuaCode[CuaCode["CODE_ERROR_INTERNAL"] = 3] = "CODE_ERROR_INTERNAL";
  // некоректный код
  CuaCode[CuaCode["CODE_ERROR_INCORRECT_CODE"] = 4] = "CODE_ERROR_INCORRECT_CODE";
  // неправильный пароль
  CuaCode[CuaCode["CODE_ERROR_PASSWORD_INCORRECT"] = 5] = "CODE_ERROR_PASSWORD_INCORRECT";
  // слишком много попыток
  CuaCode[CuaCode["CODE_ERROR_FLOOD"] = 6] = "CODE_ERROR_FLOOD";
  // нужно подождать до повторной переотправки
  CuaCode[CuaCode["CODE_ERROR_RESEND_TIMEOUT"] = 7] = "CODE_ERROR_RESEND_TIMEOUT";
  // что-то пошло не так, нужно переотправить код
  CuaCode[CuaCode["CODE_ERROR_TRY_RESEND"] = 8] = "CODE_ERROR_TRY_RESEND";
  // ошибка валидации телефона, дополнительный код в поле phone_error
  CuaCode[CuaCode["CODE_ERROR_PHONE_BIND_CHECK_ERROR"] = 10] = "CODE_ERROR_PHONE_BIND_CHECK_ERROR";
  // нужно привязать телефон
  CuaCode[CuaCode["CODE_ERROR_NEED_BIND_PHONE"] = 11] = "CODE_ERROR_NEED_BIND_PHONE";
  // не используется
  CuaCode[CuaCode["CODE_ERROR_NEED_PHONE_VALIDATION"] = 12] = "CODE_ERROR_NEED_PHONE_VALIDATION";
  // нужно установить пароль
  CuaCode[CuaCode["CODE_ERROR_NEED_SET_PASSWORD"] = 13] = "CODE_ERROR_NEED_SET_PASSWORD";
  // ошибка установки пароля, дополнительный код в поле password_error
  CuaCode[CuaCode["CODE_ERROR_SET_PASSWORD_ERROR"] = 14] = "CODE_ERROR_SET_PASSWORD_ERROR";
  // прохождение куа не требуется
  CuaCode[CuaCode["CODE_SKIP_CUA"] = 16] = "CODE_SKIP_CUA";
})(CuaCode || (CuaCode = {}));
var CuaPhoneErrorCode;
(function (CuaPhoneErrorCode) {
  // некорректный телефон
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_INCORRECT_PHONE"] = 1] = "PHONE_VALIDATE_INCORRECT_PHONE";
  // телефон уже привязан (возвращается не только если телефон совпадает)
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_CURRENT_PHONE_ACTIVATED"] = 6] = "PHONE_VALIDATE_CURRENT_PHONE_ACTIVATED";
  // дневной лимит привязки телефона пользователем
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_USER_ALREADY_ACTIVATED_TODAY"] = 7] = "PHONE_VALIDATE_USER_ALREADY_ACTIVATED_TODAY";
  // ошибка для админки
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_USED_LAST_BIND"] = 8] = "PHONE_VALIDATE_USED_LAST_BIND";
  // дневной лимит использования телефона
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_ALREADY_USED_TODAY"] = 9] = "PHONE_VALIDATE_ALREADY_USED_TODAY";
  // пользователь или телефон заблокирован
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_BANNED"] = 10] = "PHONE_VALIDATE_BANNED";
  // телефон используется аккаунтом с 2фа
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_OTP_ENABLED"] = 11] = "PHONE_OTP_ENABLED";
  // неизвестная ошибка
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_UNKNOWN_ERROR"] = 12] = "PHONE_VALIDATE_UNKNOWN_ERROR";
  // телефон заблокирован
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_RELEASE_RESTRISTED"] = 42] = "PHONE_VALIDATE_RELEASE_RESTRISTED";
  // пользователь не может менять телефон
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_RELEASE_RESTRISTED_USER"] = 43] = "PHONE_VALIDATE_RELEASE_RESTRISTED_USER";
  // уже является владельцем номера
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_ALREADY_PHONE_OWNER"] = 72] = "PHONE_VALIDATE_ALREADY_PHONE_OWNER";
  // телефон занят
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_OCCUPIED"] = 74] = "PHONE_VALIDATE_OCCUPIED";
  // месячный лимит перепривязки телефона
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_MONTHLY_LIMIT"] = 78] = "PHONE_VALIDATE_MONTHLY_LIMIT";
  // годовой лимит перепривязки телефона
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_YEARLY_LIMIT"] = 79] = "PHONE_VALIDATE_YEARLY_LIMIT";
  // нет доступного способа верификации номера
  CuaPhoneErrorCode[CuaPhoneErrorCode["PHONE_VALIDATE_NO_METHOD_AVAILABLE"] = 11503] = "PHONE_VALIDATE_NO_METHOD_AVAILABLE";
})(CuaPhoneErrorCode || (CuaPhoneErrorCode = {}));
var CuaMaxErrorCode;
(function (CuaMaxErrorCode) {
  // внутренняя ошибка сервера
  CuaMaxErrorCode[CuaMaxErrorCode["INTERNAL_SERVER_ERROR"] = 10] = "INTERNAL_SERVER_ERROR";
})(CuaMaxErrorCode || (CuaMaxErrorCode = {}));
var CuaEmailErrorCode;
(function (CuaEmailErrorCode) {
  // внутренняя ошибка сервера
  CuaEmailErrorCode[CuaEmailErrorCode["INTERNAL_SERVER_ERROR"] = 10] = "INTERNAL_SERVER_ERROR";
})(CuaEmailErrorCode || (CuaEmailErrorCode = {}));
var CuaPasswordErrorCode;
(function (CuaPasswordErrorCode) {
  // Ошибка доступа
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_SECURITY_ERROR"] = 341] = "DO_CHANGE_PASSWORD_SECURITY_ERROR";
  // Пароль должен быть не короче 6 символов
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_PASSWORD_MINIMUM_LENGTH"] = 342] = "DO_CHANGE_PASSWORD_PASSWORD_MINIMUM_LENGTH";
  // Указан неверный пароль.
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_BAD_PASSWORD"] = 343] = "DO_CHANGE_PASSWORD_BAD_PASSWORD";
  // Ваш пароль был скомпрометирован
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_COMPROMISED_PASSWORD"] = 344] = "DO_CHANGE_PASSWORD_COMPROMISED_PASSWORD";
  // Произошла ошибка. Повторите операцию позже.
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_DB_FAIL"] = 345] = "DO_CHANGE_PASSWORD_DB_FAIL";
  // без описания
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_SUCCESS"] = 346] = "DO_CHANGE_PASSWORD_SUCCESS";
  // Пароль слишком простой
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_NUMERIC_PASSWORD"] = 347] = "DO_CHANGE_PASSWORD_NUMERIC_PASSWORD";
  // Пароль должен быть не более 1024 символов
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_LONG_PASSWORD"] = 348] = "DO_CHANGE_PASSWORD_LONG_PASSWORD";
  // Этот пароль небезопасен
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_NOT_HARDENING"] = 349] = "DO_CHANGE_PASSWORD_NOT_HARDENING";
  // Этот пароль не может быть использован
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_USED_IN_ANOTHER_PROFILE"] = 350] = "DO_CHANGE_PASSWORD_USED_IN_ANOTHER_PROFILE";
  // Этот пароль найден в открытой базе в интернете.
  // Придумайте другой, чтобы лучше защитить свои данные.
  CuaPasswordErrorCode[CuaPasswordErrorCode["DO_CHANGE_PASSWORD_ALREADY_SET"] = 351] = "DO_CHANGE_PASSWORD_ALREADY_SET";
})(CuaPasswordErrorCode || (CuaPasswordErrorCode = {}));
export { CuaCode, CuaEmailErrorCode, CuaMaxErrorCode, CuaPasswordErrorCode, CuaPhoneErrorCode };
