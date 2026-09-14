var AuthErrorCode;
(function(AuthErrorCode) {
    AuthErrorCode[AuthErrorCode[/**
   * Неизвестное событие
   */ "EventNotSupported"] = 100] = "EventNotSupported";
    AuthErrorCode[AuthErrorCode[/**
   * Новая вкладка не создалась
   */ "CannotCreateNewTab"] = 101] = "CannotCreateNewTab";
    AuthErrorCode[AuthErrorCode[/**
   * Новая вкладка была закрыта
   */ "NewTabHasBeenClosed"] = 102] = "NewTabHasBeenClosed";
    AuthErrorCode[AuthErrorCode[/**
   * Авторизация завершилась ошибкой
   */ "AuthorizationFailed"] = 103] = "AuthorizationFailed";
})(AuthErrorCode || (AuthErrorCode = {}));

export { AuthErrorCode };
