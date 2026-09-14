import { stickersEmojiKeyboard } from '../../../';
export const setStockItems = stickersEmojiKeyboard.createEvent();
export const $stockItems = stickersEmojiKeyboard
    .createStore(null)
    .on(setStockItems, (_, stockItems) => stockItems);
//# sourceMappingURL=index.js.map