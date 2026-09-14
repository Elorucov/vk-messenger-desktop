import { useStore } from 'effector-react';
import { useContext, createContext } from 'react';
import { $packs } from '../model/stickers/packs';
import { $favoriteStickers, setFavoriteStickers } from '../model/stickers/favorite';
import { useAPI } from './api';
export const StickersKeyboardContext = createContext({});
export function useStickersKeyboard() {
    const api = useAPI();
    const favoriteStickers = useStore($favoriteStickers);
    const { packsGroups } = useStore($packs);
    const stickersKeyboardContext = useContext(StickersKeyboardContext);
    const addToFavorite = async ({ id, isBase, rawData }) => {
        if (!isBase) {
            return;
        }
        const global = await api.cache.global.get();
        if (!global) {
            return;
        }
        const { favorite_stickers_limit } = global;
        api.store.addStickersToFavorite({
            sticker_ids: String(id),
        });
        if (!favoriteStickers) {
            return;
        }
        const changedFavoriteStickers = [rawData, ...favoriteStickers].slice(0, favorite_stickers_limit);
        setFavoriteStickers(changedFavoriteStickers);
        api.cache.favoriteStickers.set(changedFavoriteStickers);
    };
    const removeFromFavorite = async ({ id, isBase }) => {
        if (!isBase) {
            return;
        }
        api.store.removeStickersFromFavorite({
            sticker_ids: String(id),
        });
        if (!favoriteStickers) {
            return;
        }
        const stickerIndex = favoriteStickers.findIndex((cachedSticker) => cachedSticker.sticker_id === id);
        const isStickerFavorite = stickerIndex !== -1;
        if (!isStickerFavorite) {
            return;
        }
        const changedFavoriteStickers = [...favoriteStickers];
        changedFavoriteStickers.splice(stickerIndex, 1);
        setFavoriteStickers(changedFavoriteStickers);
        api.cache.favoriteStickers.set(changedFavoriteStickers);
    };
    const getGroupIndex = (id) => id
        ? packsGroups?.findIndex((group) => {
            if (!Array.isArray(group)) {
                group = [group];
            }
            return group.includes(id);
        })
        : undefined;
    const isServiceStockItem = (id) => id !== undefined && id !== null && id < 0;
    const isGroupedStockItem = (id) => packsGroups && id !== undefined && !packsGroups.includes(id);
    return {
        ...stickersKeyboardContext,
        addToFavorite,
        getGroupIndex,
        removeFromFavorite,
        isServiceStockItem,
        isGroupedStockItem,
    };
}
export const StickersKeyboardSelectContext = createContext({});
export function useStickersKeyboardSelect() {
    return useContext(StickersKeyboardSelectContext);
}
//# sourceMappingURL=stickersKeyboard.js.map