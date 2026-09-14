import { MiniAppEvents, EventsToMiniApp } from '../../constants/events.js';
import { hasAppInInitializedApps, addAppInInitializedApps } from './AppInitStorage.js';
import { BRIDGE_MESSAGE_TYPE } from '../../modules/bridge.js';
import l$1 from '../VKWebAppHandlerBase.js';

class o extends l$1{getHandleSuccess(e){addAppInInitializedApps(e);return this.handleSuccess({result:true})}constructor(...s){super(...s),this.handlerName=MiniAppEvents.Init,this.handle=()=>{const{app:{id:e}}=this.controller.getMiniAppInfo();if(hasAppInInitializedApps(e)){return this.handleSuccess({result:false})}this.updateConfig();const t=this.sendSupportedHandlers();if(t){return t.then(()=>this.getHandleSuccess(e)).catch(this.handleFailed)}else {return this.getHandleSuccess(e)}},this.sendSupportedHandlers=()=>{return this.controller.invoke({params:{},handler:MiniAppEvents.SetSupportedHandlers,type:BRIDGE_MESSAGE_TYPE})},this.updateConfig=()=>{this.controller.sendEventToMiniApp(EventsToMiniApp.UpdateConfig,this.controller.getMiniAppConfig());};}}

export { o as default };
