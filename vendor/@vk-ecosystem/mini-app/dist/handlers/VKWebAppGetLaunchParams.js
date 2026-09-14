import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class t extends l$1{getSearchParams(e){try{return new URL(e).searchParams}catch{return new URLSearchParams}}constructor(...r){super(...r),this.handlerName=MiniAppEvents.GetLaunchParams,this.handle=()=>{const{id:e,url:r}=this.controller.getMiniAppInfo().app;const t=this.getSearchParams(r);const a={vk_profile_id:"vk_profile_id",vk_group_id:"group_id"};const s={mini_app_id:e,referer:t.get("vk_ref")||"other"};Object.keys(a).forEach(e=>{const r=t.get(e);const n=Number(r);const c=a[e];if(r===null||isNaN(n)){return}s[c]=n;},s);return this.controller.requestApiMethod("apps.getAppLaunchParams",s).then(({response:e})=>this.handleSuccess(e)).catch(this.handleFailed)};}}

export { t as default };
