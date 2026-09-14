import { getHostName } from '@vkontakte-internal/calls-core';
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
//# sourceMappingURL=getBroadcastLink.js.map