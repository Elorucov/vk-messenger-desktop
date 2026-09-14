import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import { MiniAppHandlerError } from '../modules/errors/MiniAppHandlerError.js';
import l$1 from './VKWebAppHandlerBase.js';

class a extends l$1{confirm(){return new Promise((o,r)=>{this.handleModal({type:"AllowNotificationsModal",data:{},actions:{onAccept:o,onDeny:()=>r({error_code:ERROR_CODES.USER_DENIED,error_reason:CommonErrorReasons.userDenied()})}});})}constructor(...s){super(...s),this.handlerName=MiniAppEvents.AllowNotifications,this.handle=t=>{return this.parseHandlerParams(t).then(t=>{return this.checkUserNotificationsEnabled().then(e=>e||this.confirm().then(()=>this.updateModalData({loading:true})).then(()=>this.allowUserNotifications(t)).then(({response:t})=>Boolean(t))).then(this.wrapResult).then(this.handleSuccess).finally(()=>this.updateModalData({shouldClosed:true}))}).catch(this.handleFailed)},this.checkUserNotificationsEnabled=async()=>{const o="are_notifications_enabled,is_trusted";const s=["game","html5_game"];const{response:a}=await this.controller.requestApiMethod("apps.get",{fields:o});const{items:n}=a;const[i]=n;if(!s.includes(i?.type)&&!i?.is_trusted){throw new MiniAppHandlerError({error_code:ERROR_CODES.UNSUPPORTED_PLATFORM,error_reason:CommonErrorReasons.unsupportedPlatform(this.handlerName,"Notifications are not allowed for untrusted apps.")})}return Boolean(i.are_notifications_enabled)},this.allowUserNotifications=t=>{return this.controller.requestApiMethod("apps.allowNotifications",t)};}}

export { a as default };
