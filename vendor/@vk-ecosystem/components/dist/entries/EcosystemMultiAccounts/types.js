var UserStatuses;
(function (UserStatuses) {
  UserStatuses[UserStatuses["OK"] = 0] = "OK";
  UserStatuses[UserStatuses["NEED_REAUTH"] = 1] = "NEED_REAUTH";
  UserStatuses[UserStatuses["DEACTIVATED"] = 2] = "DEACTIVATED";
  UserStatuses[UserStatuses["DEACTIVATED_FULL"] = 3] = "DEACTIVATED_FULL";
  UserStatuses[UserStatuses["BANNED"] = 4] = "BANNED";
  UserStatuses[UserStatuses["BANNED_FOREVER"] = 5] = "BANNED_FOREVER";
})(UserStatuses || (UserStatuses = {}));
function isLoginError(response) {
  return !!(response && response['type'] && ['network_error', 'login_error'].includes(response['type']));
}
export { UserStatuses, isLoginError };
