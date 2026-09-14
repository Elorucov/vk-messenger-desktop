import './../deps/@vkontakte/vkjs/lib/es6/device/IOSDetections.js';
import './../deps/@vkontakte/vkjs/lib/es6/device/InputUtils.js';
import './../deps/@vkontakte/vkjs/lib/es6/html/escape.js';
import { copyTextToClipboard } from './../deps/@vkontakte/vkjs/lib/es6/other/clipboard.js';
import './../deps/@vkontakte/vkjs/lib/es6/other/detections.js';
import './../deps/@vkontakte/vkjs/lib/es6/other/storage.js';
import './../deps/@vkontakte/vkjs/lib/es6/text/transliteration.js';
import { ERROR_CODES, CommonErrorReasons } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class n extends l$1{constructor(...o){super(...o),this.handlerName=MiniAppEvents.CopyText,this.handle=r=>{return this.parseHandlerParams(r).then(r=>{return copyTextToClipboard(r.text).then(e=>{if(e){return {result:true}}return Promise.reject({error_code:ERROR_CODES.CUSTOM,error_reason:"Can’t copy text on this device"})}).then(this.handleSuccess)}).catch(this.handleFailed)},this.parseHandlerParams=e=>{if(!e.text){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("text")})}else if(typeof e.text!=="string"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("text","string")})}return Promise.resolve({request_id:e.request_id,text:e.text})};}}

export { n as default };
