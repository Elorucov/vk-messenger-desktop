import { stickersEmojiKeyboard } from '../index';
export const setSelectedEmojiPackIndex = stickersEmojiKeyboard.createEvent();
export const $selectedEmojiPackIndex = stickersEmojiKeyboard
    .createStore(0)
    .on(setSelectedEmojiPackIndex, (_, index) => index);
//# sourceMappingURL=selectedEmojiPackIndex.js.map