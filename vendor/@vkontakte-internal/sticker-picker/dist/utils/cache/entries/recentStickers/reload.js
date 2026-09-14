export async function reloadRecentStickers() {
    let recentStickers = null;
    try {
        const response = await this.options.api.messages.getRecentStickers();
        recentStickers = response.items;
    }
    catch { }
    if (recentStickers) {
        this.recentStickers.set(recentStickers);
    }
    return true;
}
//# sourceMappingURL=reload.js.map