export async function getStockItems({ active }) {
    let stockItems = await this.stockItems.get();
    if (stockItems) {
        stockItems = stockItems.sort(({ product: { vmoji_avatar: a } }, { product: { vmoji_avatar: b } }) => Number(Boolean(b)) - Number(Boolean(a)));
        if (active) {
            stockItems = stockItems.filter(({ product }) => product.active);
        }
    }
    return stockItems;
}
//# sourceMappingURL=get.js.map