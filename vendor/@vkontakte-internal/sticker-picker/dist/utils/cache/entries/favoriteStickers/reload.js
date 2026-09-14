export async function reloadFavoriteStickers() {
    let favoriteStickers = null;
    try {
        const stickers = await this.options.api.store.getFavoriteStickers();
        favoriteStickers = stickers.items;
    }
    catch { }
    if (!favoriteStickers) {
        return false;
    }
    await this.favoriteStickers.set(favoriteStickers);
    return true;
}
//# sourceMappingURL=reload.js.map