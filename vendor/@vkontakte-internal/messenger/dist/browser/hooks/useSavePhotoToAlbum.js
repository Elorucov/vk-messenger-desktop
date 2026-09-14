import React from 'react';
import { useBrowserEnv } from '../hooks/misc';
import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from '../hooks/useSnackbar';
import { Icon24CheckCircleOutline } from '@vkontakte/icons';
import { useApiFetch } from '../hooks/useApiFetch';
/**
 * Сохраняет фотографию в альбом "Сохранённые фото"
 */
export function useSavePhotoToAlbum({ photo }) {
    const { lang } = useBrowserEnv();
    const snackbar = useSnackbar();
    const apiFetch = useApiFetch();
    const [isSaved, setSaved] = useState(false);
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(false);
        setSaved(false);
    }, [photo?.id, photo?.ownerId]);
    const savePhotoToAlbum = useCallback(async () => {
        if (isLoading || !photo) {
            return;
        }
        setLoading(true);
        try {
            await apiFetch('photos.copy', {
                photo_id: photo.id,
                owner_id: photo.ownerId,
                access_key: photo.accessKey,
            });
            snackbar({
                message: lang.use('me_photo_save_to_album_saved'),
                before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
            });
            setSaved(true);
        }
        catch {
            snackbar({
                message: lang.use('me_photo_save_to_album_error'),
            });
        }
        finally {
            setLoading(false);
        }
    }, [apiFetch, isLoading, photo, snackbar, lang]);
    return {
        savePhotoToAlbum,
        isLoading,
        isSaved,
    };
}
//# sourceMappingURL=useSavePhotoToAlbum.js.map