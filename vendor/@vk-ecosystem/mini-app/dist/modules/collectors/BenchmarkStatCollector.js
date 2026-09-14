import { MAX_INT32 } from '../../constants/stats.js';
import { errorLogger } from '../logger.js';

class BenchmarkStatCollector{logEvent({event:t}){if(!t.type||!t[t.type]){errorLogger("BenchmarkMainStatCollector: invalid event.",t);return}this.sendStatEvent("saveBenchmarkMainStats","benchmarkMainStats",t);}getBaseEvent(){return {id:this.getIntId(),timestamp:this.getCurrentTime()}}getIntId(){return Math.floor(Math.random()*MAX_INT32)}getCurrentTime(){return (Date.now()*1e3).toString(10)}constructor(t){this.sendStatEvent=t;}}

export { BenchmarkStatCollector };
