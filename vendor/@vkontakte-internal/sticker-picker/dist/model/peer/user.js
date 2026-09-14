import { stickersEmojiKeyboard } from '../';
export const setUserPeer = stickersEmojiKeyboard.createEvent();
export const $userPeer = stickersEmojiKeyboard.createStore(null).on(setUserPeer, (_, peer) => peer);
//# sourceMappingURL=user.js.map