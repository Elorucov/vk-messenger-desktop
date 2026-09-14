import { useEffect } from 'react';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { callsGetReactions } from '../services/backend';
import { useTypedSelector } from './useTypedSelector';
import { useTypedDispatch, E_ACTION } from './useTypedDispatch';
import { isFeedbackConfigFetched } from '../helpers/feedback';
/** получает конфиг для работы с реакциями */
export const useCallReactions = () => {
    const dispatch = useTypedDispatch();
    const isConfigFetched = useTypedSelector(isFeedbackConfigFetched);
    useEffect(() => {
        if (isConfigFetched) {
            return;
        }
        const ac = new AbortController();
        callsGetReactions(undefined, { signal: ac.signal })
            .then((data) => {
            const reactions = mapReactionsConfig(data.items);
            dispatch({
                type: E_ACTION.SET_REACTIONS,
                data: { reactions },
            });
        })
            .catch((error) => {
            debugMessage(DebugMessageType.ERROR, error);
        });
        return () => {
            ac.abort();
        };
    }, []);
};
function mapReactionsConfig(reactions) {
    const config = createBaseConfig();
    if (reactions) {
        for (const reaction of reactions) {
            const key = reaction.key;
            for (let i = reaction.images.length - 1; i >= 0; --i) {
                const { width, url } = reaction.images[i];
                if (width >= 24) {
                    config[24][key] = url;
                }
                if (width >= 28) {
                    config[28][key] = url;
                }
                if (width >= 32) {
                    config[32][key] = url;
                }
                if (width >= 48) {
                    config[48][key] = url;
                }
                if (width >= 56) {
                    config[56][key] = url;
                }
                if (width >= 72) {
                    config[72][key] = url;
                }
                if (width >= 96) {
                    config[96][key] = url;
                }
                if (width >= 192) {
                    config[192][key] = url;
                }
            }
            config.descriptions[key] = reaction.description || key;
        }
    }
    return config;
}
function createBaseConfig() {
    const config = {
        24: {},
        28: {},
        32: {},
        48: {},
        56: {},
        72: {},
        96: {},
        192: {},
        descriptions: {},
    };
    return config;
}
//# sourceMappingURL=useCallReactions.js.map