class FloodControlService{checkFloodExceeded(e,t){if(!t){return false}const s=this.getQueue(e);this.cleanupOldEntries(s,Date.now(),t.timeFrameMs);return s.timestamps.length>=t.eventsCount}registerEvent(e,t){if(!t)return;const s=this.getQueue(e);s.timestamps.push(Date.now());}cleanupOldEntries(e,t,s){const u=t-s;e.timestamps=e.timestamps.filter(e=>e>u);}getQueue(e){let t=this.queues.get(e);if(!t){t={timestamps:[]};this.queues.set(e,t);}return t}constructor(){this.queues=new Map;}}

export { FloodControlService };
