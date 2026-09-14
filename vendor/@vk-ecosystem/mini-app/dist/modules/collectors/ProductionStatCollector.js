import { MAX_INT32 } from '../../constants/stats.js';
import { errorLogger } from '../logger.js';

class ProductionStatCollector{getCurrentTime(){return Date.now().toString(10)+"000"}getIntId(){return Math.floor(Math.random()*MAX_INT32)}logEvent({event:t,options:o}){if(!t.type||!t[t.type]){errorLogger("ProductionStatCollector: invalid event.",t);return}if(!this.sendStatEvent){errorLogger("ProductionStatCollector: sendStatEvent not provided.");return}this.sendStatEvent("saveProductionStats","productionStats",t,o);this.lastEvent=t;}getBaseEvent(t){return {id:this.getIntId(),prev_id:this.lastEvent?.id,timestamp:this.getCurrentTime(),url:window.location.href,screen:t}}constructor(t){this.lastEvent=null;this.sendStatEvent=t;}}ProductionStatCollector.MAX_INT32=0x7fffffff;

export { ProductionStatCollector };
