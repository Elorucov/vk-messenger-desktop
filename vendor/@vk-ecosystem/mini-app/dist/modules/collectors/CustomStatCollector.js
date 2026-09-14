import { MAX_INT32 } from '../../constants/stats.js';
import { errorLogger } from '../logger.js';

class CustomStatCollector{getCurrentTime(){return Date.now().toString(10)+"000"}getIntId(){return Math.floor(Math.random()*MAX_INT32)}getBaseEvent(){return {id:this.getIntId(),timestamp:this.getCurrentTime()}}logEvent({event:t,options:o}){if(!t.type||!t[t.type]){errorLogger("CustomStatCollector: invalid event.",t);return}if(!this.sendStatEvent){errorLogger("CustomStatCollector: sendStatEvent not provided.");return}this.sendStatEvent("saveCustomStats","customStats",t,o);}constructor(t){this.sendStatEvent=t;}}

export { CustomStatCollector };
