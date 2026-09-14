export async function getStickers(stickersIds) {
    if (!stickersIds.length) {
        return [];
    }
    const stickers = (await this.stickers.get()) ?? new Map();
    // Если все стикеры в кеше, вернем их
    const unloadedStickersIds = [];
    let loadedStickers = [];
    for (const stickerId of stickersIds) {
        const loadedSticker = stickers.get(stickerId);
        if (!loadedSticker) {
            unloadedStickersIds.push(stickerId);
            continue;
        }
        loadedStickers.push(loadedSticker);
    }
    if (!unloadedStickersIds.length) {
        return loadedStickers;
    }
    // Если есть незагруженные стикеры, то сходим за ними, положим в кеш и сформируем массив заново
    const unloadedStickers = await this.options.api.store.getStickers({
        sticker_ids: String(unloadedStickersIds.join(',')),
    });
    for (const unloadedSticker of unloadedStickers) {
        if (!unloadedSticker.sticker_id) {
            continue;
        }
        stickers.set(unloadedSticker.sticker_id, unloadedSticker);
    }
    this.stickers.set(stickers);
    loadedStickers = [];
    for (const stickerId of stickersIds) {
        const cachedSticker = stickers.get(stickerId);
        if (!cachedSticker) {
            continue;
        }
        loadedStickers.push(cachedSticker);
    }
    return loadedStickers;
}
//# sourceMappingURL=get.js.map