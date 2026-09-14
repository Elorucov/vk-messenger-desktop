import { thumbHashToDataURL } from 'thumbhash';
export function fromApiPicture(params) {
    if (Object.values(params).every((el) => el === undefined)) {
        return;
    }
    if (params.thumbhashUrl) {
        params.thumbhashUrl = thumbHashToDataURL(Uint8Array.from(atob(params.thumbhashUrl), (c) => c.charCodeAt(0)));
    }
    return params;
}
//# sourceMappingURL=PictureConverter.js.map