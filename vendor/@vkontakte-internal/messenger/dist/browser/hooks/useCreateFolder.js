import * as Folder from '../../core/model/Folder';
import { useBrowserEnv, useDispatch } from './misc';
import { IApi } from '../../data/env/IApi';
import { API_ERROR_MESSAGES_FOLDERS_LIMIT_REACHED } from '@vkontakte-internal/api-schema-typescript';
import { isDev } from '../../core/utils/misc';
import { useSnackbar } from './useSnackbar';
import { useCallback, useState } from 'react';
import { useApiFetch } from '../hooks/useApiFetch';
export function useCreateFolder() {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const apiFetch = useApiFetch();
    const [isLoading, setIsLoading] = useState(false);
    const createFolder = useCallback(async ({ folderName, folderType, addedPeers = [], onCreated, onError, }) => {
        try {
            setIsLoading(true);
            const response = await apiFetch('messages.createFolder', {
                name: folderName,
                // @ts-expect-error Раньше type был string, теперь это enum с недостающим значением
                type: folderType,
                included_peer_ids: Array.from(addedPeers).join(','),
            });
            dispatch({
                type: 'UserCreatedFolder',
                name: folderName,
                folderType: folderType,
                peerIds: Array.from(addedPeers),
                folderId: Folder.resolveId(response.folder_id),
            });
            onCreated?.(Folder.resolveId(response.folder_id));
        }
        catch (error) {
            if (error instanceof IApi.RequestError &&
                error.code === API_ERROR_MESSAGES_FOLDERS_LIMIT_REACHED) {
                snackbar({
                    message: lang.use('me_folders_limit_reached'),
                    autoClose: true,
                    duration: 4000,
                });
            }
            else if (isDev) {
                throw new Error('Не удалось создать папку');
            }
            onError?.();
        }
        finally {
            setIsLoading(false);
        }
    }, [apiFetch, dispatch, lang, snackbar]);
    return {
        createFolder,
        isLoading,
    };
}
//# sourceMappingURL=useCreateFolder.js.map