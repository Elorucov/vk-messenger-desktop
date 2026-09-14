import { combine, sample } from 'effector';
import { $api } from '../api';
import { stickersEmojiKeyboard } from '../';
export const setVmojiPromotion = stickersEmojiKeyboard.createEvent();
export const clearVmojiPromotionDot = stickersEmojiKeyboard.createEvent();
export const clearVmojiPromotionDotFx = stickersEmojiKeyboard.createEffect(async ({ api, vmojiPromotion }) => {
    if (!vmojiPromotion) {
        return;
    }
    return api.cache.clearVmojiPromotionDot();
});
export const $vmojiPromotion = stickersEmojiKeyboard
    .createStore(null)
    .on(setVmojiPromotion, (_, payload) => payload)
    .on(clearVmojiPromotionDotFx.doneData, (state) => ({
    ...state,
    dot_color: undefined,
}));
const $clearVmojiPromotionDotOptions = combine($api, $vmojiPromotion, (api, vmojiPromotion) => ({
    api,
    vmojiPromotion,
}));
sample({
    clock: clearVmojiPromotionDot,
    source: $clearVmojiPromotionDotOptions,
    target: clearVmojiPromotionDotFx,
});
//# sourceMappingURL=vmojiPromotion.js.map