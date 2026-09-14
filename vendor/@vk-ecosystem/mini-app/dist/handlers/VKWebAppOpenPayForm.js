import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class r extends l$1{constructor(...s){super(...s),this.handlerName=MiniAppEvents.OpenPayForm,this.handle=s=>{this.controller.sendMessageToHost({message:{params:s,handler:MiniAppEvents.OpenPayForm}});return};}}

export { r as default };
