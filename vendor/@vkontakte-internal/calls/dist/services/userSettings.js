import { callsGetUserSettings } from '../services/backend';
import { handlePromiseError } from '../helpers/logger';
import { videoOptionsStorage } from '../helpers/localStorage';
import { EVideoOptionType } from '@vkontakte-internal/calls-core';
import { isUndefined } from '@vkontakte/vkjs';
/**
 * загружаем настройки пользователя
 *
 * пока тут только флаг пропуска экрана присоединения к звонку
 *
 * @todo возможно, хранить данные не в LS ?
 */
export function fetchUserSettings(toggles) {
    const shouldRefreshJoinCallPromptFlag = videoOptionsStorage.getOptions().skip_join_call_prompt === false &&
        !videoOptionsStorage.queryOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT_REFRESHED);
    if (!isUndefined(videoOptionsStorage.getOptions().skip_join_call_prompt) &&
        !shouldRefreshJoinCallPromptFlag) {
        return Promise.resolve();
    }
    if (toggles.skipJoinScreen !== undefined) {
        videoOptionsStorage.saveOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT, toggles.skipJoinScreen);
        videoOptionsStorage.saveOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT_REFRESHED, true);
        return Promise.resolve();
    }
    return callsGetUserSettings()
        .then((userSettings) => {
        videoOptionsStorage.saveOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT, userSettings.skip_join_screen);
        videoOptionsStorage.saveOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT_REFRESHED, true);
    })
        .catch(handlePromiseError);
}
//# sourceMappingURL=userSettings.js.map