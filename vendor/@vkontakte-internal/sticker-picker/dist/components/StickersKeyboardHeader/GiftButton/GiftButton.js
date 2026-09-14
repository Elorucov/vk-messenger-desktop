import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20GiftOutline":["@vkontakte/icons",{"className":1}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { Icon20GiftOutline } from '@vkontakte/icons';
import { PeerInfo } from './PeerInfo/PeerInfo';
import { $userPeer } from '../../../model/peer/user';
import { $stockItemsAvailableToGift } from '../../../model/stickers/packs/stockItems/availableToGift';
import { useStickersKeyboard } from '../../../hooks/stickersKeyboard';
import styles from './GiftButton.module.css';
// eslint-disable-next-line css-modules/no-unused-class
import headerStyles from '../StickersKeyboardHeader.module.css';
export function GiftButton({ pack }) {
    const { onStockItemGiftClick } = useStickersKeyboard();
    const userPeer = useStore($userPeer);
    const stockItemsAvailableToGift = useStore($stockItemsAvailableToGift);
    if (!pack?.canGift) {
        return null;
    }
    const { id, canGift, stockItem } = pack;
    const handleGiftClick = () => {
        if (!stockItem) {
            return;
        }
        onStockItemGiftClick?.(stockItem, userPeer);
    };
    const isPeerHasStockItem = Boolean(id && canGift && userPeer && !stockItemsAvailableToGift?.includes(id));
    return (_jsxs(_Fragment, { children: [isPeerHasStockItem && (_jsx(PeerInfo, { className: classNames(styles.peer, headerStyles.headerAside), pack: pack })), onStockItemGiftClick && (_jsx(Icon20GiftOutline, { "data-testid": "stickers-keyboard-header-gift-button", className: classNames(headerStyles.icon, headerStyles.headerAside), onClick: handleGiftClick }))] }));
}
//# sourceMappingURL=GiftButton.js.map