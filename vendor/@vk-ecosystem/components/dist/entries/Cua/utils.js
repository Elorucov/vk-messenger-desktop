import { CuaPages } from './types.js';
var getPageByMethod = function getPageByMethod(method) {
  var page = method.type;
  if (page === 'phone') {
    var _method$phone_info, _method$phone_info2;
    var hasPhone = (_method$phone_info = method.phone_info) == null ? void 0 : _method$phone_info.has_phone;
    var currentCodeType = (_method$phone_info2 = method.phone_info) == null ? void 0 : _method$phone_info2.current_code_type;
    if (!hasPhone) {
      return CuaPages.SET_PHONE;
    }
    return currentCodeType;
  }
  if (page === 'email') {
    var _method$email_info;
    var hasEmail = (_method$email_info = method.email_info) == null ? void 0 : _method$email_info.has_email;
    if (!hasEmail) {
      return CuaPages.SET_EMAIL;
    }
  }
  if (page === 'password') {
    var _method$password_info;
    var hasPassword = (_method$password_info = method.password_info) == null ? void 0 : _method$password_info.has_password;
    if (!hasPassword) {
      return CuaPages.SET_PASSWORD;
    }
  }
  return page;
};
var setCuaState = function setCuaState(state) {
  try {
    localStorage.setItem('cua_state', state);
  } catch (e) {
    console.error(e);
  }
};
var getCuaState = function getCuaState() {
  try {
    var state = localStorage.getItem('cua_state');
    return state;
  } catch (e) {
    console.error(e);
    return null;
  }
};
export { getCuaState, getPageByMethod, setCuaState };
