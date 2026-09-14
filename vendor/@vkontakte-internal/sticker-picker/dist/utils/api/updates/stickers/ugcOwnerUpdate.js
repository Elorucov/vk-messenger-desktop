export function stickersUGCOwnerUpdateHandler({ detail: { owner_global_id } }) {
    this.cache.reloadUGC(owner_global_id);
}
//# sourceMappingURL=ugcOwnerUpdate.js.map