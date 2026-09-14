import React, { useCallback, useContext, useMemo } from 'react';
import { debounce } from '../../core/utils/misc';
function createReactionAnimationHook(ReactionAnimationContext) {
    return function useReactionAnimation() {
        const reactionsData = useContext(ReactionAnimationContext);
        if (!reactionsData) {
            throw new Error('MessageReactionAnimationProvider не добавлен в дерево Реакта!');
        }
        const { activeAnimations, setActiveAnimations } = reactionsData;
        const animate = useCallback((cmid, reactionId, forced = false) => {
            //Если уже есть активная не форсированная анимация, то ничего не делаем
            if (activeAnimations.some((reaction) => !reaction.forced) && !forced) {
                return;
            }
            const currentAnimation = activeAnimations.find((animation) => animation.cmid === cmid && animation.reactionId === reactionId);
            //Если анимация уже активна, то тоже ничего не делаем
            if (currentAnimation) {
                return;
            }
            if (forced) {
                setActiveAnimations((prev) => [...prev, { cmid, reactionId, forced }]);
                return;
            }
            const notForcedAnimation = activeAnimations.filter((animation) => !animation.forced);
            if (notForcedAnimation.length > 0) {
                return;
            }
            setActiveAnimations((prev) => [...prev, { cmid, reactionId, forced }]);
        }, [activeAnimations, setActiveAnimations]);
        const animateDebounced = useMemo(() => debounce(animate, 100, false), [animate]);
        const onAnimationEnd = useCallback((cmid, reactionId) => {
            setActiveAnimations((prev) => {
                return prev.filter((animation) => animation.cmid !== cmid || animation.reactionId !== reactionId);
            });
        }, [setActiveAnimations]);
        const hasAnimation = useCallback((cmid, reactionId) => {
            return activeAnimations.some((animation) => animation.cmid === cmid && animation.reactionId === reactionId);
        }, [activeAnimations]);
        return {
            animate: animateDebounced,
            onAnimationEnd,
            hasAnimation,
        };
    };
}
export function useMessageReactionAnimation() {
    return createReactionAnimationHook(MessageReactionAnimationContext)();
}
export function usePostReactionAnimation() {
    return createReactionAnimationHook(PostReactionAnimationContext)();
}
const createReactionAnimationContext = () => React.createContext(null);
const MessageReactionAnimationContext = createReactionAnimationContext();
const PostReactionAnimationContext = createReactionAnimationContext();
export const MessageReactionAnimationProvider = MessageReactionAnimationContext.Provider;
export const PostReactionAnimationProvider = PostReactionAnimationContext.Provider;
//# sourceMappingURL=useMessageReactionAnimation.js.map