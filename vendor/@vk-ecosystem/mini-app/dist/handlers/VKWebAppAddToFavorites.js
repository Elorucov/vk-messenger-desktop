import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class o extends l$1{confirm(){return new Promise((r,s)=>{this.handleModal({type:"AddToFavoritesConfirmModal",data:{},actions:{onAccept:r,onDeny:()=>s({error_code:ERROR_CODES.USER_DENIED,error_reason:CommonErrorReasons.userDenied()})}});})}constructor(...e){super(...e),this.handlerName=MiniAppEvents.AddToFavorites,this.handle=e=>{return this.controller.requestApiMethod("apps.get",{app_id:this.controller.getMiniAppInfo().app.id}).then(t=>{if(t.response.items[0].is_favorite){return this.handleSuccess({result:true})}else {return this.parseHandlerParams(e).then(e=>{return this.confirm().then(()=>this.updateModalData({loading:true})).then(()=>this.addToFavorites(e)).finally(()=>this.updateModalData({shouldClosed:true}))})}}).catch(this.handleFailed)},this.addToFavorites=e=>{return this.controller.requestApiMethod("apps.addToMenu",e).then(()=>this.handleSuccess({result:true}))};}}

export { o as default };
