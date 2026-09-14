import { photosGetAllImages } from '../../services/backend';
import { HEIGHT, WIDTH } from './constants';
const mapPhotoSizes = (photo) => {
    return photo.sizes?.reduce((acc, size) => {
        acc[size.type] = size.url;
        return acc;
    }, {});
};
export const getMaxPhotoSizeUrl = (photo) => {
    const sizes = mapPhotoSizes(photo);
    return sizes?.x || sizes?.m || sizes?.s || '';
};
export const getPreviewPhotoSizeUrl = (photo) => {
    const sizes = mapPhotoSizes(photo);
    return sizes?.o || sizes?.p || sizes?.q || sizes?.x || sizes?.s || '';
};
export const getPhotoById = (photoId, storedPhotos) => {
    if (storedPhotos) {
        const storedPhoto = storedPhotos.find(({ id }) => id === photoId);
        if (storedPhoto) {
            return Promise.resolve({
                id: storedPhoto.id,
                url: storedPhoto.originalUrl,
            });
        }
    }
    return photosGetAllImages({ photo_ids: `${photoId}` }).then((data) => {
        try {
            const photo = data.items[0];
            return photo
                ? {
                    id: photo.id,
                    url: getMaxPhotoSizeUrl(photo),
                }
                : null;
        }
        catch {
            return null;
        }
    });
};
export const getMediaStreamDimensions = (stream) => {
    const videoTrack = stream.getVideoTracks()[0];
    const { width = WIDTH, height = HEIGHT } = videoTrack.getSettings();
    return { width, height };
};
//# sourceMappingURL=utils.js.map