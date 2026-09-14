import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import { errorLogger } from '../modules/logger.js';
import l$1 from './VKWebAppHandlerBase.js';

class a extends l$1{confirm(){return new Promise((r,s)=>{this.handleModal({type:"GetEmailConfirmModal",data:{},actions:{onAccept:r,onDeny:()=>s({error_code:ERROR_CODES.ACCESS_DENIED,error_reason:CommonErrorReasons.userDenied()})}});})}constructor(...e){super(...e),this.handlerName=MiniAppEvents.GetEmail,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{const{hostSettings:t}=this.controller.getMiniAppInfo();return (t.permissions?.includes("email")?Promise.resolve(true):this.confirm().then(()=>this.updateModalData({loading:true}))).then(()=>this.controller.setHostPermissions("email",1).catch(errorLogger)).then(()=>this.getEmail(e)).finally(()=>this.updateModalData({shouldClosed:true}))}).catch(this.handleFailed)},this.getEmail=e=>{return this.controller.requestApiMethod("account.getEmail",e).then(({response:e})=>this.handleSuccess(e))};}}

export { a as default };
