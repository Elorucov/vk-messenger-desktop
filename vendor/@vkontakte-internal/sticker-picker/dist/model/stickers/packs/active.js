import { forward } from 'effector';
import { createGate } from 'effector-react';
import { stickersEmojiKeyboard } from '../../';
export const setActivePackKeyOptions = stickersEmojiKeyboard.createEvent();
export const $activePackKey = stickersEmojiKeyboard
    .createStore(null)
    .on(setActivePackKeyOptions, (_, { activePackKey }) => activePackKey);
export const ActivePackKeyGate = createGate();
forward({
    from: ActivePackKeyGate.state,
    to: setActivePackKeyOptions,
});
//# sourceMappingURL=active.js.map