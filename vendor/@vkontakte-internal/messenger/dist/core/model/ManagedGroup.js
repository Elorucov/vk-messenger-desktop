import { isDev } from '../utils/misc';
export function resolveId(id) {
    if (Number.isNaN(id)) {
        id = 0;
    }
    if (!id || id < 0) {
        return 0;
    }
    return id;
}
// #region GETTERS
export function isUnread(managedGroup) {
    return managedGroup.unreadCount > 0;
}
export function getUnreadTotalCount(managedGroups) {
    return Array.from(managedGroups.values()).reduce((sum, group) => sum + group.unreadCount, 0);
}
export function getManagedGroupById(cache, id) {
    const managedGroup = cache.get(id);
    if (!managedGroup && isDev) {
        throw new Error('Группа отсутствует в кэше');
    }
    return managedGroup;
}
// #endregion
// #region SETTERS
export function setUnreadCount(cache, id, unreadCount) {
    const managedGroup = cache.get(id);
    if (!managedGroup) {
        throw new Error('Группа отсутствует в кэше');
    }
    managedGroup.unreadCount = unreadCount;
}
export function setMuted(cache, id, isMuted) {
    const managedGroup = cache.get(id);
    if (!managedGroup) {
        throw new Error('Группа отсутствует в кэше');
    }
    managedGroup.isMuted = isMuted;
}
// #endregion
//# sourceMappingURL=ManagedGroup.js.map