export async function updateStockItems(value, options) {
    let stockItems = await this.stockItems.get();
    if (stockItems) {
        const stockItemsMap = new Map(stockItems.map((stockItem) => {
            const { product: { id }, } = stockItem;
            return [id, stockItem];
        }));
        value.forEach((stockItem) => {
            const { product: { id }, } = stockItem;
            stockItemsMap.set(id, stockItem);
        });
        stockItems = [...stockItemsMap.values()];
    }
    return this.stockItems.set(stockItems || value, options);
}
//# sourceMappingURL=update.js.map