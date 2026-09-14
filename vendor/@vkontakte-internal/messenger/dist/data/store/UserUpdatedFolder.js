import * as Folder from '../../core/model/Folder';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { addConvosToFolder, getConvosByIds, removeConvosFromFolder, } from './State';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserUpdatedFolder': {
            const { folderId, name, addPeerIds, removePeerIds } = action;
            if (draft.locks.updateFolder.has(folderId)) {
                return [];
            }
            if (hasSetsIntersection(addPeerIds, removePeerIds)) {
                throw new Error('Peer id не может одновременно находиться в списке на добавление и на удаление');
            }
            draft.locks.updateFolder.add(folderId);
            const folder = draft.organisers.folders.find((f) => f.id === folderId);
            if (!folder) {
                return [];
            }
            const removedConvos = getConvosByIds(draft, Array.from(removePeerIds));
            const addedConvos = getConvosByIds(draft, Array.from(addPeerIds));
            if (name) {
                Folder.setName(folder, name);
            }
            removeConvosFromFolder(draft, folder.id, removedConvos);
            addConvosToFolder(draft, folder.id, addedConvos);
            return [updateFolder(folderId, name, addPeerIds, removePeerIds)];
        }
        case 'UserUpdatedFolder_UpdateRequestCompleted': {
            const { hasFailed, folderId } = action;
            draft.locks.updateFolder.delete(folderId);
            if (hasFailed && isDev) {
                throw new Error('Не удалось изменить папку');
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
function updateFolder(folderId, name, addPeerIds, removePeerIds) {
    return async function updateFolder({ api }) {
        let hasFailed = false;
        const params = {
            folder_id: folderId,
        };
        if (name) {
            params.name = name;
        }
        if (addPeerIds.size) {
            params.add_included_peer_ids = [...addPeerIds].join(',');
        }
        if (removePeerIds.size) {
            params.remove_included_peer_ids = [...removePeerIds].join(',');
        }
        try {
            const response = await api.fetch('messages.updateFolder', params);
            hasFailed = response !== 1;
        }
        catch (e) {
            hasFailed = true;
        }
        return {
            type: 'UserUpdatedFolder_UpdateRequestCompleted',
            hasFailed,
            folderId,
            addPeerIds,
            removePeerIds,
            name,
        };
    };
}
function hasSetsIntersection(a, b) {
    const intersection = new Set([...a].filter((item) => b.has(item)));
    if (intersection.size) {
        return true;
    }
    return false;
}
//# sourceMappingURL=UserUpdatedFolder.js.map