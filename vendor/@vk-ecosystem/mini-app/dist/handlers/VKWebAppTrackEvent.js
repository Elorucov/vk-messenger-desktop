import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';
import { isStrictObject } from '../modules/utils/index.js';
import { cleanUndefinedFields } from '../modules/utils/cleanUndefinedFields.js';
import { MyTrackerMiniAppEvents } from '../services/MyTrackerService/constants.js';

class i extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.TrackEvent,this.handle=r=>{return this.parseHandlerParams(r).then(this.transformParams).then(r=>this.controller.trackMyTrackerEvent?.(MyTrackerMiniAppEvents.CUSTOM,r)).then(()=>this.handleSuccess(this.wrapResult(true))).catch(this.handleFailed)},this.transformParams=({event_name:r,custom_user_id:e,event_params:s})=>{return Promise.resolve(cleanUndefinedFields({eventName:r,customUserId:e,eventParams:s}))},this.parseHandlerParams=({event_name:s,custom_user_id:t,request_id:n,event_params:a})=>{if(!s){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("event_name")})}if(typeof s!=="string"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("event_name","string")})}if(t&&typeof t!=="string"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("custom_user_id","string")})}if(a&&!isStrictObject(a)){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("event_params","object")})}return Promise.resolve({event_name:s,custom_user_id:t,request_id:n,event_params:a})};}}

export { i as default };
