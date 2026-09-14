import { sample } from 'effector';
import { markAsViewedHelpHint } from '../viewed';
import { stickersEmojiKeyboard } from '../../index';
import { HelpHintPromoTypes } from '../helpHint';
import { isPromoVmojiCounterEnabled } from '../../../utils/userEnv';
/**
 * Отправили ли запрос о том, что мы увидели промо.
 * Отправляем каждый раз, если даже не показали
 * для того, чтобы бекенд мог считать причины не показа.
 * Исключение - когда баннер пытается зарендериться в категории vimoji,
 * в этом случае мы не шлем запрос.
 */
export const setAvatarSuggestionIsViewed = stickersEmojiKeyboard.createEvent();
export const $avatarSuggestionIsViewed = stickersEmojiKeyboard
    .createStore(false)
    .on(setAvatarSuggestionIsViewed, (_, recent) => recent);
sample({
    clock: setAvatarSuggestionIsViewed,
    filter: (val) => val && isPromoVmojiCounterEnabled(),
    fn: () => HelpHintPromoTypes.VMOJI_AVATAR_SUGGESTION,
    target: markAsViewedHelpHint,
});
//# sourceMappingURL=isViewed.js.map