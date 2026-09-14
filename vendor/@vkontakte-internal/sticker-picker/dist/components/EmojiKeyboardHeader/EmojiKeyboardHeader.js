import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Div":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { Subhead, Div, getColorClass, TextClamp } from '@vkontakte-internal/vkcom-kit';
import { useStore } from 'effector-react';
import { useLangPack } from '@vkontakte-internal/langs';
import { $variant, StickerEmojiKeyboardVariant } from '../../model/variant';
import styles from './EmojiKeyboardHeader.module.css';
export function EmojiKeyboardHeader({ title, ...props }) {
    const { translate } = useLangPack();
    const variant = useStore($variant);
    return (_jsx(Div, { "data-testid": "emoji-keyboard-header", "data-header": true, spacing: 8, mode: variant === StickerEmojiKeyboardVariant.COMPACT ? 'vertical' : 'default', className: styles.header, ...props, children: _jsx(TextClamp, { TypographyComponent: Subhead, lines: 1, className: getColorClass('color_text_secondary'), weight: "3", children: translate(title) }) }));
}
//# sourceMappingURL=EmojiKeyboardHeader.js.map