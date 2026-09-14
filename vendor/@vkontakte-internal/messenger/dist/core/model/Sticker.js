export function resolveStickerId(id) {
    if (Number.isNaN(id)) {
        id = 0;
    }
    return id;
}
export function isPopupSticker(sticker) {
    return Boolean(sticker.item.popup);
}
//# sourceMappingURL=Sticker.js.map