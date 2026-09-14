import { stickersEmojiKeyboard } from '../../index';
/**
 * Таб к которому привязан баннер
 */
export const setAvatarSuggestionTab = stickersEmojiKeyboard.createEvent();
export const $avatarSuggestionTab = stickersEmojiKeyboard
    .createStore(null)
    .on(setAvatarSuggestionTab, (_, tab) => tab);
//# sourceMappingURL=tab.js.map