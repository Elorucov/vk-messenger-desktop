import { forward } from 'effector';
import { createGate } from 'effector-react';
import { stickersEmojiKeyboard } from './domain.js';
export var StickerEmojiKeyboardVariant;
(function (StickerEmojiKeyboardVariant) {
    StickerEmojiKeyboardVariant["WIDE"] = "wide";
    StickerEmojiKeyboardVariant["COMPACT"] = "compact";
    StickerEmojiKeyboardVariant["REGULAR"] = "regular";
    StickerEmojiKeyboardVariant["ADAPTIVE"] = "adaptive";
    StickerEmojiKeyboardVariant["SMALL"] = "small";
})(StickerEmojiKeyboardVariant || (StickerEmojiKeyboardVariant = {}));
export const setVariantOptions = stickersEmojiKeyboard.createEvent();
export const DEFAULT_VARIANT = StickerEmojiKeyboardVariant.WIDE;
export const $variant = stickersEmojiKeyboard
    .createStore(DEFAULT_VARIANT)
    .on(setVariantOptions, (_, { variant }) => variant);
export const VariantGate = createGate();
forward({
    from: VariantGate.state,
    to: setVariantOptions,
});
//# sourceMappingURL=variant.js.map