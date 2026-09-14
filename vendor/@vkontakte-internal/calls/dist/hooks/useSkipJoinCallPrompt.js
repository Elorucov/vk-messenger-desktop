import { useCallback, useState } from 'react';
import { EVideoOptionType } from '@vkontakte-internal/calls-core';
import { videoOptionsStorage } from '../helpers/localStorage';
import { callsSetUserSettings } from '../services/backend';
import { handlePromiseError } from '../helpers/logger';
import { fetchUserSettings } from '../services/userSettings';
export const useSkipJoinCallPrompt = () => {
    const [on, setOn] = useState(getLSSkipJoinCallPrompt);
    const toggle = useCallback(() => {
        videoOptionsStorage.saveOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT, !on);
        setOn(!on);
        callsSetUserSettings({ skip_join_screen: !on ? 1 : 0 }).catch(handlePromiseError);
    }, [on]);
    const silentToggle = () => {
        setOn(!on);
    };
    return { on, toggle, silentToggle };
};
// TODO: переименовать skipJoinCallPrompt на joinInBrowser
/**
 * @return возвращает true, если подключаемся через браузер
 */
export function getLSSkipJoinCallPrompt() {
    return !!videoOptionsStorage.queryOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT);
}
export function getLSSkipJoinCallPromptWithBackend(toggles) {
    return new Promise((resolve, reject) => {
        let LSValue;
        try {
            LSValue = videoOptionsStorage.queryOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT);
            if (LSValue === undefined) {
                fetchUserSettings(toggles)
                    .then(() => {
                    resolve({
                        value: videoOptionsStorage.queryOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT) ?? false,
                        isNewClientValue: true,
                    });
                })
                    .catch((e) => {
                    reject(e);
                });
            }
            else {
                resolve({ value: LSValue, isNewClientValue: false });
            }
        }
        catch (error) {
            reject(error);
        }
    });
}
//# sourceMappingURL=useSkipJoinCallPrompt.js.map