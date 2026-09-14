import { useCallback, useEffect, useRef, useState } from 'react';
import { useTypedDispatch } from './useTypedDispatch';
import { photosDelete, photosGetAllImages, photosSaveBackgroundPhoto } from '../services/backend';
import { E_ACTION } from '../constants';
import { useSendStatsDataVirtualBackground } from './useSendStatsDataVirtualBackground';
import { useIsAnonymous } from './useIsAnonymous';
import { handlePromiseError } from '../helpers/logger';
export const useUserBackgrounds = ({ photos, onSuccessPhotoUpload, isSferum }) => {
    const dispatch = useTypedDispatch();
    const { sendVirtualBackgroundAdded, sendVirtualBackgroundDeleted } = useSendStatsDataVirtualBackground();
    const { isAnonymous } = useIsAnonymous();
    /** фотографии, которые пользователь удалил */
    const deletedPhotos = useRef([]);
    /** индикатор загрузки фото на сервер */
    const [loadingUpload, setLoadingUpload] = useState(false);
    /** on-mount */
    useEffect(() => {
        if (!photos.length && !isAnonymous && !isSferum) {
            // then try to fetch
            photosGetAllImages()
                .then((data) => {
                dispatch({
                    type: E_ACTION.VB_SET_USER_PHOTOS,
                    /** тут как то поймал undefined, поэтому проверяем */
                    photos: sortByDate(data.items || []),
                });
            })
                .catch(handlePromiseError);
        }
    }, []);
    /** коллбек при нажатии на "крестик" */
    const onDeleteBackground = useCallback((photoId) => {
        const photo = photos.find((photo) => photo.id === photoId);
        if (!photo) {
            return;
        }
        // сохраняем фотографию в кеше
        deletedPhotos.current.push(photo);
        // удаляем фотографию из стора
        dispatch({
            type: E_ACTION.VB_REMOVE_USER_PHOTO,
            photoId,
        });
    }, [photos]);
    /** коллбек, при сохранении настроек */
    const onSaveSettings = useCallback(() => {
        // cleanup
        const dPhotos = deletedPhotos.current;
        deletedPhotos.current = [];
        // удаляем удаленные фоны
        return deletePhotos(dPhotos, sendVirtualBackgroundDeleted);
    }, [sendVirtualBackgroundDeleted]);
    /**
     * коллбек при сбросе настроек
     *
     * 1. восстанавливает удаленные фотографии
     * 2. удаляем добавленные (залитые)
     */
    const onCancelSettings = useCallback(() => {
        // cleanup
        const dPhotos = deletedPhotos.current;
        deletedPhotos.current = [];
        const nextPhotos = photos
            // восстанавливаем удаленные
            .concat(dPhotos);
        dispatch({
            type: E_ACTION.VB_SET_USER_PHOTOS,
            photos: sortByDate(nextPhotos),
        });
    }, [photos]);
    /** коллбек при добавлении фотографии */
    const onAddBackground = useCallback((file) => {
        setLoadingUpload(true);
        return photosSaveBackgroundPhoto(file)
            .then((data) => {
            /** @todo fix backend types */
            const photo = data[0];
            if (!photo) {
                /** @todo ? */
                throw new Error('Something wrong with uploaded photo');
            }
            // добавляем изображение в стор
            dispatch({
                type: E_ACTION.VB_ADD_USER_PHOTO,
                photo,
            });
            // отдаём коллбеку загруженное фото
            onSuccessPhotoUpload?.(photo);
            // высылаем статистику
            sendVirtualBackgroundAdded(photo.id);
            return photo;
        })
            .finally(() => {
            setLoadingUpload(false);
        });
    }, [onSuccessPhotoUpload, sendVirtualBackgroundAdded]);
    return {
        photos,
        onAddBackground,
        onDeleteBackground,
        onSaveSettings,
        onCancelSettings,
        loadingUpload,
    };
};
/**
 * !!! мутирует параметр
 *
 * сортирует объекты по дате создани (от новых к старым)
 */
function sortByDate(photos) {
    return photos.sort((a, b) => (a.date < b.date ? 1 : -1));
}
/** хелпер для удаления фотографий и отправки статистики по ним */
function deletePhotos(photos, onSuccess) {
    const promises = photos.map((photo) => {
        return photosDelete({ photo_id: photo.id });
    });
    return Promise.allSettled(promises)
        .then((results) => {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                onSuccess(photos[index].id);
            }
        });
    })
        .catch(handlePromiseError);
}
//# sourceMappingURL=useUserBackgrounds.js.map