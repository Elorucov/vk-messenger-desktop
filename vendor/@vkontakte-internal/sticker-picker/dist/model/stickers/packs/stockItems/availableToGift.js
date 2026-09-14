import { stickersEmojiKeyboard } from '../../../';
export const setStockItemsAvailableToGift = stickersEmojiKeyboard.createEvent();
export const $stockItemsAvailableToGift = stickersEmojiKeyboard
    .createStore(null)
    .on(setStockItemsAvailableToGift, (_, list) => list);
//# sourceMappingURL=availableToGift.js.map