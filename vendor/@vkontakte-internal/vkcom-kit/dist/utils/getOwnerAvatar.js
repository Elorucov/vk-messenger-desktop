import { isRetina } from '@vkontakte/vkjs';
export const getOwnerAvatar = (owner) => {
    if (typeof window !== 'undefined' && isRetina()) {
        return owner?.photo_100 || owner?.photo_200 || owner?.photo_50 || owner?.photo_base || '';
    }
    return owner?.photo_50 || owner?.photo_100 || owner?.photo_200 || owner?.photo_base || '';
};
//# sourceMappingURL=getOwnerAvatar.js.map