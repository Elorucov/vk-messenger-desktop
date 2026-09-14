import { infoLogger, errorLogger } from './logger.js';

const BRIDGE_MESSAGE_TYPE="vk-connect";class t{isValidEvent(e){const{isValidEvent:s}=this.config;if(s){return s(e)}return e.data?.type===BRIDGE_MESSAGE_TYPE&&this.config.iframe?.contentWindow===e.source}constructor(t){this.destroy=()=>{window.removeEventListener("message",this.handleMessage);};this.sendMessage=e=>{if(!this.config.iframe){throw new Error("No iframe passed for bridge!")}const{originMessage:t,message:i}=e;if(t?.params&&t.params.request_id){i.data.request_id=t.params.request_id;}infoLogger("send to app",e.message);const a=this.config.iframe?.contentWindow;a?.postMessage(i,"*");};this.handleMessage=t=>{if(!this.isValidEvent(t)){return}infoLogger("received from app",t.data);this.config.handler(t.data)?.catch(errorLogger);};this.config=t;window.addEventListener("message",this.handleMessage);}}

export { BRIDGE_MESSAGE_TYPE, t as default };
