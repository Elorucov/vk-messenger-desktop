import { stickersEmojiKeyboard } from '../../../model';
export const setIsTransitionActive = stickersEmojiKeyboard.createEvent();
export const $isTransitionActive = stickersEmojiKeyboard
    .createStore(false)
    .on(setIsTransitionActive, (_, payload) => payload);
//# sourceMappingURL=transitionActive.js.map