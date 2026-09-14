import { BRIDGE_LOG_MAX_LENGTH, BridgeMethodsToLogCallArgumentsDefault } from '../../../constants/stats.js';
import { transformCallArgumentsForLogging } from '../../utils/index.js';
import { ActionProductionStatEventTypes } from '../../../types/stats.js';
import { ActionStatCollector } from '../ActionStatCollector.js';
import { ProductionStatCollector } from '../ProductionStatCollector.js';

class BridgeEventStatsCollector{logEvent({webviewUrl:o,miniAppId:i,event:r,error:l,sessionUuid:c,bridgeLog:n,callArguments:a}){const d=this.bridgeMethodsToLogCallArguments.includes(r.event_type);const m={...r};if(d&&a){m.call_arguments=transformCallArgumentsForLogging(a);}const g={webview_url:o,mini_app_id:i,event:m,error:l,session_uuid:c,bridge_log:n?.slice(0,BRIDGE_LOG_MAX_LENGTH),track_code:this.statsConfig?.data?.trackCode};const _={type:ActionProductionStatEventTypes.TYPE_BRIDGE_EVENT_ITEM,[ActionProductionStatEventTypes.TYPE_BRIDGE_EVENT_ITEM]:g};this.actionStatCollector.logEvent({event:_});}constructor(t,e,s){this.productStatCollector=new ProductionStatCollector(t);this.actionStatCollector=new ActionStatCollector(this.productStatCollector);this.bridgeMethodsToLogCallArguments=e||BridgeMethodsToLogCallArgumentsDefault;this.statsConfig=s;}}

export { BridgeEventStatsCollector };
