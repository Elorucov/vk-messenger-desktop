import * as Folder from '../../core/model/Folder';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { IApi } from '../env/IApi';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'UserReorderedFolders': {
            const { order } = action;
            if (draft.locks.reorderFolders) {
                return [];
            }
            draft.locks.reorderFolders = true;
            Folder.reorderFolders(draft.organisers.folders, order);
            return [
                async function reorderFolders({ api }) {
                    try {
                        const response = await api.fetch('messages.reorderFolders', {
                            folder_ids: order.join(','),
                        });
                        return {
                            type: 'UserReorderedFolders_ReorderRequestCompleted',
                            hasFailed: response !== 1,
                            order: order,
                        };
                    }
                    catch (error) {
                        let errorCode;
                        if (error instanceof IApi.RequestError) {
                            errorCode = error.code;
                        }
                        return {
                            type: 'UserReorderedFolders_ReorderRequestCompleted',
                            hasFailed: true,
                            error: errorCode,
                            order: order,
                        };
                    }
                },
            ];
        }
        case 'UserReorderedFolders_ReorderRequestCompleted': {
            const { hasFailed } = action;
            draft.locks.reorderFolders = false;
            if (hasFailed) {
                if (action.error) {
                    /**
                     * TODO: Добавить вызов тоста с ошибкой, когда смержим
                     * https://gitlab.mvk.com/messenger/reforged/-/merge_requests/711
                     */
                }
                else if (isDev) {
                    throw new Error('Не удалось изменить порядок папок');
                }
                return [];
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=UserReorderedFolders.js.map