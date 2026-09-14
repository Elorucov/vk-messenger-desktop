import { stickersEmojiKeyboard } from '../';
export const setSelectedEmoji = stickersEmojiKeyboard.createEvent();
export const $selectedEmoji = stickersEmojiKeyboard
    .createStore(null)
    .on(setSelectedEmoji, (_, emoji) => emoji);
//# sourceMappingURL=selected.js.map