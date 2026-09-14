import { PasswordAnimationLevels } from './animation.js';
var _ProgressConfig;
var ProgressConfig = (_ProgressConfig = {}, _ProgressConfig[PasswordAnimationLevels.INITIAL] = {
  strengthLangKey: 'vkconnect_sak_cua_set_password_input_description',
  progress: 0
}, _ProgressConfig[PasswordAnimationLevels.ERROR] = {
  strengthLangKey: null,
  progress: 100
}, _ProgressConfig[PasswordAnimationLevels.WEAK] = {
  strengthLangKey: 'vkconnect_sak_cua_set_password_weak_password_title',
  progress: 33
}, _ProgressConfig[PasswordAnimationLevels.FAIR] = {
  strengthLangKey: 'vkconnect_sak_cua_set_password_fair_password_title',
  progress: 66
}, _ProgressConfig[PasswordAnimationLevels.STRONG] = {
  strengthLangKey: 'vkconnect_sak_cua_set_password_secure_password_title',
  progress: 100
}, _ProgressConfig);
export { ProgressConfig };
