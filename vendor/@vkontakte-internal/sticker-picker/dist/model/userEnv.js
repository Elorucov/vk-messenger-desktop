import { stickersEmojiKeyboard } from './domain.js';
export const setUserEnv = stickersEmojiKeyboard.createEvent();
export const $userEnv = stickersEmojiKeyboard
    .createStore({})
    .on(setUserEnv, (_, userEnv) => userEnv);
//# sourceMappingURL=userEnv.js.map