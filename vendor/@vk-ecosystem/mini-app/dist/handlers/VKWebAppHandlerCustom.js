import { CommonErrorReasons, ERROR_CODES } from '../constants/errors.js';
import l$1 from './VKWebAppHandlerBase.js';
import { isDryRunOverrideHandler, getDryRunOptions } from '../modules/utils/index.js';

class s extends l$1{get floodRate(){return this.overrideHandler.floodRate??super.floodRate}get isDryRunAllowed(){return isDryRunOverrideHandler(this.overrideHandler.supported)}async handleDryRun(e,r){const{modalRequested:t,supported:a}=r;if(t){await new Promise(r=>{this.handleModal({type:"SkipActionModal",data:{handlerName:this.handlerName,params:e},actions:{onClose:r}});}).finally(()=>this.updateModalData({shouldClosed:true}));}const{dryRunResponse:s,dryRunError:l}=getDryRunOptions(a)||{};if(l){return this.handleFailed(l)}return this.handleSuccess(s||this.wrapResult(true))}constructor(t,a,d,s){super(t),this.handle=t=>{if(this.overrideHandler.supported===false||!this.overrideHandler.handle){return this.handleFailed({error_code:ERROR_CODES.UNKNOWN,error_reason:CommonErrorReasons.unsupportedPlatform()})}if(this.isDryRunAllowed){return this.handleDryRun(t,this.overrideHandler)}return this.overrideHandler.handle(t,this.defaultHandler?.handle)};this.overrideHandler=d;this.defaultHandler=s;this.handlerName=a;}}

export { s as default };
