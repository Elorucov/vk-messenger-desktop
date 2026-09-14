import { sample } from 'effector';
import { $api } from '../../api';
import { reloadUGCInfo } from './info';
import { stickersEmojiKeyboard } from '../../';
export const hideUGCOnboarding = stickersEmojiKeyboard.createEvent();
const hideUGCOnboardingFx = stickersEmojiKeyboard.createEffect((api) => api.cache.hideUGCOnboarding());
sample({
    clock: hideUGCOnboarding,
    source: $api,
    target: hideUGCOnboardingFx,
});
sample({
    source: hideUGCOnboardingFx.doneData,
    filter: (isHidden) => isHidden,
    target: reloadUGCInfo,
});
//# sourceMappingURL=hideOnboarding.js.map