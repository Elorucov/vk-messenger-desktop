import { stickersEmojiKeyboard } from '../../index';
/**
 * Случаи когда мы не хотим показывать наш промо.
 * Например, когда промо попадается в категорию, где уже есть баннер
 */
export const setAvatarSuggestionDisabled = stickersEmojiKeyboard.createEvent();
export const $avatarSuggestionDisabled = stickersEmojiKeyboard
    .createStore(false)
    .on(setAvatarSuggestionDisabled, (_, disabled) => disabled);
//# sourceMappingURL=disabled.js.map