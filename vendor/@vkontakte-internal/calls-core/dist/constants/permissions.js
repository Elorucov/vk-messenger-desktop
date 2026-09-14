import { MediaOption } from '@vkontakte/calls-sdk';
/** мапа между `MediaOption` и ключами для `ParticipantPermissions` */
export const MO_2_PP = {
    [MediaOption.AUDIO]: 'audio',
    [MediaOption.VIDEO]: 'video',
    [MediaOption.SCREEN_SHARING]: 'screenSharing',
    [MediaOption.MOVIE_SHARING]: 'movieSharing',
    [MediaOption.ANIMOJI]: 'animoji',
    /** @todo (сейчас не ясно, могут ли быть на этот ключ пермишены) */
    [MediaOption.AUDIO_SHARING]: 'audioSharing',
};
//# sourceMappingURL=permissions.js.map