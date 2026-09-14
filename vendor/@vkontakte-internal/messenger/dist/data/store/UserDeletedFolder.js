import * as Folder from '../../core/model/Folder';
import * as Queue from '../../core/model/Queue';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserDeletedFolder': {
            const { folderId } = action;
            const folderType = draft.organisers.folders.find((f) => f.id === folderId)?.type;
            if (draft.locks.deleteFolder.has(folderId)) {
                return [];
            }
            draft.locks.deleteFolder.add(folderId);
            if (folderType === 'managed_groups') {
                Queue.deleteQueueId(draft.activeQueueIds, Queue.MANAGED_GROUPS_COUNTERS_QUEUE);
            }
            // Оптимистично удаляем папку
            Folder.deleteFolder(draft.organisers.folders, folderId);
            return [
                async function deleteFolder({ api, queue }) {
                    try {
                        const response = await api.fetch('messages.deleteFolder', {
                            folder_id: folderId,
                        });
                        if (folderType === 'managed_groups') {
                            queue.reconnect();
                        }
                        return {
                            type: 'UserDeletedFolder_DeleteRequestCompleted',
                            hasFailed: response !== 1,
                            folderId: folderId,
                        };
                    }
                    catch (error) {
                        return {
                            type: 'UserDeletedFolder_DeleteRequestCompleted',
                            hasFailed: true,
                            folderId: folderId,
                        };
                    }
                },
                async function updateCounters() {
                    if (folderType === 'managed_groups' || folderType === 'channels') {
                        return { type: 'CountersUpdate' };
                    }
                    return { type: 'Noop' };
                },
            ];
        }
        case 'UserDeletedFolder_DeleteRequestCompleted': {
            const { hasFailed, folderId } = action;
            draft.locks.deleteFolder.delete(folderId);
            if (hasFailed && isDev) {
                throw new Error('Не удалось удалить папку');
            }
            return [];
        }
        case 'CountersUpdate': {
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserDeletedFolder.js.map