import { stickersEmojiKeyboard } from '../';
export const setChatPeer = stickersEmojiKeyboard.createEvent();
export const $charPeer = stickersEmojiKeyboard.createStore(null).on(setChatPeer, (_, peer) => peer);
//# sourceMappingURL=chat.js.map