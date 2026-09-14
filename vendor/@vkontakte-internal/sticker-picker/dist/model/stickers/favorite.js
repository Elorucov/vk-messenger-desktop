import { stickersEmojiKeyboard } from '../';
export const setFavoriteStickers = stickersEmojiKeyboard.createEvent();
export const $favoriteStickers = stickersEmojiKeyboard
    .createStore(null)
    .on(setFavoriteStickers, (_, favorite) => favorite);
//# sourceMappingURL=favorite.js.map