import { UserRole } from '@vkontakte/calls-sdk';
import { decodeHTMLEntities } from '@vkontakte/vkjs';
import { EMPTY_PEER_ID, EMPTY_USER_ID } from '../../constants';
import { Ranges } from '@vkontakte-internal/shared';
export const isParticipantUnavailableToCallFromGroup = (peerId, callMembers) => {
    if (!callMembers.unableToCallGroupMembersIds) {
        return false;
    }
    return callMembers.unableToCallGroupMembersIds.includes(peerId);
};
/**
 * Проверяет, является ли пользователь администратором звонка
 */
export function isAdmin(participant) {
    if (!participant?.roles) {
        return false;
    }
    return participant.roles.some((role) => role === UserRole.ADMIN);
}
/**
 * Проверяет, является ли пользователь создателем звонка
 */
export function isCreator(participant) {
    if (!participant?.roles) {
        return false;
    }
    return participant.roles.some((role) => role === UserRole.CREATOR);
}
export function participantIsAdmin(participant) {
    return isAdmin(participant) || isCreator(participant);
}
export function isParticipantAnonym(externalId) {
    return Ranges.isAnonymousCallPeerId(getVkId(externalId));
}
export const isChatOrChannel = (id) => {
    return Ranges.isChatOrChannelPeer(getVkId(id));
};
export function isParticipantAnonymOrContact(externalId) {
    return isParticipantAnonym(externalId) || isParticipantContact(externalId);
}
// Relates tov CONTACT_PATTERN in www/VK/Messages/Domain/Calls/CallParticipant.php
const CONTACT_ID_PATTERN = /^c\d+_\d+$/;
export function isIPeerId(candidate) {
    return typeof candidate === 'string';
}
export function isParticipantContact(externalId) {
    // if numeric externalId provided it can not be id of contact
    const id = typeof externalId === 'object' ? externalId.id : isIPeerId(externalId) ? externalId : '';
    return CONTACT_ID_PATTERN.test(id);
}
export const isMessagesContact = (profile) => {
    return (typeof profile.calls_id === 'string' &&
        CONTACT_ID_PATTERN.test(profile.calls_id) &&
        typeof profile.name === 'string');
};
export function vkIdToPeerId(vkId) {
    return vkId === EMPTY_USER_ID ? EMPTY_PEER_ID : String(vkId);
}
export function peerIdToVkId(peerId) {
    return isParticipantContact(peerId) ? EMPTY_USER_ID : Number(peerId);
}
export const isEmptyPeerId = (peerId) => {
    return peerId === EMPTY_PEER_ID;
};
function getVkId(identity) {
    return typeof identity === 'object'
        ? peerIdToVkId(identity.id)
        : isIPeerId(identity)
            ? peerIdToVkId(identity)
            : identity;
}
export function isParticipantGroup(id) {
    return Ranges.isGroupId(getVkId(id));
}
export function getUserName(user) {
    const name = user?.customName || user?.name || user?.shortName || '';
    return decodeHTMLEntities(name);
}
export function mergeGroupToParticipant(member, participant) {
    let participantNew = { ...participant };
    if (member.photo) {
        participantNew.photo = member.photo;
    }
    if (member.name) {
        participantNew.name = member.name;
    }
    if (member.link) {
        participantNew.link = member.link;
    }
    return participantNew;
}
/**
 * Used only to calculate colors
 */
export function extractContactId(peerId) {
    const [, contactId] = peerId.split('_');
    return contactId ? Number(contactId) : 0;
}
export function getSingleLetter(name) {
    return name.length ? name[0] : '';
}
export function getIdForColorCalculation(peerId) {
    return isParticipantContact(peerId) ? extractContactId(peerId) : Math.abs(peerIdToVkId(peerId));
}
export function computeUserShortName(first, last, name) {
    if (first) {
        const visibleLast = last ? (last.length > 2 ? last.substring(0, 1) + '.' : last) : '';
        return visibleLast ? `${first} ${visibleLast}` : first;
    }
    return name ?? '';
}
export const normalizeContact = (contact) => {
    const { user_id: vkUserId, calls_id: callsPeerId, name, local_name } = contact;
    const fullName = local_name ?? name;
    return {
        animated_avatar: vkUserId ? contact.animated_avatar : undefined,
        id: vkUserId ?? EMPTY_USER_ID,
        firstName: fullName,
        name: fullName,
        peerId: vkUserId ? vkIdToPeerId(vkUserId) : callsPeerId ?? EMPTY_PEER_ID,
        photo: vkUserId ? contact.photo_50 : undefined,
        shortName: fullName,
    };
};
//# sourceMappingURL=participant.js.map