import { sample } from 'effector';
import { $api } from '../../api';
import { stickersEmojiKeyboard } from '../../';
export const submitUGCReport = stickersEmojiKeyboard.createEvent();
export const submitUGCReportFx = stickersEmojiKeyboard.createEffect((api) => {
    api.cache.clearUGC();
});
sample({
    clock: submitUGCReport,
    source: $api,
    target: submitUGCReportFx,
});
//# sourceMappingURL=submitReport.js.map