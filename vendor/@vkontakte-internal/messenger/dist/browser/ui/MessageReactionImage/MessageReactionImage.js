import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import './MessageReactionImage.css';
import { LottieManager } from '@vkontakte-internal/rlottie';
import { getReactionLangById } from '../../utils/reactions';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { useAnimationsSequence, } from '../../hooks/useAnimationsSequence';
const MESSAGE_REACTION_ANIMATION_GROUP = 'message-reaction';
LottieManager.observer.ignoreGroup(MESSAGE_REACTION_ANIMATION_GROUP);
const BIG_ANIMATION_SIZE = 100;
export const MessageReactionImage = React.memo((props) => {
    const { vkm_new_msg_reaction_image_com } = useFeatureFlags();
    if (vkm_new_msg_reaction_image_com) {
        return props.play ? (React.createElement(MessageReactionImageAnimated, { ...props })) : (React.createElement(MessageReactionImageStatic, { ...props }));
    }
    return React.createElement(MessageReactionImageAnimated, { ...props });
});
/**
 *
 * MessageReactionImageAnimated отличается от MessageReactionImageStatic
 * тем, что может проигрывать лотти анимацию. Даже просто инициализация лотти плеера
 * довольно тяжёлая операция (особенно это заметно в каналах, где кол-во реакций сильно больше, чем в чатах),
 * поэтому и разделили на MessageReactionImageStatic и MessageReactionImageAnimated, чтобы без необходимости
 * не прибегать к лотти плееру.
 */
const MessageReactionImageAnimated = ({ id, image, animationSmall, animationBig, size, loop = false, play = false, onAnimationEnd, }) => {
    const { idle } = useBrowserEnv();
    const animations = useMemo(() => [animationBig, animationSmall].filter((animation) => animation !== undefined), [animationBig, animationSmall]);
    const sizes = useMemo(() => {
        const sizes = [];
        if (animationBig) {
            sizes.push({
                width: BIG_ANIMATION_SIZE + size,
                height: BIG_ANIMATION_SIZE + size,
            });
        }
        if (animationSmall) {
            sizes.push({ width: size, height: size });
        }
        return sizes;
    }, [animationBig, animationSmall, size]);
    const { play: playAnimation, stop: stopAnimation, setRefs, isReady, isPlaying, } = useAnimationsSequence({
        animations,
        sizes,
        group: MESSAGE_REACTION_ANIMATION_GROUP,
        loop,
        onStop: onAnimationEnd,
    });
    const { ref, inView } = useInView({
        threshold: 1,
    });
    const noAnimation = !animationSmall && !animationBig;
    const [isIdle, setIsIdle] = useState(() => idle.isIdle());
    useEffect(() => idle.subscribe(setIsIdle), [idle]);
    useEffect(() => {
        if (!inView || !isReady) {
            return;
        }
        if (play) {
            playAnimation();
        }
        else {
            stopAnimation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, inView, play]);
    /**
     * Текущий плеер LottiePlayer рисует кадры с использованием setTimeout
     * Это приводит к тому, что в неактивной вкладке кадры рисуются со скоростью 1 кадр в секунду
     * Поэтому просто останавливаем анимацию в неактивной вкладке
     * Возможно получится поправить после https://jira.mvk.com/browse/WEBINF-1848
     */
    useEffect(() => {
        if (isPlaying && isIdle) {
            stopAnimation(true);
        }
    }, [isIdle, isPlaying, stopAnimation]);
    return (React.createElement(MessageReactionImageStatic, { id: id, image: image, size: size, hidden: isPlaying && !noAnimation, ref: ref },
        React.createElement("div", { ref: setRefs[animationBig ? 1 : 0], className: "MessageReactionImage__animation MessageReactionImage__animation--small" }),
        animationBig && (React.createElement("div", { ref: setRefs[0], className: "MessageReactionImage__animation MessageReactionImage__animation--big" }))));
};
const MessageReactionImageStatic = React.forwardRef(({ id, image, size, children, hidden, }, ref) => {
    const { lang } = useBrowserEnv();
    const langKey = getReactionLangById(id);
    return (React.createElement("span", { className: "MessageReactionImage", style: { '--message-reaction-size': size + 'px' }, ref: ref },
        React.createElement("span", { className: "MessageReactionImage__image-wrapper", hidden: hidden },
            React.createElement("img", { src: image, alt: langKey ? lang.use(langKey) : undefined, width: size, height: size })),
        children));
});
//# sourceMappingURL=MessageReactionImage.js.map