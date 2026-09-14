import { stickersEmojiKeyboard } from '../../';
import { submitUGCReportFx } from './submitReport';
export const setUGCPacks = stickersEmojiKeyboard.createEvent();
export const $ugcPacks = stickersEmojiKeyboard
    .createStore(null)
    .on(setUGCPacks, (_, update) => update)
    .on(submitUGCReportFx.doneData, () => null);
//# sourceMappingURL=packs.js.map