import { CONTEXT } from '../../../../model/context';
export async function reloadGlobal(full) {
    if (this.reloading) {
        return true;
    }
    this.setReloading(true);
    const global = await this.global.get();
    let [actualHashes, cachedStockItems, cachedImageConfigs] = await Promise.all([
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
        this.options.api.store
            .hasNewItems({
            type: 'stickers',
            // Нужно всегда передавать этот параметр для получения хешей продуктов
            // При пустом кеше отправится undefined значение - это нормально
            version_hash: String(global?.stickers_version_hash),
        })
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
            .catch(() => null),
        this.stockItems.get(),
        this.imageConfigs.get(),
    ]);
    if (!actualHashes) {
        this.setReloading(false);
        return false;
    }
    actualHashes.sticker_packs_version_hashes ||= global?.sticker_packs_version_hashes;
    const { stickers_version_hash, sticker_packs_version_hashes, favorite_stickers_version_hash, image_configs_version_hash, sticker_packs_chunk_size_limit, vmoji_promotion, } = actualHashes;
    // Сбрасываем устаревший кеш локально
    if (stickers_version_hash !== global?.stickers_version_hash || full) {
        cachedStockItems = null;
        await this.stickers.set(new Map());
    }
    const reloadTasks = [
        this.reloadStockItems({
            cachedStockItems: full ? null : cachedStockItems,
            actualPacksHashes: full ? undefined : sticker_packs_version_hashes,
            chunkSize: sticker_packs_chunk_size_limit,
        }),
        this.reloadUGC(),
        this.reloadVmoji(),
        this.reloadRecentStickers(),
    ];
    if (this.options.context === CONTEXT.PHOTO_EDITOR) {
        reloadTasks.push(this.reloadPhotoEditorStickers());
    }
    if (favorite_stickers_version_hash !== global?.favorite_stickers_version_hash || full) {
        reloadTasks.push(this.reloadFavoriteStickers());
    }
    if (!cachedImageConfigs || image_configs_version_hash !== global?.image_configs_version_hash || full) {
        reloadTasks.push(this.reloadImageConfigs());
    }
    const isNeedClearAllHelpHint = !vmoji_promotion?.avatar_suggestion?.character_id;
    const isNeedReloadHelpHint = !isNeedClearAllHelpHint &&
        vmoji_promotion?.avatar_suggestion?.character_id !==
            global?.vmoji_promotion?.avatar_suggestion?.character_id;
    if (isNeedReloadHelpHint) {
        reloadTasks.push(this.reloadHelpHint());
    }
    else if (isNeedClearAllHelpHint) {
        this.clearAllHelpHint();
    }
    const reloadStatuses = await Promise.all(reloadTasks);
    this.setReloading(false);
    const isSuccess = reloadStatuses.findIndex((isSuccess) => !isSuccess) === -1;
    if (isSuccess && actualHashes) {
        this.global.set(actualHashes);
        this.stickersSync.notify(undefined, true);
    }
    return isSuccess;
}
//# sourceMappingURL=reload.js.map