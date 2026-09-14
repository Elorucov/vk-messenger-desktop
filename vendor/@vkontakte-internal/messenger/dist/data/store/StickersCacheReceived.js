import { fromApiSticker } from '../converter/StickerConverter';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const handler = (draft, action) => {
    switch (action.type) {
        case 'StickersCacheReceived': {
            action.stickers.forEach((apiSticker) => {
                const sticker = fromApiSticker(apiSticker);
                draft.stickers.set(sticker.id, sticker);
            });
            return [];
        }
        case 'StickersReloadCompleted': {
            draft.forceStickersReload = false;
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
//# sourceMappingURL=StickersCacheReceived.js.map