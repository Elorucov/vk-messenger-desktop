import { sample } from 'effector';
import { $api } from '../api';
import { stickersEmojiKeyboard } from '../index';
export const markAsViewedHelpHint = stickersEmojiKeyboard.createEvent();
const markAsViewedHelpHintFx = stickersEmojiKeyboard.createEffect(({ api, promoId }) => {
    api.cache.markHelpHintAsViewed(promoId);
});
sample({
    clock: markAsViewedHelpHint,
    source: $api,
    fn: (sourceData, clockData) => ({ api: sourceData, promoId: clockData }),
    target: markAsViewedHelpHintFx,
});
//# sourceMappingURL=viewed.js.map