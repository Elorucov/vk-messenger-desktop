import { getHostName } from '@vkontakte-internal/calls-core';
const getVideoHash = (player) => {
    if (player) {
        const regex = /&hash=([^&]+)/;
        const match = regex.exec(player);
        return match ? match[1] : '';
    }
    return '';
};
export const getBroadcastVideoLink = (videoItem, sferum) => {
    const { owner_id = 0, id = 0, access_key, player } = videoItem;
    if (sferum) {
        return `https://${getHostName(sferum, true)}?modal=video${owner_id}_${id}_${getVideoHash(player)}&sferum=true`;
    }
    return `https://${getHostName(sferum)}/video${owner_id}_${id}${access_key ? `?list=${access_key}` : ''}`;
};
//# sourceMappingURL=getBroadcastVideoLink.js.map