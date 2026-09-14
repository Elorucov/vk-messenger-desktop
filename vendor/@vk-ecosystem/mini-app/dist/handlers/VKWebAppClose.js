import { CLOSE_STATUS } from '../constants/index.js';
import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class a extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.Close,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{this.controller.sendMessageToHost({message:{params:e,handler:MiniAppEvents.Close}});return this.handleSuccess(e)}).catch(this.handleFailed)},this.parseHandlerParams=o=>{const{status:t,payload:a}=o;if(t===undefined){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("status")})}const n=r=>CLOSE_STATUS.includes(r);if(!n(t)){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.invalidParam("status",'"success" or "failed"')})}const i={status:t};if(a!==undefined){if(typeof a!=="object"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.invalidParam("payload","object")})}i.payload=a;}return Promise.resolve(i)};}}

export { a as default };
