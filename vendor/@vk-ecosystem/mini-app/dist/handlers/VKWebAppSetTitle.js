import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class a extends l$1{constructor(...s){super(...s),this.handlerName=MiniAppEvents.SetTitle,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{this.controller.sendMessageToHost({message:{params:e,handler:MiniAppEvents.SetTitle}});return this.handleSuccess({result:true})}).catch(this.handleFailed)},this.parseHandlerParams=t=>{if(!t.title){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("title")})}return Promise.resolve({title:`${this.controller.getMiniAppInfo().app.title} — ${t.title}`})};}}

export { a as default };
