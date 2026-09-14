import { sample } from 'effector';
import { $api } from '../../api';
import { stickersEmojiKeyboard } from '../../';
import { submitUGCReportFx } from './submitReport';
export const setUGCInfo = stickersEmojiKeyboard.createEvent();
export const reloadUGCInfo = stickersEmojiKeyboard.createEvent();
const reloadUGCInfoFx = stickersEmojiKeyboard.createEffect((api) => 
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
api.cache.ugcInfo.get().catch(() => null));
export const $ugcInfo = stickersEmojiKeyboard
    .createStore(null)
    .on(setUGCInfo, (_, payload) => payload)
    .on(reloadUGCInfoFx.doneData, (_, payload) => payload)
    .on(submitUGCReportFx.doneData, () => null);
sample({
    clock: reloadUGCInfo,
    source: $api,
    target: reloadUGCInfoFx,
});
//# sourceMappingURL=info.js.map