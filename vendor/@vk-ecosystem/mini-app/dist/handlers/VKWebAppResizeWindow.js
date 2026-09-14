import { AppIDsWithNarrowMinWidth, AppIDsWithNarrowMinHeight } from '../constants/appIDs.js';
import { ERROR_CODES, CommonErrorReasons } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

const o=630;const a=400;const h=1e3;const m=500;const c=400;const d=1e4;class p extends l$1{get minWidth(){const r=this.controller.getMiniAppInfo().app.id;if(AppIDsWithNarrowMinWidth.includes(r)){return a}return o}get minHeight(){const e=this.controller.getMiniAppInfo().app.id;if(AppIDsWithNarrowMinHeight.includes(e)){return c}return m}constructor(...e){super(...e),this.handlerName=MiniAppEvents.ResizeWindow,this.handle=e=>{return this.parseHandlerParams(e).then(e=>{this.controller.resizeWindow(e.width,e.height);return this.handleSuccess(e)}).catch(this.handleFailed)},this.parseHandlerParams=({width:e,height:r})=>{if(!e&&!r){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:'Missing required param "width" or "height"'})}if(e&&typeof e!=="number"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.invalidParam("width","number")})}if(r&&typeof r!=="number"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.invalidParam("height","number")})}return Promise.resolve({width:e&&Math.max(this.minWidth,Math.min(e,h)),height:r&&Math.max(this.minHeight,Math.min(r,d))})};}}

export { p as default };
