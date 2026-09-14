import React, { useContext } from 'react';
const StickerEmojiMenuContext = React.createContext(undefined);
export const StickerEmojiMenuProvider = StickerEmojiMenuContext.Provider;
export function useStickerEmojiMenu() {
    const stickerEmojiMenu = useContext(StickerEmojiMenuContext);
    if (!stickerEmojiMenu) {
        throw Error('Каждая беседа должна сопровождаться контекстом StickerEmojiMenu');
    }
    return stickerEmojiMenu;
}
//# sourceMappingURL=StickerEmojiMenuContext.js.map