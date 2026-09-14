import { forward } from 'effector';
import { createGate } from 'effector-react';
import { stickersEmojiKeyboard } from '../';
const setPeerOptions = stickersEmojiKeyboard.createEvent();
export const $peerId = stickersEmojiKeyboard
    .createStore(null)
    .on(setPeerOptions, (_, { peerId }) => peerId || null);
export const PeerGate = createGate();
forward({
    from: PeerGate.state,
    to: setPeerOptions,
});
//# sourceMappingURL=index.js.map