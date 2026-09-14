import { jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'effector-react';
import { useLangPack } from '@vkontakte-internal/langs';
import { Icon24ShoppingCartOutline } from '@vkontakte/icons';
import { StickersKeyboardGroupItem } from '../../StickersKeyboardGroupItem/StickersKeyboardGroupItem';
import { useStickersEmojiKeyboard } from '../../../hooks/stickersEmojiKeyboard';
import { $visibleTabState } from '../../../model/visibleTab';
import styles from './ShopButton.module.css';
export function ShopButton() {
    const { translate } = useLangPack();
    const { shopIndicatorMode, onShopClick } = useStickersEmojiKeyboard();
    const { isStickersVisibleTab } = useStore($visibleTabState);
    if (!isStickersVisibleTab || !onShopClick) {
        return null;
    }
    const hasIndicator = Boolean(shopIndicatorMode);
    return (_jsx(StickersKeyboardGroupItem, { "aria-label": translate('stickers_picker_store'), className: styles.button, indicator: hasIndicator, onClick: onShopClick, "data-testid": "stickers-shop-button", children: _jsx(Icon24ShoppingCartOutline, {}) }));
}
//# sourceMappingURL=ShopButton.js.map