import * as RemindAnswerToMessage from '../../core/model/RemindAnswerToMessage';
import { useFeatureFlags, useStoreState } from './misc';
import { useCallback, useRef, useState } from 'react';
export const useMessageFastReactionsSuggest = ({ message, convoKind, peerId, withClipFastReactions, withPostFastReactions, isLastMessage, }) => {
    const remindAnswerToMessage = useStoreState('remindAnswerToMessage');
    const { vkm_wall_reply_required } = useFeatureFlags();
    const canShowSuggest = convoKind !== 'GroupConvo' &&
        message.kind === 'Normal' &&
        isLastMessage &&
        RemindAnswerToMessage.checkMessageHasMark(remindAnswerToMessage, peerId, message.cmid);
    const withClipFastReactionsSuggestRef = useRef(canShowSuggest && withClipFastReactions);
    const withPostFastReactionsSuggestRef = useRef(canShowSuggest && withPostFastReactions && vkm_wall_reply_required);
    /**
     * Этот хак с withClipReactionsSuggestRef и withClipFastReactionsSuggest
     * вызван тем, что без него результат вызова RemindAnswerToMessage.checkMessageHasMark()
     * меняет свое значение после открытия/закрытия чата и логика ломается, потому что
     * withClipReactionsSuggestRef становится false раньше времени
     *
     * Поэтому приходится запоминать его первое значение и затем устанавливать в false
     * самостоятельно только после показа саджеста реакций
     */
    const [withClipFastReactionsSuggest, setWithClipReactionsSuggest] = useState(withClipFastReactionsSuggestRef.current);
    const [withPostFastReactionsSuggest, setWithPostReactionsSuggest] = useState(withPostFastReactionsSuggestRef.current);
    /**
     * Выключаем флаг о необходимости показа саджеста реакций
     * над клипом после его первого показа
     */
    const disableClipFastReactionsSuggest = useCallback(() => {
        setWithClipReactionsSuggest(false);
    }, []);
    const disablePostFastReactionsSuggest = useCallback(() => {
        setWithPostReactionsSuggest(false);
    }, []);
    return {
        withClipFastReactionsSuggest,
        withPostFastReactionsSuggest,
        disableClipFastReactionsSuggest,
        disablePostFastReactionsSuggest,
    };
};
//# sourceMappingURL=useMessageFastReactionsSuggest.js.map