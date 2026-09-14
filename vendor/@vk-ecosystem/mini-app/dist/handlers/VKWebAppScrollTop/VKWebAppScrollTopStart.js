import { CommonErrorReasons, ERROR_CODES } from '../../constants/errors.js';
import { MiniAppEvents } from '../../constants/events.js';
import l$1 from '../VKWebAppHandlerBase.js';
import { hasAppInScrollSubscribers, addAppInScrollSubscribers } from './ScrollStorage.js';

class n extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.ScrollTopStart,this.handle=()=>{const{app:{id:e},config:{scrollTarget:t}}=this.controller.getMiniAppInfo();if(hasAppInScrollSubscribers(e)){return this.handleFailed({error_code:ERROR_CODES.CUSTOM,error_reason:CommonErrorReasons.scrollSubscriberAlreadyExist()})}addAppInScrollSubscribers(e);return this.handleSuccess({result:true,scrollTop:t.scrollTop.toString()})};}}

export { n as default };
