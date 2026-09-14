import { fromApiPhoto, fromApiVideo } from '../../../data/converter/AttachConverter';
import { toNonEmpty } from '../../../core/utils/misc';
import { useBrowserEnv, useCommunityMessagingWithToggle, useOwner, } from '../../hooks/misc';
import { useApiFetch } from '../../hooks/useApiFetch';
export function useVkcomMediaPickers(addAttaches, onError) {
    const { vkcom_me } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const owner = useOwner();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    if (!vkcom_me) {
        return {};
    }
    const fetchPhotoAttaches = async (photoIds) => {
        try {
            const response = await apiFetch('photos.getById', {
                photos: photoIds.join(','),
                extended: 1,
                photo_sizes: 1,
            });
            return response.reduce((acc, apiPhoto) => {
                const photo = fromApiPhoto({ apiPhoto });
                if (photo) {
                    acc.push(photo);
                }
                return acc;
            }, []);
        }
        catch {
            onError('me_photo_attach_error');
            return [];
        }
    };
    const onOpenPhotoPicker = vkcom_me.openPhotoPicker &&
        (() => vkcom_me.openPhotoPicker?.(async (photoIds) => {
            const photoAttaches = toNonEmpty(await fetchPhotoAttaches(photoIds));
            if (photoAttaches) {
                addAttaches({
                    photos: photoAttaches,
                });
            }
        }, owner.id));
    const fetchVideoAttaches = async (videoIds) => {
        try {
            const response = await apiFetch('video.get', {
                videos: videoIds.join(','),
                extended: 0,
            });
            return response.items.reduce((acc, apiVideo) => {
                const video = fromApiVideo({ apiVideo });
                if (video) {
                    acc.push(video);
                }
                return acc;
            }, []);
        }
        catch {
            onError('me_video_attach_error');
            return [];
        }
    };
    const onOpenVideoPicker = vkcom_me.openVideoPicker &&
        (() => vkcom_me.openVideoPicker?.(async (videoIds) => {
            const videoAttaches = toNonEmpty(await fetchVideoAttaches(videoIds));
            if (videoAttaches) {
                addAttaches({
                    videos: videoAttaches,
                });
            }
        }, owner.id));
    const onOpenAudioPicker = vkcom_me.openAudioPicker &&
        (() => vkcom_me.openAudioPicker?.(owner.id, async (audio) => {
            addAttaches({
                audios: [audio],
            });
        }));
    const onOpenGeoPicker = vkcom_me.openGeoPicker &&
        (() => vkcom_me.openGeoPicker?.(async (coordinates) => {
            addAttaches({
                geo: {
                    kind: 'Geo',
                    coordinates,
                },
            });
        }));
    return {
        onOpenPhotoPicker,
        onOpenVideoPicker,
        onOpenGeoPicker,
        onOpenAudioPicker,
        onOpenGiftPicker: !isCommunityMessaging
            ? vkcom_me.openGiftPicker
            : undefined,
        isLocalPhotoPickerEnabled: vkcom_me.isLocalPhotoPickerEnabled ?? false,
        isLocalVideoPickerEnabled: vkcom_me.isLocalVideoPickerEnabled ?? false,
        setOnOpenNativeFilePickerCallback: vkcom_me.setOnOpenNativeFilePickerCallback,
    };
}
//# sourceMappingURL=useVkcomMediaPickers.js.map