import { forward } from 'effector';
import { createGate } from 'effector-react';
import { stickersEmojiKeyboard } from './domain.js';
export const setVisibleOptions = stickersEmojiKeyboard.createEvent();
export const $isVisible = stickersEmojiKeyboard
    .createStore(false)
    .on(setVisibleOptions, (_, { isVisible }) => isVisible);
export const VisibleGate = createGate();
forward({
    from: VisibleGate.state,
    to: setVisibleOptions,
});
//# sourceMappingURL=visible.js.map