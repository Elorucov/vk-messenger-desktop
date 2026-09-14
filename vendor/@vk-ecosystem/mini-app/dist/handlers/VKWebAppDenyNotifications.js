import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class s extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.DenyNotifications,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{return this.controller.requestApiMethod("apps.denyNotifications",e).then(({response:e})=>this.wrapResult(Boolean(e))).then(this.handleSuccess)}).catch(this.handleFailed)};}}

export { s as default };
