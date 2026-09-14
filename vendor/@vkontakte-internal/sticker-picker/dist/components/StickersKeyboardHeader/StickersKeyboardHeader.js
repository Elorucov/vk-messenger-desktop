import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Div":["@vkontakte-internal/vkcom-kit",{"className":2}],"TextClamp":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { useStore } from 'effector-react';
import { useLangPack } from '@vkontakte-internal/langs';
import { Subhead, Skeleton, Div, TextClamp, vkuiCssVars } from '@vkontakte-internal/vkcom-kit';
import { Tooltip } from './Tooltip/Tooltip';
import { GiftButton } from './GiftButton/GiftButton';
import { UGCEditButton } from './UGCEditButton/UGCEditButton';
import { UGCMoreButton } from './UGCMoreButton/UGCMoreButton';
import { VmojiEditButton } from './VmojiEditButton/VmojiEditButton';
import { StyleSettingsButton } from './StyleSettingsButton/StyleSettingsButton';
import { $variant, StickerEmojiKeyboardVariant } from '../../model/variant';
// eslint-disable-next-line css-modules/no-unused-class
import styles from './StickersKeyboardHeader.module.css';
export function StickersKeyboardHeader({ pack, ...props }) {
    const { translate } = useLangPack();
    const variant = useStore($variant);
    if (!pack) {
        return (_jsx(Div, { "data-testid": "stickers-keyboard-header-skeleton", className: styles.header, spacing: 8, mode: variant === StickerEmojiKeyboardVariant.COMPACT ? 'vertical' : 'default', ...props, children: _jsx(Subhead, { children: _jsx(Skeleton, { width: 128, colorFrom: vkuiCssVars.colorTransparent.active.value, noAnimation: true }) }) }));
    }
    const { title } = pack;
    if (!title) {
        return null;
    }
    return (_jsxs(Div, { "data-testid": "stickers-keyboard-header", "data-header": true, className: styles.header, spacing: 8, mode: variant === StickerEmojiKeyboardVariant.COMPACT ? 'vertical' : 'default', ...props, children: [_jsx(TextClamp, { "data-testid": "stickers-keyboard-header-title", TypographyComponent: Subhead, lines: 1, className: styles.title, weight: "3", children: translate(title) }), _jsx(Tooltip, { pack: pack }), _jsx(StyleSettingsButton, { pack: pack }), _jsx(VmojiEditButton, { pack: pack }), _jsx(GiftButton, { pack: pack }), _jsx(UGCEditButton, { pack: pack }), _jsx(UGCMoreButton, { pack: pack })] }));
}
//# sourceMappingURL=StickersKeyboardHeader.js.map