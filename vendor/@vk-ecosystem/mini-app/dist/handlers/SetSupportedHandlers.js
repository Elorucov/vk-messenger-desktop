import { INTERNAL_MINIAPP_EVENTS, MiniAppEvents, MODAL_EVENTS } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class d extends l$1{get successDescriptor(){return this.handlerName}getSupportedHandlersList(){const r=new Set(INTERNAL_MINIAPP_EVENTS);const d=this.controller.getOverrideHandlers();const a=Object.keys(d).filter(e=>d[e].supported!==false);Object.values(MiniAppEvents).forEach(e=>{if((this.controller.modalRequest||!(this.controller.modalRequest||MODAL_EVENTS.includes(e)))&&!a.includes(e)&&!r.has(e)&&(!d.hasOwnProperty(e)||d[e].supported!==false)){a.push(e);}});return a}constructor(...t){super(...t),this.handlerName=MiniAppEvents.SetSupportedHandlers,this.handle=()=>{if(!d.cachedSupportedHandlers){d.cachedSupportedHandlers=this.getSupportedHandlersList();}return this.handleSuccess({supportedHandlers:d.cachedSupportedHandlers})};}}

export { d as default };
