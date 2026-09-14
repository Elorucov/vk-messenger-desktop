import { Ranges } from '@vkontakte-internal/vk-utils';
import { decodeHTMLEntities } from '@vkontakte/vkjs';
import { isParticipantAnonym } from '../../helpers/participant';
export const getVoiceRoomParticipantName = (user) => {
    const isAnonym = Boolean(user?.peerId && isParticipantAnonym(user.peerId));
    const standardName = user?.firstName || user?.name || user?.shortName;
    if (isAnonym) {
        return decodeHTMLEntities(modifiedAnonymName(standardName));
    }
    const name = user?.customName || standardName || '';
    return decodeHTMLEntities(name);
};
function modifiedAnonymName(name) {
    if (!name) {
        return '';
    }
    const [modifiedName] = name.split(' ');
    return modifiedName;
}
export const getVoiceRoomGroupByOwnerId = (groups, ownerId) => {
    return groups?.length && Ranges.isGroupId(ownerId)
        ? groups.find((item) => item.id === Ranges.convertOwnerIdToGroupId(ownerId))
        : undefined;
};
//# sourceMappingURL=helpers.js.map