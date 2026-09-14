import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import { MiniAppEvents } from '../constants/events.js';
import { FeatureEnabledKeys } from '../constants/featureToggles.js';
import { Scopes } from '../constants/scopes.js';
import l$1 from './VKWebAppHandlerBase.js';
import { validateScopes } from '../modules/utils/index.js';

class i extends l$1{constructor(...n){super(...n),this.handlerName=MiniAppEvents.CheckAllowedScopes,this.handle=e=>{return this.parseHandlerParams(e).then(e=>this.controller.requestApiMethod("apps.checkAllowedScopes",e)).then(({response:e})=>this.handleSuccess({result:e})).catch(this.handleFailed)},this.parseHandlerParams=({scopes:o})=>{if(!o){return Promise.reject({error_code:ERROR_CODES.MISSING_PARAM,error_reason:CommonErrorReasons.missingParam("scopes")})}if(typeof o!=="string"){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.wrongType("scopes","string")})}const{whiteListScopes:n=Scopes}=this.controller.getMiniAppInfo();const i=this.controller.featureEnabled(FeatureEnabledKeys.CheckAllowedScopesNoValidation)?true:validateScopes(o,n);if(!i){return Promise.reject({error_code:ERROR_CODES.INVALID_PARAMS,error_reason:CommonErrorReasons.invalidParam("scopes",`"${n.join('", "')}"`)})}return Promise.resolve({scopes:o})};}}

export { i as default };
