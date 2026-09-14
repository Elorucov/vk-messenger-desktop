import { BenchmarkStatEventTypes } from '../../../types/stats.js';
import { BenchmarkStatCollector } from '../BenchmarkStatCollector.js';

class MiniAppPerformanceCollector{logEvent({event:e,callback:o}){const r={...this.benchmarkMainStatCollector.getBaseEvent(),type:BenchmarkStatEventTypes.MINI_APPS_PERFORMANCE,[BenchmarkStatEventTypes.MINI_APPS_PERFORMANCE]:e};this.benchmarkMainStatCollector.logEvent({event:r});o?.();}constructor(t){this.benchmarkMainStatCollector=new BenchmarkStatCollector(t);}}

export { MiniAppPerformanceCollector };
