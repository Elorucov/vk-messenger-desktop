import { sample } from 'effector';
import { stickersEmojiKeyboard } from '../';
import { $variant, setVariantOptions, DEFAULT_VARIANT, StickerEmojiKeyboardVariant } from '../variant';
export const emojiPaddingVariants = {
    [StickerEmojiKeyboardVariant.WIDE]: 9,
    [StickerEmojiKeyboardVariant.COMPACT]: 8,
    [StickerEmojiKeyboardVariant.REGULAR]: 12,
    [StickerEmojiKeyboardVariant.ADAPTIVE]: 9,
    [StickerEmojiKeyboardVariant.SMALL]: 8,
};
const changeEmojiPadding = stickersEmojiKeyboard.createEvent();
export const $emojiPadding = stickersEmojiKeyboard.createStore(emojiPaddingVariants[DEFAULT_VARIANT]);
sample({
    clock: setVariantOptions,
    source: $variant,
    fn: (variant) => emojiPaddingVariants[variant],
    target: changeEmojiPadding,
});
//# sourceMappingURL=variant.js.map