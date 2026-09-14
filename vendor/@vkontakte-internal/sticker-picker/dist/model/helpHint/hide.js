import { sample } from 'effector';
import { $api } from '../api';
import { stickersEmojiKeyboard } from '../index';
export const hideHelpHint = stickersEmojiKeyboard.createEvent();
const hideHelpHintFx = stickersEmojiKeyboard.createEffect(({ api, hintId }) => api.cache.hideHelpHint(hintId));
sample({
    clock: hideHelpHint,
    source: $api,
    fn: (sourceData, clockData) => ({ api: sourceData, hintId: clockData }),
    target: hideHelpHintFx,
});
//# sourceMappingURL=hide.js.map