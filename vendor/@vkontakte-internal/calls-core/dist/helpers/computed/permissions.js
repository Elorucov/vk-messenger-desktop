import { MediaOption, MuteState } from '@vkontakte/calls-sdk';
import { participantIsAdmin, isParticipantAnonymOrContact } from '../simple';
/**
 * проверяет, можно ли включить медиа устройство
 */
export const isMediaAllowed = (key, { device, me: myPeerId, participants, permissions: callPermissions, }, ignorePermissionsOnce) => {
    const isMe = !('externalId' in device);
    const participant = isMe ? device : participants[device.externalId.id];
    // если я создатель или админ - на меня не действуют ограничения
    if (participantIsAdmin(participant)) {
        return true;
    }
    const myPermissions = device.permissions;
    const permissionsOnce = device.permissionsOnce;
    let mediaOption;
    switch (key) {
        case 'audio':
            mediaOption = MediaOption.AUDIO;
            break;
        case 'video':
            mediaOption = MediaOption.VIDEO;
            break;
        case 'screenSharing':
            mediaOption = MediaOption.SCREEN_SHARING;
            break;
        case 'movieSharing':
            mediaOption = MediaOption.MOVIE_SHARING;
            break;
        case 'audioSharing':
            mediaOption = MediaOption.AUDIO_SHARING;
            break;
        case 'animoji':
            mediaOption = MediaOption.ANIMOJI;
            break;
    }
    if (mediaOption === MediaOption.MOVIE_SHARING) {
        return (!isParticipantAnonymOrContact(isMe ? myPeerId : device.externalId.id) &&
            myPermissions?.movieSharing !== MuteState.MUTE_PERMANENT);
    }
    if (myPermissions?.[key] === MuteState.MUTE) {
        return true;
    }
    if (callPermissions[mediaOption] === MuteState.MUTE_PERMANENT ||
        myPermissions?.[key] === MuteState.MUTE_PERMANENT) {
        if (ignorePermissionsOnce) {
            return false;
        }
        return !!permissionsOnce?.has(mediaOption);
    }
    return true;
};
//# sourceMappingURL=permissions.js.map