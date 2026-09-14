import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class o extends l$1{constructor(...s){super(...s),this.handlerName=MiniAppEvents.StorageGetKeys,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{return this.controller.requestApiMethod("storage.getKeys",e).then(({response:e})=>this.handleSuccess({keys:e}))}).catch(this.handleFailed)},this.parseHandlerParams=t=>{if(typeof t.count!=="number"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("count","number")})}else if(typeof t.offset!=="number"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("offset","number")})}return Promise.resolve({request_id:t.request_id,count:t.count,offset:t.offset})};}}

export { o as default };
