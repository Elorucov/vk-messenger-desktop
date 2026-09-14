export const isMessageWithStickerWithIcon = (message) => {
    return Boolean(message.attaches.ugcSticker || message.attaches.sticker?.item.popup);
};
export const isPopupStickerServiceWorks = (service) => service.isPlaying || service.isPreparing;
//# sourceMappingURL=stickers.js.map