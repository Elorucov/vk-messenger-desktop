import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class a extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.CreateHash,this.handle=e=>{return this.parseHandlerParams(e).then(({payload:e})=>{return this.controller.requestApiMethod("apps.getSecretHash",{request_id:e})}).then(({response:e})=>{const r={sign:e.sign,ts:e.ts};if(e.edu_sign){r.edu_sign=e.edu_sign;}if(e.request_id){r.payload=e.request_id;}return this.handleSuccess(r)}).catch(this.handleFailed)},this.parseHandlerParams=s=>{if(s.hasOwnProperty("payload")&&typeof s.payload!=="string"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("payload","string")})}return Promise.resolve(s)};}}

export { a as default };
