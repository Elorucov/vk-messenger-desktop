import { isParticipantGroup } from './participant';
import { getHostName } from '@vkontakte-internal/calls-core';
/** https://vk.com/video/@657593509/recorded_calls */
export function getVideoRecordsLink(userId, enableCallsRecords = false) {
    const base = `https://${getHostName()}`;
    if (isParticipantGroup(userId)) {
        return base + getCommunityVideoRecordsPath(userId);
    }
    return base + getUserVideoRecordsPath(userId, enableCallsRecords);
}
export function getAsrListLink() {
    return `https://${getHostName()}/calls?section=decoding`;
}
export function openAsrList() {
    if (window.open) {
        window.open(getAsrListLink(), '_blank');
    }
}
function getCommunityVideoRecordsPath(groupId) {
    return `/video/playlist/${groupId}_-8`;
}
function getUserVideoRecordsPath(userId, enableCallsRecords) {
    if (enableCallsRecords) {
        return '/calls?section=records';
    }
    return `/video/@${userId}/recorded_calls`;
}
export function getBroadcastLink(broadcastId, isSferum) {
    if (!broadcastId) {
        return '';
    }
    const [ownerId, videoId, accessKey] = broadcastId.split('_');
    const hostName = getHostName(isSferum);
    if (!ownerId || !videoId) {
        return '';
    }
    let broadcastLink = '';
    if (isSferum) {
        broadcastLink = `https://${hostName}/video/${ownerId}_${videoId}_`;
        if (accessKey) {
            broadcastLink += accessKey;
        }
    }
    else {
        broadcastLink = `https://${hostName}/video${ownerId}_${videoId}`;
        if (accessKey) {
            broadcastLink += `?list=${accessKey}`;
        }
    }
    return broadcastLink;
}
export function getMiniappVmojiEditLink() {
    const hostName = getHostName();
    return `https://${hostName}/app7929683#character_id=avatar`;
}
/**
 * Проверяет что находимся на продакшен лендосе звонков
 */
export function isProductionCallsStandalone() {
    const { hostname } = window.location;
    const regExVkCom = /calls\.vk\.(com|ru)/;
    return regExVkCom.test(hostname);
}
/** проверяет, что находимся на лендинге звонков */
export function isLocationCallsStandalone() {
    const { pathname } = window.location;
    return isProductionCallsStandalone() || pathname.startsWith('/calls-standalone');
}
//# sourceMappingURL=url.js.map