import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class t extends l$1{constructor(...s){super(...s),this.handlerName=MiniAppEvents.OpenApp,this.handle=s=>{this.controller.sendMessageToHost({message:{params:s,handler:MiniAppEvents.OpenApp}});return this.handleSuccess({result:true})};}}

export { t as default };
