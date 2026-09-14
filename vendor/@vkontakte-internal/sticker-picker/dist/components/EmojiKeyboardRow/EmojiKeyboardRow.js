import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { useMemo } from 'react';
import { EmojiItem } from '../EmojiItem/EmojiItem';
import { $selectedEmoji } from '../../model/emoji/selected';
import { $variant, StickerEmojiKeyboardVariant } from '../../model/variant';
import { useEmojiKeyboard } from '../../hooks/emojiKeyboard';
import styles from './EmojiKeyboardRow.module.css';
export const rowVariantModifier = {
    [StickerEmojiKeyboardVariant.WIDE]: styles.rowWide,
    [StickerEmojiKeyboardVariant.COMPACT]: styles.rowCompact,
    [StickerEmojiKeyboardVariant.REGULAR]: styles.rowRegular,
    [StickerEmojiKeyboardVariant.ADAPTIVE]: styles.rowAdaptive,
    [StickerEmojiKeyboardVariant.SMALL]: styles.rowSmall,
};
export function EmojiKeyboardRow({ emoji, onEmojiClick, className, ...props }) {
    const { emojiSections } = useEmojiKeyboard();
    const variant = useStore($variant);
    const selectedEmoji = useStore($selectedEmoji);
    const selectedEmojiIndex = selectedEmoji?.emojiIndex;
    const selectedSectionIndex = selectedEmoji?.sectionIndex;
    const selectedEmojiValue = selectedEmojiIndex !== undefined && selectedSectionIndex !== undefined
        ? emojiSections[selectedSectionIndex][1][selectedEmojiIndex]
        : undefined;
    const items = useMemo(() => emoji.map((emoji) => (_jsx(EmojiItem, { className: styles.emoji, emoji: emoji, active: emoji === selectedEmojiValue, onEmojiClick: onEmojiClick }, emoji))), [emoji, selectedEmojiValue, onEmojiClick]);
    return (_jsx("div", { className: classNames(styles.row, rowVariantModifier[variant], className), ...props, children: items }));
}
//# sourceMappingURL=EmojiKeyboardRow.js.map