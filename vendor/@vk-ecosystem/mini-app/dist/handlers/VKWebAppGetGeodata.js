import { ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import l$1 from './VKWebAppHandlerBase.js';

class o extends l$1{constructor(...t){super(...t),this.handlerName=MiniAppEvents.GetGeodata,this.timeoutFails=0,this.handle=()=>{return this.getGeoData()},this.getGeoData=()=>{return this.promisifyGetGeodata().then(e=>{return this.handleSuccess({available:true,lat:e.coords.latitude,long:e.coords.longitude})}).catch(this.handleFailed)},this.handleGeodataError=r=>{switch(r.code){case 3:this.timeoutFails++;if(this.timeoutFails<2){return this.getGeoData()}else {return Promise.reject({error_code:ERROR_CODES.CUSTOM,error_reason:"Geolocation timeout error"})}case 2:return Promise.reject({error_code:ERROR_CODES.CUSTOM,error_reason:"Device can't get geodata"});case 1:return Promise.reject({error_code:ERROR_CODES.USER_DENIED,error_reason:"User didn't allowed"});default:return Promise.reject({error_code:ERROR_CODES.CUSTOM,error_reason:"Unknown error"})}},this.promisifyGetGeodata=()=>{return new Promise((e,r)=>navigator.geolocation.getCurrentPosition(e,r)).catch(this.handleGeodataError)};}}

export { o as default };
