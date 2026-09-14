import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class a extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.Translate,this.handle=r=>{return this.parseHandlerParams(r).then(({texts:r,translation_language:e})=>this.controller.requestApiMethod("translations.translate",{translation_language:e,texts:r.join(",")})).then(({response:r})=>this.handleSuccess({result:r})).catch(this.handleFailed)},this.parseHandlerParams=({request_id:s,texts:t,translation_language:a})=>{if(!t){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("texts")})}else if(!Array.isArray(t)){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("texts","array")})}if(!a){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("translation_language")})}else if(typeof a!=="string"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("translation_language","string")})}return Promise.resolve({request_id:s,texts:t,translation_language:a})};}}

export { a as default };
