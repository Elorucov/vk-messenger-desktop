import { stickersEmojiKeyboard } from '../../index';
/**
 * Пак к которому привязан баннер
 */
export const setAvatarSuggestionPackIndex = stickersEmojiKeyboard.createEvent();
export const $avatarSuggestionBannerPackIndex = stickersEmojiKeyboard
    .createStore(null)
    .on(setAvatarSuggestionPackIndex, (_, index) => index);
//# sourceMappingURL=packIndex.js.map