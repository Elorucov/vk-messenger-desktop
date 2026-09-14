import { PACKAGE_VERSION, VK_PLATFORM } from '../constants/index.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class n extends l$1{constructor(...r){super(...r),this.handlerName=MiniAppEvents.GetClientVersion,this.handle=()=>{return this.handleSuccess({platform:VK_PLATFORM,version:PACKAGE_VERSION})};}}

export { n as default };
