export const MANAGED_GROUPS_COUNTERS_QUEUE = 'groupeditordialogcounter';
// #region GETTERS
export function getInitialQueueIds(folders, featureFlags) {
    const queueIds = new Set(['onlfriends', 'accountcounters']);
    if (featureFlags.vkm_managed_groups_folder &&
        folders.find((f) => f.type === 'managed_groups')) {
        queueIds.add(MANAGED_GROUPS_COUNTERS_QUEUE);
    }
    return queueIds;
}
// #endregion
// #region SETTERS
export function addQueueId(queueIds, queueId) {
    queueIds.add(queueId);
}
export function deleteQueueId(queueIds, queueId) {
    if (queueIds.has(queueId)) {
        queueIds.delete(queueId);
    }
}
// #endregion
//# sourceMappingURL=Queue.js.map