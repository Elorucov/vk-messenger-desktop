const queues = new Map();
const activeReleases = new Set();
export async function stickersUGCStickerUpdateHandler({ detail: { stickers } }) {
    const { peerId } = this.cache.options;
    stickers.forEach((sticker) => {
        if (sticker.owner_id !== peerId) {
            return;
        }
        let queue = queues.get(peerId);
        if (!queue) {
            queue = [];
            queues.set(peerId, queue);
        }
        const queuedStickerIndex = queue.findIndex((queuedSticker) => queuedSticker.id === sticker.id &&
            queuedSticker.pack_id === sticker.pack_id &&
            queuedSticker.owner_id === sticker.owner_id);
        if (queuedStickerIndex !== -1) {
            queue[queuedStickerIndex] = sticker;
        }
        else {
            queue.push(sticker);
        }
    });
    releaseQueue.call(this);
}
async function releaseQueue() {
    const { peerId } = this.cache.options;
    if (!peerId || activeReleases.has(peerId)) {
        return;
    }
    const stickers = queues.get(peerId);
    if (!stickers?.length) {
        return;
    }
    activeReleases.add(peerId);
    queues.delete(peerId);
    const packs = await this.cache.ugcPacks.get();
    if (!packs?.length) {
        return;
    }
    const packsMap = new Map(packs.map((pack) => [pack.id, pack]));
    stickers.forEach((sticker) => {
        const { id, pack_id } = sticker;
        if (pack_id === undefined) {
            return;
        }
        const pack = packsMap.get(pack_id);
        if (!pack) {
            return;
        }
        const stickerIndex = pack.stickers.findIndex((sticker) => sticker.id === id);
        if (stickerIndex === -1) {
            return;
        }
        pack.stickers[stickerIndex] = sticker;
    });
    try {
        await this.cache.ugcPacks.set(packs);
    }
    catch { }
    activeReleases.delete(peerId);
    // Зацикливаем вызов, в момент изменения набора выше, могли прийти дополнительные ивенты
    // обработка которых была специально пропущена
    releaseQueue.call(this);
}
//# sourceMappingURL=ugcStickerUpdate.js.map