import { jsx as _jsx } from "react/jsx-runtime";
import { useStore } from 'effector-react';
import { useRef, useEffect, } from 'react';
import { $isVisible } from '../../model/visible';
import { setUGCInfo } from '../../model/stickers/ugc/info';
import { $userPeer } from '../../model/peer/user';
import { setUGCPacks } from '../../model/stickers/ugc/packs';
import { setHasAvatar } from '../../model/stickers/hasAvatar';
import { setRecentStickers } from '../../model/stickers/recent';
import { setPhotoEditorStickers } from '../../model/stickers/photoEditor';
import { setTabbarActiveTab } from '../../model/tabbarActiveTab';
import { $activePackKey, setActivePackKeyOptions } from '../../model/stickers/packs/active';
import { setImageConfigs } from '../../model/stickers/imageConfigs';
import { setFavoriteStickers } from '../../model/stickers/favorite';
import { setStoreNewItemsCount } from '../../model/stickers/storeNewItemsCount';
import { $stockItems, setStockItems } from '../../model/stickers/packs/stockItems';
import { $packs } from '../../model/stickers/packs';
import { $selectedPackKey, setSelectedPackKey } from '../../model/stickers/packs/selected';
import { setStockItemsAvailableToGift } from '../../model/stickers/packs/stockItems/availableToGift';
import { getAvatarSuggestionFromCache, setAvatarSuggestion, } from '../../model/helpHint/avatarSuggestionBanner/info';
import { $vmojiPromotion, setVmojiPromotion, clearVmojiPromotionDot, } from '../../model/stickers/vmojiPromotion';
import { $context, CONTEXT } from '../../model/context';
import { useAPI } from '../../hooks/api';
import { AvatarSuggestionAtomName } from '../../model/helpHint/helpHint';
import { Tab } from '../../utils/cache/types';
import { useStickersKeyboard, StickersKeyboardContext, } from '../../hooks/stickersKeyboard';
import { isStaticUpdatesManagerEnabled, isStickersPickerFastSelectPackEnabled } from '../../utils/userEnv';
export function StickersKeyboardProvider({ onPopUpPlay, onCatchError, onStickerSend, onUGCEditClick, onVmojiEditClick, onUGCReportClick, onVmojiCreateClick, onStockItemGiftClick, onStockItemSettingsClick, onVmojiSuggestionClick, noAnimation, renderAsStaticImage, ...props }) {
    const api = useAPI();
    const { isServiceStockItem } = useStickersKeyboard();
    const { packs } = useStore($packs);
    const userPeer = useStore($userPeer);
    const isVisible = useStore($isVisible);
    const stockItems = useStore($stockItems);
    const activePackKey = useStore($activePackKey);
    const vmojiPromotion = useStore($vmojiPromotion);
    const selectedPackKey = useStore($selectedPackKey);
    const context = useStore($context);
    const prevSelectedPacKeyRef = useRef(undefined);
    const prevSelectedPackKey = prevSelectedPacKeyRef.current;
    const markAsViewed = (packId) => {
        if (isServiceStockItem(packId)) {
            return;
        }
        const stockItem = stockItems?.find(({ product: { id } }) => id === packId);
        if (!stockItem || !stockItems) {
            return;
        }
        if (stockItem.product.is_vmoji && vmojiPromotion?.dot_color) {
            clearVmojiPromotionDot();
        }
        if (!stockItem.product.is_new) {
            return;
        }
        stockItem.product.is_new = false;
        api.cache.stockItems.set(stockItems, {
            notify: false,
        });
        api.store.updateStickerProductsState({
            product_ids: String(packId),
            key: 'is_new',
            value: '0',
        });
    };
    const setSelectedPack = (key) => {
        if (selectedPackKey) {
            prevSelectedPacKeyRef.current = selectedPackKey;
        }
        if (key) {
            const pack = packs?.get(key);
            if (pack) {
                api.cache.stickersActiveTab.set(key);
                markAsViewed(key);
            }
        }
        setSelectedPackKey(key);
        if (isStickersPickerFastSelectPackEnabled()) {
            setActivePackKeyOptions({ activePackKey: key });
        }
    };
    const loadProductsAvailableForGift = (userId) => {
        api.store
            .getStickerPacksAvailableForGift({
            user_id: userId,
        })
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .then(setStockItemsAvailableToGift);
    };
    const readUGCCache = async () => {
        try {
            const [ugcInfo, ugcPacks] = await Promise.all([api.cache.ugcInfo.get(), api.cache.ugcPacks.get()]);
            setUGCInfo(ugcInfo);
            setUGCPacks(ugcPacks);
        }
        catch (error) {
            onCatchError?.(error);
        }
    };
    const readCache = async () => {
        try {
            const [global, stockItems, imageConfigs, recentStickers, photoEditorStickers, favoriteStickers, avatarSuggestion,] = await Promise.all([
                api.cache.global.get(),
                api.cache.getStockItems({
                    active: true,
                }),
                api.cache.imageConfigs.get(),
                api.cache.recentStickers.get(),
                context === CONTEXT.PHOTO_EDITOR ? api.cache.photoEditorStickers.get() : null,
                api.cache.favoriteStickers.get(),
                api.cache.avatarSuggestion.get(),
                readUGCCache(),
            ]);
            setRecentStickers(recentStickers);
            setPhotoEditorStickers(photoEditorStickers);
            setFavoriteStickers(favoriteStickers);
            setImageConfigs(imageConfigs);
            setAvatarSuggestion(avatarSuggestion);
            setHasAvatar(api.cache.hasAvatar.get());
            setVmojiPromotion(global?.vmoji_promotion || null);
            setStoreNewItemsCount(global?.store_new_items || 0);
            setStockItems(stockItems);
        }
        catch (error) {
            onCatchError?.(error);
        }
    };
    useEffect(() => {
        if (stockItems && isVisible) {
            api.cache.reload();
        }
        readCache();
        const stickersSyncUnsubscribe = api.cache.stickersSync.subscribe(readCache, true);
        const stickersAsyncUnsubscribe = api.cache.stickersAsync.subscribe(readCache, true);
        const stickersAsyncAtomsUnsubscribe = api.cache.stickersAsync.subscribe(async (key) => {
            switch (key) {
                case AvatarSuggestionAtomName:
                    getAvatarSuggestionFromCache();
                    break;
            }
        }, false);
        const ugcAsyncUnsubscribe = isStaticUpdatesManagerEnabled()
            ? api.cache.ugcAsync.subscribe(readUGCCache)
            : undefined;
        return () => {
            stickersSyncUnsubscribe();
            stickersAsyncUnsubscribe();
            stickersAsyncAtomsUnsubscribe();
            ugcAsyncUnsubscribe?.();
        };
    }, [api, isVisible, onCatchError]);
    useEffect(() => {
        setStockItemsAvailableToGift(null);
        if (!userPeer) {
            return;
        }
        const { id } = userPeer;
        loadProductsAvailableForGift(id);
    }, [userPeer]);
    useEffect(() => {
        if (activePackKey === undefined || activePackKey === null) {
            return;
        }
        setTabbarActiveTab(Tab.STICKERS);
    }, [activePackKey]);
    return (_jsx(StickersKeyboardContext.Provider, { value: {
            setSelectedPack,
            prevSelectedPackKey,
            onStickerSend,
            onUGCEditClick,
            onUGCReportClick,
            onVmojiEditClick,
            onVmojiCreateClick,
            onStockItemGiftClick,
            onStockItemSettingsClick,
            onVmojiSuggestionClick,
            onPopUpPlay,
            noAnimation,
            renderAsStaticImage,
        }, ...props }));
}
//# sourceMappingURL=StickersKeyboardProvider.js.map