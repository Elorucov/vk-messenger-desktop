import { MiniAppEvents } from '../../constants/events.js';
import l$1 from '../VKWebAppHandlerBase.js';

class s extends l$1{constructor(...e){super(...e),this.handlerName=MiniAppEvents.ScrollTop,this.handle=()=>{const{scrollTarget:o}=this.controller.getMiniAppInfo().config;return this.handleSuccess({scrollTop:o.scrollTop})};}}

export { s as default };
