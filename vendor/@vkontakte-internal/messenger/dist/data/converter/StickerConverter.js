import * as Sticker from '../../core/model/Sticker';
export function fromApiSticker(apiSticker) {
    return {
        id: Sticker.resolveStickerId(apiSticker.sticker_id),
        kind: 'Sticker',
        item: apiSticker,
        // Устанавливаем в true по дефолту, чтобы точно не играть ненужные кейсы попап анимаций
        isPopupAutoplayed: true,
    };
}
export function fromApiStickersKeywords(apiStickersKeywords) {
    return apiStickersKeywords.reduce((acc, apiKeyword) => {
        const stickers = (apiKeyword.stickers || []).map((apiSticker) => ({
            id: Sticker.resolveStickerId(apiSticker.sticker_id),
            packId: apiSticker.pack_id,
        }));
        for (const word of apiKeyword.words) {
            acc.set(word, stickers);
        }
        return acc;
    }, new Map());
}
export const fromApiUgcSticker = (apiUgcSticker) => {
    return {
        kind: 'UgcSticker',
        id: apiUgcSticker.id,
        item: apiUgcSticker,
    };
};
export const fromContextSticker = (context) => {
    if (context.isUGC) {
        return fromApiUgcSticker(context.rawData);
    }
    return fromApiSticker(context.rawData);
};
//# sourceMappingURL=StickerConverter.js.map