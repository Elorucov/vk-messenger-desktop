import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class s extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.GetConfig,this.handle=()=>{return this.handleSuccess(this.controller.getMiniAppConfig())};}}

export { s as default };
