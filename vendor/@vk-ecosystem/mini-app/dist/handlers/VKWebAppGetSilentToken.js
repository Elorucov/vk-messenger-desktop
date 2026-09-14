import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import { ModalAppearances } from '../types/modalTypes.js';
import l$1 from './VKWebAppHandlerBase.js';

class i extends l$1{confirm(e){return new Promise(r=>{const t=new URLSearchParams({app_id:`${e}`,theme:this.controller.getMiniAppInfo().config.appearance,origin:"*"});this.handleModal({type:"GetSilentTokenOverlay",appearance:ModalAppearances.OVERLAY,data:{url:`${this.controller.getMiniAppInfo().policyConfirmationUrl}?${t}`},actions:{onAccept:t=>{i.successfullyConfirmed[e]=true;r(t);}}});})}constructor(...n){super(...n),this.handlerName=MiniAppEvents.GetSilentToken,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{if(this.controller.getMiniAppInfo().app.needPolicyConfirmation&&!i.successfullyConfirmed[e.app_id]){return this.confirm(e.app_id)}return this.controller.requestApiMethod("auth.getCredentialsForApp",e).then(({response:e})=>e)}).then(e=>this.handleSuccess(e)).catch(this.handleFailed).finally(()=>this.updateModalData({shouldClosed:true}))},this.parseHandlerParams=t=>{if(!t.app_id){t.app_id=t.app_id??this.controller.getMiniAppInfo().app.id;}if(typeof t.app_id!=="number"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("app_id","number")})}if(t.app_id<=0){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.greaterThanZero("app_id")})}return Promise.resolve(t)};}}i.successfullyConfirmed={};

export { i as default };
