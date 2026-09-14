import { forward } from 'effector';
import { createGate } from 'effector-react';
import { stickersEmojiKeyboard } from './domain.js';
export var CONTEXT;
(function (CONTEXT) {
    CONTEXT["PHOTO_EDITOR"] = "photoEditor";
})(CONTEXT || (CONTEXT = {}));
export const setContextOptions = stickersEmojiKeyboard.createEvent();
export const $context = stickersEmojiKeyboard
    .createStore(null)
    .on(setContextOptions, (_, { context }) => context ?? null);
export const ContextGate = createGate();
forward({
    from: ContextGate.state,
    to: setContextOptions,
});
//# sourceMappingURL=context.js.map