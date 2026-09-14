import { StickerContext } from './index';
export function getStickerContext(sticker) {
    return sticker instanceof StickerContext ? sticker : new StickerContext(sticker);
}
//# sourceMappingURL=getStickerContext.js.map