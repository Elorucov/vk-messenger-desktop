import { useCallback } from 'react';
import { useLang } from '../../hooks/useLang';
import { useUploadImageReducer } from './useUploadImageReducer';
import { UploadPhoto } from '../../utils/uploadPhoto';
import { BROADCAST_THUMB_AVAILABLE_FORMATS } from './constants';
import { saveUploadedThumb, updateVideoThumb } from '../../services/backend';
const MAX_SIZE = 2 ** 21; // 2mb to bytes
export const useUploadImage = ({ url, ownerId, videoId }) => {
    const { getLang } = useLang();
    const { state, setImgSrc, clearState, setError, setProgress } = useUploadImageReducer();
    const { imgSrc, error, progress } = state;
    const onImageChange = useCallback((e) => {
        clearState();
        if (!e.target.files) {
            // Не удалось загрузить обложку. Попробуйте ещё раз.
            setError(getLang('calls_planning_translation_upload_image_error_common'));
            return;
        }
        const file = e.target.files[0];
        const [fileType, fileFormat] = file.type.split('/');
        if (fileType !== 'image') {
            // Файл обложки должен быть в формате JPG, JPEG или PNG
            setError(getLang('calls_planning_translation_upload_image_error_format'));
            return;
        }
        if (!BROADCAST_THUMB_AVAILABLE_FORMATS.includes(fileFormat)) {
            // Файл обложки должен быть в формате JPG, JPEG или PNG
            setError(getLang('calls_planning_translation_upload_image_error_format'));
            return;
        }
        if (file.size > MAX_SIZE) {
            // Максимальный размер файла обложки — 2 МБ
            setError(getLang('calls_planning_translation_upload_image_error_size'));
            return;
        }
        setProgress(1);
        const photoLoader = new UploadPhoto({ url }, (loaded, total) => {
            setProgress?.((loaded / total) * 100);
        });
        photoLoader
            .upload(file, url, 'photo')
            .then((response) => {
            return saveUploadedThumb({
                thumb_json: JSON.stringify(response),
                owner_id: Number(ownerId),
                video_id: Number(videoId),
            });
        })
            .then(({ image, photo_owner_id, photo_id, photo_hash }) => {
            if (image?.length) {
                const minImage = image
                    .filter((image) => !image.with_padding)
                    .reduce((acc, item) => {
                    return acc.width > item.width ? item : acc;
                });
                setImgSrc(minImage.url);
            }
            return updateVideoThumb({
                video_id: Number(videoId),
                thumb_hash: photo_hash,
                thumb_id: `${photo_id}_${photo_owner_id}`,
                owner_id: Number(ownerId),
            });
        })
            .catch(() => {
            setProgress(0);
            // Не удалось загрузить обложку. Попробуйте ещё раз.
            setError(getLang('calls_planning_translation_upload_image_error_common'));
        });
    }, [url]);
    return {
        onImageChange,
        uploadImageError: error,
        imgSrc,
        handleImageRemove: clearState,
        progress,
        setImgSrc,
    };
};
//# sourceMappingURL=useUploadImage.js.map