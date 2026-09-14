export async function reloadPhotoEditorStickers() {
    try {
        const response = (await this.options.api.photos.getEditorStickers());
        this.photoEditorStickers.set(response.items);
    }
    catch { }
    return true;
}
//# sourceMappingURL=reload.js.map