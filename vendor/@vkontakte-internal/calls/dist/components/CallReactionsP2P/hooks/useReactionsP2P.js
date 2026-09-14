import { useRef, useCallback, useState, useEffect } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useReactionsStore } from '../../CallReactions/hooks/useReactionsStore';
import { REACTION_FADE_OUT_DELAY } from '../../../constants';
/** отрисовывает реакции в п2п звонке (смайл на весь экран оратора) */
export const useReactionP2P = () => {
    const iconUrls = useTypedSelector((state) => state.reactions?.reactions);
    const ctx = useP2PReactionsCtx();
    const add = useCallback((reactions) => {
        if (!iconUrls)
            return;
        const addReaction = (key) => {
            const url = iconUrls[96][key];
            const url2x = iconUrls[192][key];
            ctx.add(url, url2x);
        };
        if (Array.isArray(reactions)) {
            for (const reaction of reactions) {
                addReaction(reaction.key);
            }
        }
        else {
            addReaction(reactions.key);
        }
    }, [ctx.add, iconUrls]);
    useReactionsStore({ add, ignorePersonal: true });
    useLastChosenReaction(ctx.add);
    return ctx;
};
/** контроллер для оптимистичного выбора своей реакции */
function useLastChosenReaction(add) {
    const iconUrls = useTypedSelector((state) => state.reactions?.reactions);
    const lastChosenReaction = useTypedSelector((state) => state.localDevice.lastChosenReaction);
    useEffect(() => {
        const timeDiff = Date.now() - (lastChosenReaction?.ts || 0);
        if (!iconUrls || !lastChosenReaction || timeDiff > REACTION_FADE_OUT_DELAY / 2) {
            return;
        }
        const url = iconUrls[96][lastChosenReaction.key];
        const url2x = iconUrls[192][lastChosenReaction.key];
        add(url, url2x);
    }, [iconUrls, lastChosenReaction]);
}
function useP2PReactionsCtx() {
    const [src, setSrc] = useState();
    const [ts, setTs] = useState(0);
    const stack = useRef([]);
    const _setNext = useCallback((next) => {
        setSrc(next);
        setTs(Date.now());
    }, []);
    const onEnd = useCallback(() => {
        const next = stack.current.shift();
        _setNext(next);
    }, []);
    const add = useCallback((url, url2x) => {
        stack.current.push([url, url2x]);
        if (!src) {
            onEnd();
        }
    }, [src]);
    return {
        src,
        key: ts,
        add,
        onEnd,
    };
}
//# sourceMappingURL=useReactionsP2P.js.map