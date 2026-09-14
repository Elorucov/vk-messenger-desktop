import { sample } from 'effector';
import { stickersEmojiKeyboard } from '../';
import { $variant, setVariantOptions, DEFAULT_VARIANT, StickerEmojiKeyboardVariant } from '../variant';
export const stickersSizeVariants = {
    [StickerEmojiKeyboardVariant.WIDE]: 86,
    [StickerEmojiKeyboardVariant.COMPACT]: 80,
    [StickerEmojiKeyboardVariant.REGULAR]: 92,
    [StickerEmojiKeyboardVariant.ADAPTIVE]: 86,
    [StickerEmojiKeyboardVariant.SMALL]: 72,
};
export const stickersHorizontalGapVariants = {
    [StickerEmojiKeyboardVariant.WIDE]: 8,
    [StickerEmojiKeyboardVariant.COMPACT]: 6,
    [StickerEmojiKeyboardVariant.REGULAR]: 8,
    [StickerEmojiKeyboardVariant.ADAPTIVE]: 8,
    [StickerEmojiKeyboardVariant.SMALL]: 6,
};
export const stickersVerticalGapVariants = {
    [StickerEmojiKeyboardVariant.WIDE]: 6,
    [StickerEmojiKeyboardVariant.COMPACT]: 8,
    [StickerEmojiKeyboardVariant.REGULAR]: 8,
    [StickerEmojiKeyboardVariant.ADAPTIVE]: 6,
    [StickerEmojiKeyboardVariant.SMALL]: 8,
};
/**
 * Отвечает за показ блоков в вертикальном порядке
 * cloumn -> стикеры/таб
 * column-reverse -> таб/стикеры
 */
export const stickersKeyboardVerticalOrderVariants = {
    [StickerEmojiKeyboardVariant.WIDE]: 'column',
    [StickerEmojiKeyboardVariant.COMPACT]: 'column',
    [StickerEmojiKeyboardVariant.REGULAR]: 'column',
    [StickerEmojiKeyboardVariant.SMALL]: 'column',
    [StickerEmojiKeyboardVariant.ADAPTIVE]: 'column-reverse',
};
export const changeStickersSize = stickersEmojiKeyboard.createEvent();
export const changeStickersVerticalGap = stickersEmojiKeyboard.createEvent();
export const changeStickersHorizontalGap = stickersEmojiKeyboard.createEvent();
export const $stickersSize = stickersEmojiKeyboard.createStore(stickersSizeVariants[DEFAULT_VARIANT]);
export const $stickersVerticalGap = stickersEmojiKeyboard.createStore(stickersVerticalGapVariants[DEFAULT_VARIANT]);
export const $stickersHorizontalGap = stickersEmojiKeyboard.createStore(stickersHorizontalGapVariants[DEFAULT_VARIANT]);
export const $stickersKeyboardVerticalOrder = stickersEmojiKeyboard.createStore(stickersKeyboardVerticalOrderVariants[DEFAULT_VARIANT]);
sample({
    clock: setVariantOptions,
    source: $variant,
    fn: (variant) => stickersSizeVariants[variant],
    target: $stickersSize,
});
sample({
    clock: setVariantOptions,
    source: $variant,
    fn: (variant) => stickersVerticalGapVariants[variant],
    target: $stickersVerticalGap,
});
sample({
    clock: setVariantOptions,
    source: $variant,
    fn: (variant) => stickersHorizontalGapVariants[variant],
    target: $stickersHorizontalGap,
});
sample({
    clock: setVariantOptions,
    source: $variant,
    fn: (variant) => stickersKeyboardVerticalOrderVariants[variant],
    target: $stickersKeyboardVerticalOrder,
});
//# sourceMappingURL=variant.js.map