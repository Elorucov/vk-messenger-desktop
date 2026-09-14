export async function reloadVmoji() {
    const hasVmoji = this.hasAvatar.get();
    if (hasVmoji) {
        return true;
    }
    try {
        const response = await this.options.api.vmoji.getAvatar();
        this.hasAvatar.set(Boolean(response.characters?.length));
    }
    catch { }
    return true;
}
//# sourceMappingURL=reload.js.map