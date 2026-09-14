import { jsx as _jsx } from "react/jsx-runtime";
import { Icon20UgcChatStickerCircleFillBlackAlpha } from '@vkontakte-internal/icons-private';
import { getStickerContext } from '../../../context/sticker/getStickerContext';
export const getDefaultIcon = (sticker) => {
    const context = getStickerContext(sticker);
    const { isUGC } = context;
    if (isUGC) {
        return _jsx(Icon20UgcChatStickerCircleFillBlackAlpha, {});
    }
    return null;
};
//# sourceMappingURL=getDefaultIcon.js.map