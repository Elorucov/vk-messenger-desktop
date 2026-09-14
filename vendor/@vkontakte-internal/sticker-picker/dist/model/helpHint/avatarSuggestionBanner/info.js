import { sample } from 'effector';
import { $api } from '../../api';
import { stickersEmojiKeyboard } from '../../index';
export const setAvatarSuggestion = stickersEmojiKeyboard.createEvent();
export const getAvatarSuggestionFromCache = stickersEmojiKeyboard.createEvent();
const getAvatarSuggestionFromCacheFx = stickersEmojiKeyboard.createEffect(async (api) => {
    const data = await api.cache.avatarSuggestion.get();
    setAvatarSuggestion(data);
});
export const $avatarSuggestion = stickersEmojiKeyboard
    .createStore(null)
    .on(setAvatarSuggestion, (_, recent) => recent);
sample({
    clock: getAvatarSuggestionFromCache,
    source: $api,
    target: getAvatarSuggestionFromCacheFx,
});
//# sourceMappingURL=info.js.map