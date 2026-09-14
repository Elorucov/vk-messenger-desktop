import { SyncAtomType, createSyncStore, createAsyncStore, } from '@vkontakte-internal/browser-store';
import { clearUGC } from './entries/ugc/clear';
import { reloadUGC } from './entries/ugc/reload';
import { reloadVmoji } from './entries/vmoji/reload';
import { getStickers } from './entries/stickers/get';
import { hideHelpHint } from './entries/helpHint/hide';
import { reloadGlobal } from './entries/global/reload';
import { getStockItems } from './entries/stockItems/get';
import { reloadHelpHint } from './entries/helpHint/reload';
import { loadStockItems } from './entries/stockItems/load';
import { reloadStockItems } from './entries/stockItems/reload';
import { updateStockItems } from './entries/stockItems/update';
import { markHelpHintAsViewed } from './entries/helpHint/viewed';
import { hideUGCOnboarding } from './entries/ugc/hideOnboarding';
import { reloadImageConfigs } from './entries/imageConfigs/reload';
import { reloadRecentStickers } from './entries/recentStickers/reload';
import { reloadPhotoEditorStickers } from './entries/photoEditorStickers/reload';
import { clearVmojiPromotionDot } from './entries/vmoji/clearPromotionDot';
import { reloadFavoriteStickers } from './entries/favoriteStickers/reload';
import { clearAllHelpHint, clearHelpHintById } from './entries/helpHint/clear';
export class Cache {
    constructor(options) {
        this.isReloading = false;
        this.listeners = new Set();
        /**
         * Полностью перезагружает кеш
         */
        this.reload = reloadGlobal.bind(this);
        /**
         * Перезагружает vmoji
         */
        this.reloadVmoji = reloadVmoji.bind(this);
        /**
         * Очищает индикатор для новинок vmoji
         */
        this.clearVmojiPromotionDot = clearVmojiPromotionDot.bind(this);
        /**
         * Получает набор стикеров из API
         */
        this.getStockItem = loadStockItems.bind(this);
        /**
         * Получает наборы стикеров из кеша
         */
        this.getStockItems = getStockItems.bind(this);
        /**
         * Обновляет наборы стикеров
         */
        this.updateStockItems = updateStockItems.bind(this);
        /**
         * Перезагружает наборы стикеров
         */
        this.reloadStockItems = reloadStockItems.bind(this);
        /**
         * Перезагружает наборы UGC-стикеров
         */
        this.reloadUGC = reloadUGC.bind(this);
        /**
         * Отчищает наборы UGC-стикеров
         */
        this.clearUGC = clearUGC.bind(this);
        /**
         * Скрывает онбординг UGC-стикеров
         */
        this.hideUGCOnboarding = hideUGCOnboarding.bind(this);
        /**
         * Перезагружает недавние стикеры
         */
        this.reloadRecentStickers = reloadRecentStickers.bind(this);
        /**
         * Перезагружает стикеры фото-редактора и паблишера историй
         */
        this.reloadPhotoEditorStickers = reloadPhotoEditorStickers.bind(this);
        /**
         * Перезагружает избранные стикеры
         */
        this.reloadFavoriteStickers = reloadFavoriteStickers.bind(this);
        /**
         * Перезагружает конфиги изображений
         */
        this.reloadImageConfigs = reloadImageConfigs.bind(this);
        /**
         * Возвращает стикеры по идентификаторам
         */
        this.getStickers = getStickers.bind(this);
        /**
         * Перезагружает хинты
         */
        this.reloadHelpHint = reloadHelpHint.bind(this);
        /**
         * Очищаем хинт по id
         */
        this.clearHelpHintById = clearHelpHintById.bind(this);
        /**
         * Очищаем все хинты
         */
        this.clearAllHelpHint = clearAllHelpHint.bind(this);
        /**
         * Скрываем хинт
         */
        this.hideHelpHint = hideHelpHint.bind(this);
        /**
         * Увеличиваем счетчик показа хинта
         */
        this.markHelpHintAsViewed = markHelpHintAsViewed.bind(this);
        const { userId, peerId } = options;
        this.options = options;
        const stickersSync = createSyncStore({
            dbName: 'stickers',
            storeName: String(userId),
            version: 1,
        });
        const stickersAsync = createAsyncStore({
            dbName: 'stickers',
            storeName: String(userId),
            version: 1,
        });
        this.stickersSync = stickersSync;
        this.stickersAsync = stickersAsync;
        this.global = stickersAsync.createAtom('global');
        this.stockItems = stickersAsync.createAtom('stockItems');
        this.imageConfigs = stickersAsync.createAtom('imageConfigs');
        this.recentStickers = stickersAsync.createAtom('recentStickers');
        this.photoEditorStickers = stickersAsync.createAtom('photoEditorStickers');
        this.favoriteStickers = stickersAsync.createAtom('favoriteStickers');
        this.avatarSuggestion = stickersAsync.createAtom('avatarSuggestion');
        this.stickers = stickersAsync.createAtom('stickers');
        this.hasAvatar = stickersSync.createAtom('hasAvatar', SyncAtomType.BOOLEAN);
        this.recentEmoji = stickersSync.createAtom('recentEmoji', SyncAtomType.OBJECT);
        this.tabbarActiveTab = stickersSync.createAtom('tabbarActiveTab', SyncAtomType.STRING);
        this.stickersActiveTab = stickersSync.createAtom('stickersActiveTab', SyncAtomType.NUMBER);
        this.newAvatarSuggestionCounter = stickersSync.createAtom('newAvatarSuggestionCounter', SyncAtomType.NUMBER);
        const ugcAsync = createAsyncStore({
            dbName: 'stickers-ugc',
            storeName: `${userId}-${peerId}`,
            version: 1,
        });
        this.ugcAsync = ugcAsync;
        this.ugcInfo = ugcAsync.createAtom('ugcInfo');
        this.ugcPacks = ugcAsync.createAtom('ugcPacks');
        this.getStickersImageConfigs = this.imageConfigs.get.bind(this.imageConfigs);
    }
    /**
     * Подписывает на обновления хранилища
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    get reloading() {
        return this.isReloading;
    }
    setReloading(state) {
        this.isReloading = state;
    }
    destroy() {
        this.stickersSync.destroy();
        this.stickersAsync.destroy();
    }
}
//# sourceMappingURL=index.js.map