import { MediaOption, MuteState } from '@vkontakte/calls-sdk';
import { calcFlags, createFlags, is, objectReduce } from '../base';
import { MO_2_PP } from '../../constants';
export function getMuteState(p) {
    const pf = createFlags(['isPermanent', 'isCurrentlyOn', 'isMediaAllowed']);
    const flags = calcFlags(pf, p);
    if (is(flags, pf.isPermanent)) {
        return MuteState.MUTE_PERMANENT;
    }
    if (flags === pf.isCurrentlyOn) {
        return MuteState.UNMUTE;
    }
    return MuteState.MUTE;
}
/** мапает аргументы onMuteStates в объект */
export const mapSdkMuteStatesArgs = (...args) => {
    return {
        /** current mute state */
        muteStates: args[0],
        /** current unmute options */
        unmuteOptions: args[1],
        /** what in particular is required to be turned off/on */
        mediaOptions: args[2],
        /** if true then all participants were (un)muted at once, not only this one */
        muteAll: args[3],
        unmute: args[4],
        /**
         * available only for admins, if specified then denotes the
         * participant whose mute state was updated (and specified
         * in this notification)
         * if userId is null, then it's update for current user
         */
        userId: args[5],
        /** id of admin who performed (un)mute */
        adminId: args[6],
        /**
         * if true then global/personal state was changed (depending on
         * muteAll) and muteStates/unmuteOptions fields contain corresponding
         * new state, if false then those fields are irrelevant
         */
        stateUpdated: args[7],
        /**
         * which options participant was asked to turn on
         * (in other words - field passed from the command)
         */
        requestedMedia: args[8],
        /**
         * id of room or main room if null
         * Типизация нужна, так как в Params sdk roomId?: number | null из-за того, что предыдущий параметр опциональный.
         * Но фактически сюда всегда прилетает значение
         * todo: изменить в sdk типизацию onMuteStates, чтобы передавался объект, а не куча атрибутов
         */
        roomId: args[9],
    };
};
/** получает обновленные пермиссии участника с вычетом использованных */
export const getDecreasedPermissionsOnce = (prevMediaSettings, nextMediaSettings, permissionsOnce) => {
    if (!permissionsOnce?.size) {
        // нечего снижать
        return;
    }
    const result = new Set(permissionsOnce);
    if (prevMediaSettings.isAudioEnabled && !nextMediaSettings.isAudioEnabled) {
        result.delete(MediaOption.AUDIO);
    }
    if (prevMediaSettings.isVideoEnabled && !nextMediaSettings.isVideoEnabled) {
        result.delete(MediaOption.VIDEO);
    }
    if (prevMediaSettings.isScreenSharingEnabled && !nextMediaSettings.isScreenSharingEnabled) {
        result.delete(MediaOption.SCREEN_SHARING);
    }
    return result;
};
export const getUnmutedPermissions = () => ({
    audio: MuteState.UNMUTE,
    video: MuteState.UNMUTE,
    screenSharing: MuteState.UNMUTE,
    movieSharing: MuteState.UNMUTE,
    audioSharing: MuteState.UNMUTE,
    animoji: MuteState.UNMUTE,
});
/**
 * переводит из формата `muteState` в формат `ParticipantPermissions`
 * с учетом переданных `mediaOptions` (массив типов медиа, которые изменились)
 */
export const mapMuteStatesToParticipantPermissions = (muteStates, mediaOptions, prevPermissions) => {
    return objectReduce(muteStates, (acc, muteState, mediaOption) => {
        // обновляем только те состояния, которые пришли в mediaOptions
        if (mediaOptions.includes(mediaOption) && muteState) {
            const key = MO_2_PP[mediaOption];
            acc[key] = muteState;
        }
        return acc;
    }, prevPermissions ? { ...prevPermissions } : getUnmutedPermissions());
};
/** мапает muteStates участника в формат для редакса */
export const mapParticipantPermissions = (muteStates) => {
    const result = getUnmutedPermissions();
    for (const [key, muteState] of Object.entries(muteStates)) {
        switch (key) {
            case MediaOption.AUDIO:
                result.audio = muteState;
                break;
            case MediaOption.SCREEN_SHARING:
                result.screenSharing = muteState;
                break;
            case MediaOption.VIDEO:
                result.video = muteState;
                break;
            case MediaOption.MOVIE_SHARING:
                result.movieSharing = muteState;
                break;
        }
    }
    return result;
};
//# sourceMappingURL=permissions.js.map