import { chunkArray } from '@vkontakte/vkjs';
const loadedChunksCache = new Map();
export async function reloadStockItems({ chunkSize = 25, cachedStockItems, actualPacksHashes }) {
    let loadedStockItemsChunks = loadedChunksCache.get(this.stickersSync.key);
    if (!loadedStockItemsChunks) {
        loadedStockItemsChunks = new Map();
        loadedChunksCache.set(this.stickersSync.key, loadedStockItemsChunks);
    }
    // Проверяем закешированные продукты или загружаем из API при их отсутствии
    let expiredProductsIds = cachedStockItems?.reduce((expiredProductsIds, { product: { id }, version_hash }) => {
        const actualPackHash = actualPacksHashes?.find(({ pack_id }) => pack_id === id);
        if (!actualPackHash) {
            return expiredProductsIds;
        }
        const isExpired = actualPackHash.hash !== version_hash;
        if (isExpired) {
            expiredProductsIds.push(id);
        }
        return expiredProductsIds;
    }, []);
    const expiredProductIdsReloaded = !expiredProductsIds;
    if (expiredProductIdsReloaded) {
        try {
            const { items } = await this.options.api.store.getProducts({
                type: 'stickers',
                filters: 'purchased',
            });
            expiredProductsIds = items.map(({ id }) => id);
        }
        catch (err) {
            expiredProductsIds = undefined;
        }
    }
    if (!expiredProductsIds?.length) {
        return true;
    }
    await this.stickers.set(new Map());
    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
    let reloadedStockItems = await Promise.all(chunkArray(expiredProductsIds, chunkSize).map((chunk) => {
        const productIds = String(chunk);
        return (loadedStockItemsChunks?.get(productIds) ||
            this.options.api.store
                .getStockItems({
                type: 'stickers',
                product_ids: productIds,
            })
                // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
                .then((response) => {
                loadedStockItemsChunks?.set(productIds, response);
                return response;
            }));
    }))
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        .then((responses) => responses
        .reduce((stockItems, { items }) => {
        stockItems.push(...items);
        return stockItems;
    }, [])
        // Некоторые наборы (93) могут приходить пустым массивом, убираем их
        .filter((item) => !Array.isArray(item)))
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        .catch(() => null);
    if (!reloadedStockItems) {
        return false;
    }
    // Если кеш не пустой меняем измененные продукты в нем, иначе напрямую сохраняем список
    if (cachedStockItems?.length) {
        const reloadedStockItemsByProductId = new Map(reloadedStockItems.map((stockItem) => [stockItem.product.id, stockItem]));
        cachedStockItems = cachedStockItems.map((cachedStockItem) => reloadedStockItemsByProductId.get(cachedStockItem.product.id) || cachedStockItem);
        reloadedStockItems = cachedStockItems;
    }
    // Сортируем наборы в том же порядке, что и у пользователя
    if (reloadedStockItems && expiredProductsIds && expiredProductIdsReloaded) {
        reloadedStockItems = reloadedStockItems.sort(({ product: { id: a } }, { product: { id: b } }) => Number(expiredProductsIds?.indexOf(a)) - Number(expiredProductsIds?.indexOf(b)));
    }
    await this.stockItems.set(reloadedStockItems);
    loadedChunksCache.delete(this.stickersSync.key);
    return true;
}
//# sourceMappingURL=reload.js.map