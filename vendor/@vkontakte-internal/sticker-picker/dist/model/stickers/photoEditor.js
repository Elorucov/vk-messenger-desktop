import { stickersEmojiKeyboard } from '../';
export const setPhotoEditorStickers = stickersEmojiKeyboard.createEvent();
export const $photoEditorStickers = stickersEmojiKeyboard
    .createStore(null)
    .on(setPhotoEditorStickers, (_, photoEditorStickers) => photoEditorStickers);
//# sourceMappingURL=photoEditor.js.map