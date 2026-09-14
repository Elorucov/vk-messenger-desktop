import { ProductionStatEventTypes } from '../../types/stats.js';

class ActionStatCollector{logEvent({event:o,options:e}){const c={...this.productionStatCollector.getBaseEvent(),type:ProductionStatEventTypes.TYPE_ACTION,[ProductionStatEventTypes.TYPE_ACTION]:o};this.productionStatCollector.logEvent({event:c,options:e});}constructor(t){this.productionStatCollector=t;}}

export { ActionStatCollector };
