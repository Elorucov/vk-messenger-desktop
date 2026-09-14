import { MiniAppEvents } from '../../constants/events.js';
import l$1 from '../VKWebAppHandlerBase.js';
import { removeAppFromScrollSubscribers } from './ScrollStorage.js';

class e extends l$1{constructor(...r){super(...r),this.handlerName=MiniAppEvents.ScrollTopStop,this.handle=()=>{const{app:{id:o},config:{scrollTarget:r}}=this.controller.getMiniAppInfo();removeAppFromScrollSubscribers(o);return this.handleSuccess({result:true,scrollTop:r.scrollTop.toString()})};}}

export { e as default };
