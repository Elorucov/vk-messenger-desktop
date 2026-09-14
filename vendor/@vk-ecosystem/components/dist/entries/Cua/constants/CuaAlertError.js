import { CuaCode, CuaPasswordErrorCode, CuaPhoneErrorCode, CuaEmailErrorCode, CuaMaxErrorCode } from './CuaCode.js';
import { MaxSessionStatus } from '../hooks/useMaxInCua/constants.js';
var _CuaAlertError, _CuaPasswordAlertErro, _CuaPhoneAlertError, _CuaEmailAlertError, _CuaMaxAlertError, _CuaCheckMaxSessionAl;
var CuaAlertError = (_CuaAlertError = {}, _CuaAlertError[CuaCode.CODE_ERROR_INTERNAL] = {
  header: 'vkconnect_sak_cua_error_internal_header',
  text: 'vkconnect_sak_cua_error_internal_text'
}, _CuaAlertError[CuaCode.CODE_ERROR_TRY_RESEND] = {
  header: 'vkconnect_sak_cua_error_try_resend_header',
  text: 'vkconnect_sak_cua_error_try_resend_text'
}, _CuaAlertError[CuaCode.CODE_ERROR_FLOOD] = {
  header: 'vkconnect_sak_cua_error_flood_header',
  text: 'vkconnect_sak_cua_error_flood_text'
}, _CuaAlertError);
var CuaPasswordAlertError = (_CuaPasswordAlertErro = {}, _CuaPasswordAlertErro[CuaPasswordErrorCode.DO_CHANGE_PASSWORD_SECURITY_ERROR] = {
  header: 'vkconnect_sak_cua_error_password_security_header',
  text: 'vkconnect_sak_cua_error_password_security_text'
}, _CuaPasswordAlertErro[CuaPasswordErrorCode.DO_CHANGE_PASSWORD_DB_FAIL] = {
  header: 'vkconnect_sak_cua_error_password_db_fail_header',
  text: 'vkconnect_sak_cua_error_password_db_fail_text'
}, _CuaPasswordAlertErro[CuaPasswordErrorCode.DO_CHANGE_PASSWORD_ALREADY_SET] = {
  header: 'vkconnect_sak_cua_error_password_alreadey_set_header',
  text: 'vkconnect_sak_cua_error_password_alreadey_set_text'
}, _CuaPasswordAlertErro);
var CuaPhoneAlertError = (_CuaPhoneAlertError = {}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_INCORRECT_PHONE] = {
  header: 'vkconnect_sak_cua_error_phone_validate_incorrect_phone_header',
  text: 'vkconnect_sak_cua_error_phone_validate_incorrect_phone_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_RELEASE_RESTRISTED] = {
  header: 'vkconnect_sak_cua_error_phone_validate_release_restristed_header',
  text: 'vkconnect_sak_cua_error_phone_validate_release_restristed_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_RELEASE_RESTRISTED_USER] = {
  header: 'vkconnect_sak_cua_error_phone_validate_release_restristed_user_header',
  text: 'vkconnect_sak_cua_error_phone_validate_release_restristed_user_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_OTP_ENABLED] = {
  header: 'vkconnect_sak_cua_error_phone_otp_enabled_header',
  text: 'vkconnect_sak_cua_error_phone_otp_enabled_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_CURRENT_PHONE_ACTIVATED] = {
  header: 'vkconnect_sak_cua_error_phone_validate_current_phone_activated_header',
  text: 'vkconnect_sak_cua_error_phone_validate_current_phone_activated_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_USER_ALREADY_ACTIVATED_TODAY] = {
  header: 'vkconnect_sak_cua_error_phone_validate_user_already_activated_today_header',
  text: 'vkconnect_sak_cua_error_phone_validate_user_already_activated_today_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_USED_LAST_BIND] = {
  header: 'vkconnect_sak_cua_error_phone_validate_used_last_bind_header',
  text: 'vkconnect_sak_cua_error_phone_validate_used_last_bind_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_ALREADY_USED_TODAY] = {
  header: 'vkconnect_sak_cua_error_phone_validate_already_used_today_header',
  text: 'vkconnect_sak_cua_error_phone_validate_already_used_today_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_BANNED] = {
  header: 'vkconnect_sak_cua_error_phone_validate_banned_header',
  text: 'vkconnect_sak_cua_error_phone_validate_banned_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_UNKNOWN_ERROR] = {
  header: 'vkconnect_sak_cua_error_phone_validate_unknown_error_header',
  text: 'vkconnect_sak_cua_error_phone_validate_unknown_error_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_ALREADY_PHONE_OWNER] = {
  header: 'vkconnect_sak_cua_error_phone_validate_already_phone_owner_header',
  text: 'vkconnect_sak_cua_error_phone_validate_already_phone_owner_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_OCCUPIED] = {
  header: 'vkconnect_sak_cua_error_phone_validate_occupied_header',
  text: 'vkconnect_sak_cua_error_phone_validate_occupied_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_NO_METHOD_AVAILABLE] = {
  header: 'vkconnect_sak_cua_error_phone_validation_no_method_available_header',
  text: 'vkconnect_sak_cua_error_phone_validation_no_method_available_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_MONTHLY_LIMIT] = {
  header: 'vkconnect_sak_cua_error_phone_validation_monthly_limit_header',
  text: 'vkconnect_sak_cua_error_phone_validation_monthly_limit_text'
}, _CuaPhoneAlertError[CuaPhoneErrorCode.PHONE_VALIDATE_YEARLY_LIMIT] = {
  header: 'vkconnect_sak_cua_error_phone_validation_yearly_limit_header',
  text: 'vkconnect_sak_cua_error_phone_validation_yearly_limit_text'
}, _CuaPhoneAlertError);
var CuaEmailAlertError = (_CuaEmailAlertError = {}, _CuaEmailAlertError[CuaEmailErrorCode.INTERNAL_SERVER_ERROR] = {
  header: 'vkconnect_sak_cua_error_internal_header',
  text: 'vkconnect_sak_cua_error_internal_text'
}, _CuaEmailAlertError);
var CuaMaxAlertError = (_CuaMaxAlertError = {}, _CuaMaxAlertError[CuaMaxErrorCode.INTERNAL_SERVER_ERROR] = {
  header: 'vkconnect_sak_cua_error_internal_header',
  text: 'vkconnect_sak_cua_error_internal_text'
}, _CuaMaxAlertError);
var CuaCheckMaxSessionAlertError = (_CuaCheckMaxSessionAl = {}, _CuaCheckMaxSessionAl[MaxSessionStatus.TimedOut] = {
  header: 'vkconnect_sak_cua_error_internal_header',
  text: 'vkconnect_sak_cua_max_timed_out_error_text'
}, _CuaCheckMaxSessionAl[MaxSessionStatus.Refused] = {
  header: 'vkconnect_sak_cua_error_internal_header',
  text: 'vkconnect_sak_cua_max_refused_error_text'
}, _CuaCheckMaxSessionAl);
export { CuaAlertError, CuaCheckMaxSessionAlertError, CuaEmailAlertError, CuaMaxAlertError, CuaPasswordAlertError, CuaPhoneAlertError };
