import { formatDuration } from '@vkontakte/vkjs';
import * as Peer from '../../core/model/Peer';
export function getVideoDuration(duration, isExternal) {
    if (duration === undefined) {
        return '';
    }
    /**
     * Если видео из ВК
     * или
     * если видео внешнее и у него есть продолжительность
     */
    if (!isExternal || (isExternal && duration)) {
        return formatDuration(duration);
    }
    return '';
}
export function getVideoAuthorLink(domain, type, author) {
    return `https://${domain}/${type === 'short_video' ? 'clips/' : 'video/@'}${Peer.linkVideo(author)}`;
}
//# sourceMappingURL=attach.js.map