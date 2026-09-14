import { jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'effector-react';
import { useEffect } from 'react';
import { $tabbarActiveTab } from '../../model/tabbarActiveTab';
import { useAPI } from '../../hooks/api';
import { StickersEmojiKeyboardContext } from '../../hooks/stickersEmojiKeyboard';
export function StickersEmojiKeyboardProvider({ onTabChange, onShopClick: onShopClickProp, ...props }) {
    const api = useAPI();
    const activeTab = useStore($tabbarActiveTab);
    const cachedActiveTab = api.cache.tabbarActiveTab.get();
    useEffect(() => {
        if (cachedActiveTab === activeTab) {
            return;
        }
        api.cache.tabbarActiveTab.set(activeTab);
    }, [activeTab, cachedActiveTab]);
    const onShopClick = onShopClickProp
        ? (event) => {
            api.store.markAsViewed({
                type: 'stickers',
                reset: String(['store_new_items', 'global_promotion']),
            });
            const reloadCache = () => api.cache.reload();
            onShopClickProp(event, reloadCache);
        }
        : null;
    return (_jsx(StickersEmojiKeyboardContext.Provider, { value: {
            onTabChange,
            ...(onShopClick && { onShopClick }),
        }, ...props }));
}
//# sourceMappingURL=StickersEmojiKeyboardProvider.js.map