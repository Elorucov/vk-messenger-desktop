export async function loadStockItems({ productId, stickerId }) {
    const stockItems = await this.stockItems.get();
    let stockItem;
    if (stockItems) {
        if (productId) {
            stockItem = stockItems.find(({ product: { id } }) => id === productId);
        }
        if (stickerId && !stockItem) {
            stockItem = stockItems.find(({ product: { stickers } }) => stickers && stickers.findIndex(({ sticker_id }) => sticker_id === stickerId) !== -1);
        }
    }
    if (stockItem) {
        return stockItem;
    }
    if (productId) {
        try {
            stockItem = await this.options.api.store.getStockItemByProductId({
                type: 'stickers',
                product_id: String(productId),
            });
        }
        catch (err) {
            stockItem = undefined;
        }
    }
    if (stockItem) {
        this.updateStockItems([stockItem]);
        return stockItem;
    }
    if (stickerId) {
        try {
            stockItem = await this.options.api.store.getStockItemByStickerId({
                sticker_id: stickerId,
            });
        }
        catch (err) {
            stockItem = undefined;
        }
    }
    if (stockItem) {
        this.updateStockItems([stockItem]);
    }
    return stockItem;
}
//# sourceMappingURL=load.js.map