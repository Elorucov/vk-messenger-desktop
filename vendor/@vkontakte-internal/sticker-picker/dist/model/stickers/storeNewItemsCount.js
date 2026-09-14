import { stickersEmojiKeyboard } from '../index';
export const setStoreNewItemsCount = stickersEmojiKeyboard.createEvent();
export const $storeNewItemsCount = stickersEmojiKeyboard
    .createStore(0)
    .on(setStoreNewItemsCount, (_, count) => count);
//# sourceMappingURL=storeNewItemsCount.js.map