import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class o extends l$1{constructor(...s){super(...s),this.handlerName=MiniAppEvents.SetLocation,this.handle=r=>{return this.parseHandlerParams(r).then(({location:r})=>this.controller.setLocation(r)).then(()=>this.handleSuccess({result:true})).catch(this.handleFailed)},this.parseHandlerParams=({request_id:t,location:s})=>{if(!s){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("location")})}if(typeof s!=="string"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("location","string")})}return Promise.resolve({request_id:t,location:s})};}}

export { o as default };
