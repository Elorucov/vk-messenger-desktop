import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class r extends l$1{constructor(...s){super(...s),this.handlerName=MiniAppEvents.HideBannerAd,this.handle=async()=>{const e=this.adsController.hideBannerAd();if(e){return this.handleSuccess({result:true,...e})}return this.handleSuccess({result:false})};}}

export { r as default };
