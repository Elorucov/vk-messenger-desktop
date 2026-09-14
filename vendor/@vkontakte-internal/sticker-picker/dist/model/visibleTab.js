import { createGate } from 'effector-react';
import { combine, forward } from 'effector';
import { stickersEmojiKeyboard } from './domain.js';
import { Tab } from '../utils/cache/types';
const setVisibleTabOptions = stickersEmojiKeyboard.createEvent();
export const $visibleTab = stickersEmojiKeyboard
    .createStore(null)
    .on(setVisibleTabOptions, (_, { visibleTab }) => visibleTab ?? null);
export const $visibleTabState = combine($visibleTab, (visibleTab) => ({
    isEmojiVisibleTab: visibleTab === Tab.EMOJI,
    isStickersVisibleTab: visibleTab === Tab.STICKERS,
}));
export const VisibleTabGate = createGate();
forward({
    from: VisibleTabGate.state,
    to: setVisibleTabOptions,
});
//# sourceMappingURL=visibleTab.js.map