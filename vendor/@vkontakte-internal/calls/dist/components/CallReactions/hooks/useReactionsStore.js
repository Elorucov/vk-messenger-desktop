import { useEffect, useRef } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { v1 } from 'uuid';
import { last } from '../../../helpers/helpers';
import { isSameExternalId } from '@vkontakte-internal/calls-core';
import { isFeedbackEnabled } from '../../../helpers/feedback';
import { useLang } from '../../../hooks/useLang';
import { REACTION_FADE_OUT_DELAY as DELAY } from '../../../constants';
import { getUserName } from '../../../helpers/user';
/** прокси для реагирования на получение реакций в сторе редакса */
export const useReactionsStore = ({ add, ignorePersonal, showReactionWithoutUserName }) => {
    const { getLang } = useLang();
    const externalId = useTypedSelector((state) => state.externalId);
    const reactions = useTypedSelector((state) => state.reactions);
    const participants = useTypedSelector((state) => state.participants);
    const isEnabled = useTypedSelector(isFeedbackEnabled);
    const feedbacks = reactions?.feedback;
    const descriptions = reactions?.reactions?.descriptions;
    const prev = useRef(undefined);
    useEffect(() => {
        if (!isEnabled || !feedbacks || prev.current === feedbacks) {
            return;
        }
        const result = [];
        for (const feedback of feedbacks) {
            for (const item of feedback.items) {
                if (Date.now() - (last(item.times) || 0) > DELAY / 2) {
                    continue;
                }
                if (isSameExternalId(externalId, item.participantId)) {
                    if (!ignorePersonal) {
                        result.push({
                            id: v1(),
                            key: feedback.key,
                            description: descriptions?.[feedback.key],
                            name: showReactionWithoutUserName ? '' : getLang('calls_you'),
                        });
                    }
                    continue;
                }
                const participant = participants[item.participantId.id];
                const name = showReactionWithoutUserName ? '' : getUserName(participant);
                if (!name && !showReactionWithoutUserName) {
                    continue;
                }
                result.push({ id: v1(), key: feedback.key, description: descriptions?.[feedback.key], name });
            }
        }
        // добавляем в очередь
        add(result);
        // сохраняем ссылку в кеш
        prev.current = feedbacks;
    }, [add, feedbacks, showReactionWithoutUserName]);
};
//# sourceMappingURL=useReactionsStore.js.map