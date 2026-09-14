import { useEffect, useState } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { REACTION_FADE_OUT_DELAY } from '../../../constants';
import { createTimeout } from '../../../helpers/helpers';
/** хук для получения и очистки выбранной пользователем реакции */
export function useParticipantReaction(id, isMe) {
    const feedback = useTypedSelector((state) => {
        if (isMe) {
            // выбираем тут ту, которую сразу пишем, не дожидаясь ответа от сервера
            return state.localDevice.lastChosenReaction;
        }
        return state.devices[id]?.reaction;
    });
    const [reaction, setReaction] = useState();
    useEffect(() => {
        const timeDiff = Date.now() - (feedback?.ts || 0);
        if (!feedback || timeDiff > REACTION_FADE_OUT_DELAY) {
            return;
        }
        setReaction(feedback);
        return createTimeout(setReaction, REACTION_FADE_OUT_DELAY - timeDiff);
    }, [feedback]);
    return reaction;
}
//# sourceMappingURL=useParticipantReaction.js.map