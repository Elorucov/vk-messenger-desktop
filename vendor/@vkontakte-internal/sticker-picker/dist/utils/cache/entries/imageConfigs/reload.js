export async function reloadImageConfigs() {
    let imageConfigs = null;
    try {
        imageConfigs = await this.options.api.store.getStickersImageConfigs();
    }
    catch { }
    if (!imageConfigs) {
        return false;
    }
    this.imageConfigs.set(imageConfigs);
    return true;
}
//# sourceMappingURL=reload.js.map