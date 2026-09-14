import { ECreateBroadcastErrors } from './constants';
export const getBroadcastError = (hasData, call) => {
    if (call?.broadcast?.video_id) {
        return ECreateBroadcastErrors.EDIT;
    }
    if (hasData) {
        return ECreateBroadcastErrors.CREATE;
    }
    return ECreateBroadcastErrors.CREATE_NO_DATA;
};
export const getMinVideoPreview = (images = []) => {
    let src = '';
    let size = 0;
    for (const image of images) {
        if (image.width < size || !src) {
            src = image.url;
            size = image.width;
        }
    }
    return src;
};
//# sourceMappingURL=helpers.js.map