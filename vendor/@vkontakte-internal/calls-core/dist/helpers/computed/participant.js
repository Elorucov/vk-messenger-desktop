import { escape } from '@vkontakte/vkjs';
import { computeUserShortName, isParticipantAnonymOrContact, isParticipantGroup, vkIdToPeerId, } from '../simple';
const getProfileProp = (profile, prop) => {
    return prop in profile ? profile[prop] : undefined;
};
export function normalizeUser(profile) {
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
        shortName: computeUserShortName(firstName, lastName, name),
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
}
//# sourceMappingURL=participant.js.map