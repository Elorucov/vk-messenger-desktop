import { stickersEmojiKeyboard } from '../';
export const setImageConfigs = stickersEmojiKeyboard.createEvent();
export const $imageConfigs = stickersEmojiKeyboard
    .createStore(null)
    .on(setImageConfigs, (_, configs) => configs);
//# sourceMappingURL=imageConfigs.js.map