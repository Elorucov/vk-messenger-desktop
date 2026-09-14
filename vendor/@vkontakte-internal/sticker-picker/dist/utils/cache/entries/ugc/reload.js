import { Ranges } from '@vkontakte-internal/shared';
import { isUgcStickersEnabled } from '../../../userEnv';
export async function reloadUGC(ownerGlobalId) {
    if (!isUgcStickersEnabled()) {
        this.clearUGC();
        return true;
    }
    const { peerId } = this.options;
    if (!peerId || !Ranges.isChatOrChannelPeer(peerId)) {
        return true;
    }
    const cachedPacks = await this.ugcPacks.get();
    let peerPacksHashes;
    try {
        const response = await this.options.api.stickers.getUGCPackLists({
            owner_ids: String(peerId),
            owner_global_ids: ownerGlobalId,
        });
        peerPacksHashes = response.lists[0];
    }
    catch { }
    if (!peerPacksHashes) {
        this.ugcInfo.delete();
        this.ugcPacks.delete();
        return true;
    }
    this.ugcInfo.set(peerPacksHashes);
    const { items } = peerPacksHashes;
    if (!items.length) {
        this.ugcPacks.delete();
        return true;
    }
    const cachedPacksHashes = cachedPacks ? new Map(cachedPacks.map(({ id, hash }) => [id, hash])) : undefined;
    const expiredPacksIds = items.reduce((expiredPacksIds, { pack_id, hash }) => {
        const cachedHash = cachedPacksHashes?.get(pack_id);
        if (cachedHash !== hash) {
            expiredPacksIds.push(pack_id);
        }
        return expiredPacksIds;
    }, []);
    if (!expiredPacksIds.length) {
        return true;
    }
    let packs;
    try {
        const response = await this.options.api.stickers.getUGCPacks({
            owner_id: peerId,
            pack_ids: String(expiredPacksIds),
        });
        packs = response.packs;
    }
    catch { }
    if (!packs) {
        return true;
    }
    this.ugcPacks.set(packs);
    return true;
}
//# sourceMappingURL=reload.js.map