import { extractContactId, EMPTY_USER_ID, EMPTY_PEER_ID, peerIdToVkId, vkIdToPeerId, isParticipantContact, } from '@vkontakte-internal/calls-core';
import { fetchUserShortName } from './helpers';
import { decodeHTMLEntities, escape } from '@vkontakte/vkjs';
import { getSingleLetter, isParticipantAnonymOrContact, isParticipantGroup } from './participant';
import { ExternalIdType } from '@vkontakte/calls-sdk';
export const getIdForColorCalculation = (peerId) => {
    return isParticipantContact(peerId) ? extractContactId(peerId) : Math.abs(peerIdToVkId(peerId));
};
const getProfileProp = (profile, prop) => {
    return prop in profile ? profile[prop] : undefined;
};
export const normalizeUser = (profile) => {
    // common props for possible profile type
    const { id, photo_50: photo50, photo_100: photo100, photo_400: photo400, photo_200: photo } = profile;
    const customNames = getProfileProp(profile, 'custom_names_for_calls');
    let firstName = getProfileProp(profile, 'first_name');
    let lastName = getProfileProp(profile, 'last_name');
    const name = getProfileProp(profile, 'name');
    const screenName = getProfileProp(profile, 'screen_name');
    firstName = firstName ?? name ?? '';
    lastName = lastName ?? '';
    if (isParticipantGroup(id)) {
        firstName = escape(firstName);
    }
    const sep = firstName && lastName ? ' ' : '';
    const fullName = name || `${firstName}${sep}${lastName}`;
    let link;
    if (screenName) {
        link = `/${screenName}`;
    }
    else if (!isParticipantAnonymOrContact(id) && !isParticipantGroup(id)) {
        link = `/id${id}`;
    }
    const result = {
        canCall: getProfileProp(profile, 'can_call'),
        firstName,
        id,
        is_nft: getProfileProp(profile, 'is_nft'),
        lastName,
        link,
        name: fullName,
        photo: photo400 || photo || photo100 || photo50,
        photo_100: photo100,
        peerId: vkIdToPeerId(id),
        sex: getProfileProp(profile, 'sex'),
        shortName: fetchUserShortName(firstName, lastName, name),
    };
    const animatedAvatar = getProfileProp(profile, 'animated_avatar');
    // explicit setting of undefined as property value can cause errors in VkIndexer during comparison
    if (animatedAvatar) {
        result.animated_avatar = animatedAvatar;
    }
    const onlineInfo = getProfileProp(profile, 'online_info');
    if (onlineInfo) {
        result.onlineInfo = onlineInfo;
    }
    if (customNames?.[0]?.name) {
        result.customName = customNames[0].name;
    }
    return result;
};
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
export const normalizeGroup = ({ id, name, screen_name: screenName, photo_400: photo400, photo_200: photo200, photo_100: photo100, }) => ({
    id: -id,
    peerId: vkIdToPeerId(-id),
    name: escape(name ?? ''),
    firstName: '',
    lastName: '',
    shortName: '',
    link: screenName && `/${screenName}`,
    photo: photo400 || photo200 || photo100,
    photo_100: photo100,
});
const mapProfiles = (profiles) => {
    const result = {};
    if (!profiles) {
        return result;
    }
    for (const profile of profiles) {
        result[profile.id] = profile;
    }
    return result;
};
/**
 * мапает участников звонка, по ключу `items`
 * (который исключает присутствие удаленных пользователей)
 */
export const mapAndNormalizeChatMembers = (data) => {
    const profilesMap = mapProfiles(data.profiles);
    const result = [];
    for (const member of data.items) {
        const profile = profilesMap[member.member_id];
        if (profile) {
            result.push(normalizeUser(profile));
        }
    }
    return result;
};
export function createFriendsCache(friends) {
    return friends.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {});
}
export function getExternalIdByUserId(userId) {
    let type = ExternalIdType.USER;
    if (isParticipantGroup(userId)) {
        type = ExternalIdType.GROUP;
    }
    return {
        id: userId.toString(),
        type: type,
    };
}
export function getMemberForUserStack(member) {
    const name = member.name || '';
    if (!member.photo) {
        return {
            id: getIdForColorCalculation(member.peerId),
            text: getSingleLetter(name),
            key: member.peerId,
        };
    }
    return {
        src: member.photo,
        alt: name,
        key: member.peerId,
    };
}
export const getUserName = (user) => {
    const name = user?.customName || user?.name || user?.shortName || '';
    return decodeHTMLEntities(name);
};
export const getUserShortName = (user) => {
    const name = user?.customName || user?.shortName || user?.name || '';
    return decodeHTMLEntities(name);
};
export const mapExternalIdsToPeerIds = (ids) => ids.map((externalId) => externalId.id);
//# sourceMappingURL=user.js.map