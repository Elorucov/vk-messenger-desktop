import { ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import { PendingTask } from '../helpers/PendingTask.js';
import { errorLogger } from '../modules/logger.js';
import { makeParams } from '../modules/utils/index.js';
import l$1 from './VKWebAppHandlerBase.js';

class c extends l$1{constructor(...n){super(...n),this.handlerName=MiniAppEvents.AppForceLogout,this.handle=()=>{const t=this.controller.getMiniAppInfo().logoutHash;const o=this.controller.getMiniAppConfig().app_id;return this.logout({hash:t,app_id:o}).then(t=>{this.controller.sendMessageToHost({message:{handler:MiniAppEvents.AppForceLogout,params:t}});return this.handleSuccess({result:true})}).catch(this.handleFailed)},this.logout=e=>{const n=this.controller.getMiniAppInfo().loginUrl;const c={act:"connect_logout",hash:e.hash,app_id:e.app_id};Object.assign({},c,e.captchaResult);if(!e.hash){return Promise.reject({error_code:ERROR_CODES.UNKNOWN})}const i=new PendingTask;const a=e=>{const o=makeParams(e);fetch(`${n}/?${o}`,{mode:"cors",credentials:"include"}).then(t=>t.json()).then(e=>{if(e.type==="okay"){i.resolve(e);return}if(e.error?.error_code===ERROR_CODES.CAPTCHA_ERROR){const t=this.controller.getMiniAppInfo().onCaptcha;if(!t){i.reject({type:"error",error:"onCaptcha function is missing"});return}const{captcha_sid:o,captcha_img:r}=e.error;void t({captcha_sid:o,captcha_img:r}).then(t=>{const e=Object.assign({},c,t);a(e);});return}i.reject(e);}).catch(()=>errorLogger("Can't logout"));};a(c);return i.get()};}}

export { c as default };
