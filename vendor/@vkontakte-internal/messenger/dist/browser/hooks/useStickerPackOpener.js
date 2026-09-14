import { useCallback, useEffect, useState, useRef } from 'react';
import { useStickersApi } from '../ui/StickersApiContext/StickersApiContext';
import { Tab } from '@vkontakte-internal/sticker-picker';
import { setTabbarActiveTab } from '@vkontakte-internal/sticker-picker/dist/model/tabbarActiveTab';
import { setActivePackKeyOptions } from '@vkontakte-internal/sticker-picker/dist/model/stickers/packs/active';
import { ServicePackKey } from '@vkontakte-internal/sticker-picker/dist/model/stickers/packs';
import { useStickerEmojiMenu } from '../ui/StickerEmojiMenu/StickerEmojiMenuContext';
import * as Peer from '../../core/model/Peer';
import { useViewer, useFeatureFlags } from '../hooks/misc';
export function useStickerPackOpener({ enabled, isUGC, stickerId, stickerPackId, vmojiCharacterId, messageAuthorId, referrer, }) {
    const stickersApi = useStickersApi();
    const stickerEmojiMenu = useStickerEmojiMenu();
    const { viewer } = useViewer();
    const featureFlags = useFeatureFlags();
    const isMessageOut = viewer.id === messageAuthorId;
    const loading = useRef(false);
    const [isPackActive, setPackActive] = useState(false);
    const [proxyRoute, setProxyRoute] = useState();
    const getStockItemFromCache = useCallback(async (active = false) => {
        const stockItems = await stickersApi.cache.stockItems.get();
        if (!stockItems) {
            // Не удалось достучаться до кеша?
            return;
        }
        return stockItems.find((stockItem) => {
            if (active && !stockItem?.product.active) {
                return undefined;
            }
            if (stickerPackId) {
                return stockItem.product.id === stickerPackId;
            }
            return stockItem.product.stickers?.some((sticker) => sticker.sticker_id === stickerId);
        });
    }, [stickersApi.cache, stickerPackId, stickerId]);
    const handleVmojiAvatarModelOpen = useCallback(async () => {
        // Если это не вимоджи или сообщение сообщества – выходим
        if (!featureFlags.vas_vmoji_click ||
            !vmojiCharacterId ||
            !messageAuthorId ||
            !Peer.isUserPeerId(messageAuthorId)) {
            return false;
        }
        const openVmojiAvatarModel = () => {
            setPackActive(false);
            setProxyRoute({
                kind: 'VmojiAvatarModelProxyRoute',
                packId: stickerPackId,
                characterId: vmojiCharacterId,
                ownerId: messageAuthorId,
            });
        };
        // Если вимоджи не наш – открываем модалку
        if (!isMessageOut) {
            openVmojiAvatarModel();
            return true;
        }
        const pack = await getStockItemFromCache(true);
        if (!pack ||
            pack.product.vmoji_avatar?.character_id !== vmojiCharacterId) {
            openVmojiAvatarModel();
        }
        else {
            setPackActive(true);
        }
        return true;
    }, [
        setProxyRoute,
        setPackActive,
        getStockItemFromCache,
        stickerPackId,
        vmojiCharacterId,
        messageAuthorId,
        isMessageOut,
        featureFlags.vas_vmoji_click,
    ]);
    const fetchStickerInfo = useCallback(async (force = false) => {
        // Если пак активен и метод не вызван прогревом кеша, выходим
        if (isPackActive && !force) {
            return;
        }
        // UGC всегда ведут в клавиатуру
        if (isUGC) {
            setPackActive(true);
            return;
        }
        // Обработаем клик по вимоджи
        const isVmojiAvatarModelOpened = await handleVmojiAvatarModelOpen();
        if (isVmojiAvatarModelOpened) {
            return;
        }
        // Найдем пак в кеше
        const pack = await getStockItemFromCache();
        // Если не нашли пак, но есть stickerId, то загрузим только стикер и вытащим урл
        // Если уже начали загружать – во время выполнения запроса не зайдем
        let sticker;
        if (!pack && stickerId && !loading.current) {
            loading.current = true;
            sticker = (await stickersApi.cache.getStickers([stickerId]))?.[0];
            loading.current = false;
        }
        // Если пака нет в кеше и мы не знаем stickerId, нужно сходить в апи за сток айтемом
        // Если уже начали загружать – во время выполнения запроса не зайдем
        if (!pack && !stickerId && !loading.current) {
            loading.current = true;
            await stickersApi.cache.getStockItem({
                productId: stickerPackId,
            });
            loading.current = false;
            return;
        }
        // Включаем только если пак активен и в кеше
        if (pack?.product.active) {
            setPackActive(true);
        }
        else if (stickerPackId) {
            setPackActive(false);
            setProxyRoute({
                kind: 'StickerPackProxyRoute',
                stickerPackId,
                externalUrl: pack?.product.url || sticker?.pack_url,
                ref: referrer,
            });
        }
    }, [
        isPackActive,
        isUGC,
        stickerId,
        stickerPackId,
        stickersApi,
        handleVmojiAvatarModelOpen,
        referrer,
        getStockItemFromCache,
    ]);
    useEffect(() => {
        if (!enabled) {
            return;
        }
        fetchStickerInfo();
        return stickersApi.cache.stickersAsync.subscribe(async (key) => {
            if (key === 'stockItems') {
                fetchStickerInfo(true);
            }
        });
    }, [fetchStickerInfo, stickersApi.cache, enabled]);
    const openStickerPackInPicker = () => {
        stickerEmojiMenu.toggleIsOpen(true);
        // Выставляет таб стикеров в случае, если пикер еще не открывался
        stickersApi.cache.tabbarActiveTab.set(Tab.STICKERS);
        // Выставляет таб стикеров, если пикер уже открывался на эмодзи
        setTabbarActiveTab(Tab.STICKERS);
        setActivePackKeyOptions({
            activePackKey: isUGC ? ServicePackKey.UGC : stickerPackId,
        });
    };
    return {
        openStickerPackInPicker: isPackActive ? openStickerPackInPicker : undefined,
        proxyRoute,
    };
}
//# sourceMappingURL=useStickerPackOpener.js.map