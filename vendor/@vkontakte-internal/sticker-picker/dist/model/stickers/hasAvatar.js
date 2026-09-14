import { stickersEmojiKeyboard } from '../';
export const setHasAvatar = stickersEmojiKeyboard.createEvent();
export const $hasAvatar = stickersEmojiKeyboard
    .createStore(null)
    .on(setHasAvatar, (_, status) => status);
//# sourceMappingURL=hasAvatar.js.map