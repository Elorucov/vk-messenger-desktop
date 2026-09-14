import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class t extends l$1{constructor(...s){super(...s),this.handlerName=MiniAppEvents.CheckBannerAd,this.handle=async()=>{const e=this.adsController.getOpenedBannerAd();if(e){return this.handleSuccess({result:true,...e})}return this.handleSuccess({result:false})};}}

export { t as default };
