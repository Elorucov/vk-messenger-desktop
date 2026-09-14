import { stickersEmojiKeyboard } from '../';
export const setRecentEmoji = stickersEmojiKeyboard.createEvent();
export const $recentEmoji = stickersEmojiKeyboard
    .createStore(null)
    .on(setRecentEmoji, (_, recent) => recent);
//# sourceMappingURL=recent.js.map