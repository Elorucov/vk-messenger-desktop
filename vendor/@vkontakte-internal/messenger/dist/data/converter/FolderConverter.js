import * as Peer from '../../core/model/Peer';
import * as Folder from '../../core/model/Folder';
export function fromApiFolder(folder) {
    const peerIds = folder.included_peer_ids?.map(Peer.resolveId);
    return {
        ...getDefaults(peerIds, folder.included_lists),
        ...Folder.convertFlags(folder.flags),
        id: Folder.resolveId(folder.id),
        name: folder.name,
    };
}
export function fromEngineFolder(update) {
    const [, folderId, name, , flags] = update;
    return {
        ...getDefaults(),
        ...Folder.convertFlags(flags || 0),
        id: Folder.resolveId(folderId),
        name,
    };
}
export function fromApiFolderRecommended(folder) {
    return {
        name: folder.name,
        type: folder.type,
        description: folder.description,
        isHidden: !!folder.is_hidden,
    };
}
function getDefaults(peerIds, sublists) {
    return {
        unreadCount: 0,
        unreadUnmutedCount: 0,
        peerIds: new Set(peerIds),
        sublists: new Set(sublists || []),
        all: {
            boundaryMinorId: Infinity,
            // по умолчанию считаем, что в папке что-то есть
            hasMore: true,
        },
        unread: {
            boundaryMinorId: Infinity,
            // по умолчанию считаем, что в папке что-то есть
            hasMore: true,
        },
    };
}
//# sourceMappingURL=FolderConverter.js.map