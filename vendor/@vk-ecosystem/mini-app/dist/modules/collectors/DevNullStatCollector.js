import { CustomStatEventTypes } from '../../types/stats.js';

class DevNullStatCollector{logEvent({event:o,options:e}){const s={...this.customStatCollector.getBaseEvent(),type:CustomStatEventTypes.TYPE_DEV_NULL_ITEM,[CustomStatEventTypes.TYPE_DEV_NULL_ITEM]:o};this.customStatCollector.logEvent({event:s,options:e});}constructor(t){this.customStatCollector=t;}}

export { DevNullStatCollector };
