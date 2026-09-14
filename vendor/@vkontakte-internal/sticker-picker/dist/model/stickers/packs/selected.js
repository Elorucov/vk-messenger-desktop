import { stickersEmojiKeyboard } from '../../';
export const setSelectedPackKey = stickersEmojiKeyboard.createEvent();
export const $selectedPackKey = stickersEmojiKeyboard
    .createStore(null)
    .on(setSelectedPackKey, (_, id) => id);
//# sourceMappingURL=selected.js.map