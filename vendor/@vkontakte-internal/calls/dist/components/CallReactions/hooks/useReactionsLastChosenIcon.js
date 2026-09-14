import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { createTimeout } from '../../../helpers/helpers';
import { REACTION_FADE_OUT_DELAY as DELAY } from '../../../constants';
/** получает изображение с последней выбранной пользователем реакцией */
export const useReactionsLastChosenIcon = () => {
    const [reaction, setReaction] = useState();
    const lastChosenReaction = useTypedSelector((state) => state.localDevice.lastChosenReaction);
    const reactionsConfig = useTypedSelector((state) => state.reactions?.reactions);
    useEffect(() => {
        const timeDiff = Date.now() - (lastChosenReaction?.ts || 0);
        if (!reactionsConfig || !lastChosenReaction || timeDiff > DELAY) {
            return;
        }
        const url = reactionsConfig[24][lastChosenReaction.key];
        const url2x = reactionsConfig[48][lastChosenReaction.key];
        setReaction(
        // eslint-disable-next-line react/forbid-elements
        _jsx("img", { width: "24px", height: "24px", src: url, srcSet: `${url2x} 1.5x`, alt: lastChosenReaction.key }));
        return createTimeout(() => setReaction(undefined), DELAY - timeDiff);
    }, [lastChosenReaction]);
    return reaction;
};
//# sourceMappingURL=useReactionsLastChosenIcon.js.map