import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import { errorLogger } from '../modules/logger.js';
import l$1 from './VKWebAppHandlerBase.js';

class s extends l$1{confirm(){return new Promise((r,o)=>{this.handleModal({type:"GetPhoneNumberConfirmModal",data:{},actions:{onAccept:r,onDeny:()=>o({error_code:ERROR_CODES.USER_DENIED,error_reason:CommonErrorReasons.userDenied()})}});})}constructor(...e){super(...e),this.handlerName=MiniAppEvents.GetPhoneNumber,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{const{hostSettings:t}=this.controller.getMiniAppInfo();return (t.permissions?.includes("phone_number")?Promise.resolve(true):this.confirm().then(()=>this.updateModalData({loading:true}))).then(()=>this.controller.setHostPermissions("phone_number",1).catch(errorLogger)).then(()=>this.getPhoneNumber(e)).finally(()=>this.updateModalData({shouldClosed:true}))}).catch(this.handleFailed)},this.getPhoneNumber=e=>{return this.controller.requestApiMethod("account.getPhone",e).then(({response:e})=>this.handleSuccess({...e,isValid:true}))};}}

export { s as default };
