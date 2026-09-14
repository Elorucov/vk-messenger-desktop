import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { useRef } from 'react';
import { AppRootProvider } from '@vkontakte-internal/vkcom-kit';
import { HelpHintsProvider } from '@vkontakte-internal/help-hints';
import { LangPackProvider } from '@vkontakte-internal/langs';
import { View } from '../View/View';
import { Tabbar } from '../Tabbar/Tabbar';
import { APIProvider } from '../APIProvider/APIProvider';
import { PeerProvider } from '../PeerProvider/PeerProvider';
import { EmojiKeyboard } from '../EmojiKeyboard/EmojiKeyboard';
import { StickersKeyboard } from '../StickersKeyboard/StickersKeyboard';
import { EmojiKeyboardProvider, } from '../EmojiKeyboardProvider/EmojiKeyboardProvider';
import { StickersKeyboardProvider, } from '../StickersKeyboardProvider/StickersKeyboardProvider';
import { StickersEmojiKeyboardProvider, } from '../StickersEmojiKeyboardProvider/StickersEmojiKeyboardProvider';
import { ContextGate } from '../../model/context';
import { PeerGate } from '../../model/peer';
import { $tabbarActiveTabState } from '../../model/tabbarActiveTab';
import { VisibleGate } from '../../model/visible';
import { $visibleTab, $visibleTabState, VisibleTabGate, } from '../../model/visibleTab';
import { ActivePackKeyGate } from '../../model/stickers/packs/active';
import { $variant, StickerEmojiKeyboardVariant, VariantGate, } from '../../model/variant';
import { useAPI } from '../../hooks/api';
import styles from './StickersEmojiKeyboard.module.css';
const keyboardVariantModifier = {
    [StickerEmojiKeyboardVariant.WIDE]: styles.keyboardWide,
    [StickerEmojiKeyboardVariant.COMPACT]: styles.keyboardCompact,
    [StickerEmojiKeyboardVariant.REGULAR]: styles.keyboardRegular,
    [StickerEmojiKeyboardVariant.ADAPTIVE]: styles.keyboardAdaptive,
    [StickerEmojiKeyboardVariant.SMALL]: styles.keyboardSmall,
};
export function StickersEmojiKeyboard({ lang, userId, peerId, context, variant, isVisible, visibleTab, onAPIRequest, activePackKey, onTabChange, onPopUpPlay, onShopClick, onCatchError, onEmojiInsert, onStickerSend, onUGCEditClick, onUGCReportClick, onVmojiEditClick, onVmojiCreateClick, onStockItemGiftClick, onStockItemSettingsClick, onVmojiSuggestionClick, noAnimation, renderAsStaticImage, ...props }) {
    return (_jsxs(LangPackProvider, { name: "stickers_picker", domain: "vk.com", lang: lang, suspense: false, children: [_jsx(PeerGate, { peerId: peerId }), _jsx(ContextGate, { context: context }), _jsx(VariantGate, { variant: variant }), _jsx(VisibleGate, { isVisible: isVisible }), _jsx(VisibleTabGate, { visibleTab: visibleTab }), _jsx(ActivePackKeyGate, { activePackKey: activePackKey }), _jsx(APIProvider, { userId: userId, peerId: peerId, language: lang, onAPIRequest: onAPIRequest, context: context, logError: onCatchError, children: _jsx(PeerProvider, { children: _jsx(StickersEmojiKeyboardProvider, { onTabChange: onTabChange, onShopClick: onShopClick, children: _jsx(StickersKeyboardProvider, { onPopUpPlay: onPopUpPlay, onCatchError: onCatchError, onStickerSend: onStickerSend, onUGCEditClick: onUGCEditClick, onVmojiEditClick: onVmojiEditClick, onUGCReportClick: onUGCReportClick, onVmojiCreateClick: onVmojiCreateClick, onStockItemGiftClick: onStockItemGiftClick, onStockItemSettingsClick: onStockItemSettingsClick, onVmojiSuggestionClick: onVmojiSuggestionClick, noAnimation: noAnimation, renderAsStaticImage: renderAsStaticImage, children: _jsx(EmojiKeyboardProvider, { onEmojiInsert: onEmojiInsert, children: _jsx(Layout, { ...props }) }) }) }) }) })] }));
}
function Layout({ className, ...props }) {
    const api = useAPI();
    const variant = useStore($variant);
    const visibleTab = useStore($visibleTab);
    const { isStickersActiveTab } = useStore($tabbarActiveTabState);
    const { isEmojiVisibleTab, isStickersVisibleTab } = useStore($visibleTabState);
    const ref = useRef(null);
    return (_jsx(HelpHintsProvider, { api: api, noToken: true, children: _jsx(AppRootProvider, { portalRoot: ref, children: _jsx("div", { ref: ref, className: classNames(className, styles.keyboard, keyboardVariantModifier[variant]), ...props, children: _jsxs("div", { className: styles.in, children: [_jsxs(View, { switched: isStickersActiveTab && !visibleTab, children: [_jsx(EmojiKeyboard, { mounted: !visibleTab || isEmojiVisibleTab }), _jsx(StickersKeyboard, { mounted: !visibleTab || isStickersVisibleTab })] }), _jsx(Tabbar, {})] }) }) }) }));
}
//# sourceMappingURL=StickersEmojiKeyboard.js.map