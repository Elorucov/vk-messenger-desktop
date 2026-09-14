import { HOST_MESSAGE_TYPE } from '../constants/index.js';
import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class i extends l$1{get successDescriptor(){switch(this.params?.type){case "transaction":{return "VKWebAppOpenPayFormResult"}default:return super.successDescriptor}}constructor(...n){super(...n),this.handlerName=MiniAppEvents.ActionDone,this.params=null,this.handle=(n,a)=>{if(a?.type!==HOST_MESSAGE_TYPE){this.controller.sendMessageToHost({message:{params:n,handler:MiniAppEvents.ActionDone}});return}return this.parseHandlerParams(n).then(r=>{this.params=r;if(r.type==="transaction"){return this.handleSuccess(r)}return Promise.reject({error_code:ERROR_CODES.UNKNOWN,error_reason:CommonErrorReasons.unsupportedPlatform()})}).catch(this.handleFailed)},this.parseHandlerParams=r=>{return Promise.resolve(r)};}}

export { i as default };
