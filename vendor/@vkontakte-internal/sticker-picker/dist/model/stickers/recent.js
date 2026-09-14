import { stickersEmojiKeyboard } from '../';
export const setRecentStickers = stickersEmojiKeyboard.createEvent();
export const $recentStickers = stickersEmojiKeyboard
    .createStore(null)
    .on(setRecentStickers, (_, recent) => recent);
//# sourceMappingURL=recent.js.map