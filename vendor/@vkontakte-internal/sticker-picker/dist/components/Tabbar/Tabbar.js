import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { useEffect } from 'react';
import { useLangPack } from '@vkontakte-internal/langs';
import { Icon24SmileOutline, Icon24StickerSmileOutline, Icon24StorefrontOutline } from '@vkontakte/icons';
import { TabbarItem } from '../TabbarItem/TabbarItem';
import { $visibleTab } from '../../model/visibleTab';
import { $tabbarActiveTabState, setTabbarActiveTab } from '../../model/tabbarActiveTab';
import { Tab } from '../../utils/cache/types';
import { useStickersEmojiKeyboard } from '../../hooks/stickersEmojiKeyboard';
import styles from './Tabbar.module.css';
export function Tabbar({ className, ...props }) {
    const { translate } = useLangPack();
    const { shopIndicatorMode, onTabChange, onShopClick } = useStickersEmojiKeyboard();
    const visibleTab = useStore($visibleTab);
    const { isEmojiActiveTab, isStickersActiveTab } = useStore($tabbarActiveTabState);
    const tabChangeHandler = (tab) => () => {
        setTabbarActiveTab(tab);
        onTabChange?.({
            tab,
        });
    };
    useEffect(() => {
        if (!visibleTab) {
            return;
        }
        setTabbarActiveTab(visibleTab);
    }, [visibleTab]);
    if (visibleTab) {
        return null;
    }
    return (_jsxs("div", { className: classNames(styles.tabbar, className), ...props, children: [_jsx(TabbarItem, { "data-testid": "sticker-picker-tabbar-item-emoji", "aria-label": translate('stickers_picker_emoji'), className: styles.item, active: isEmojiActiveTab, onClick: tabChangeHandler(Tab.EMOJI), children: _jsx(Icon24SmileOutline, {}) }), _jsx(TabbarItem, { "data-testid": "sticker-picker-tabbar-item-stickers", "aria-label": translate('stickers_picker_stickers'), className: styles.item, active: isStickersActiveTab, onClick: tabChangeHandler(Tab.STICKERS), children: _jsx(Icon24StickerSmileOutline, {}) }), onShopClick && (_jsx(TabbarItem, { "data-testid": "sticker-picker-tabbar-item-shop", "aria-label": translate('stickers_picker_store'), className: styles.item, indicator: shopIndicatorMode, onClick: onShopClick, children: _jsx(Icon24StorefrontOutline, {}) }))] }));
}
//# sourceMappingURL=Tabbar.js.map