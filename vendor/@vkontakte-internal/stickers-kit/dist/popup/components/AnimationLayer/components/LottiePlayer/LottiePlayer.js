import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1,"style":1}]} */
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { classNames } from '@vkontakte/vkjs';
import { useLottie } from '@vkontakte-internal/rlottie';
import { useEffect, useRef } from 'react';
import { POPUP_LOTTIE_GROUP, SPEED_ON_DESTROY } from '../../../../constants';
import { getAnimationLayerLoopsLimit } from '../../../../helpers/layer';
import { usePopupStickerWithError } from '../../../PopupProvider/usePopupSticker';
import styles from './LottiePlayer.module.css';
export const LottiePlayer = observer(({ layer, style, onAnimationLoaded, onFirstFrameRender, onLayerLoopCompleted, }) => {
    const { popupStore } = usePopupStickerWithError();
    const loopCount = useRef(0);
    const isCompleted = useRef(false);
    const { isPlaying, onAnimationClick, lottiePlayer: { options: playerOptions }, } = popupStore;
    const { onLottiePlayerError } = popupStore.errorHandlers;
    const { lottieContainerRef, lottiePlayerRef, lottieLoaded, lottieRendered, lottieErrorMessage } = useLottie({
        group: POPUP_LOTTIE_GROUP,
        animationUrl: layer.url,
        ...playerOptions,
    }, { play: isPlaying });
    const handleClick = (event) => {
        onAnimationClick?.(event);
    };
    const handleComplete = () => {
        if (!isCompleted.current) {
            onLayerLoopCompleted();
            isCompleted.current = true;
        }
    };
    const handleCompleteWithError = (lottieErrorMessage) => {
        onLottiePlayerError?.(lottieErrorMessage);
        handleComplete();
    };
    useEffect(() => {
        const player = lottiePlayerRef.current;
        if (!player) {
            return;
        }
        player.setOptions(playerOptions);
    }, [playerOptions]);
    useEffect(() => {
        if (lottieErrorMessage) {
            handleCompleteWithError(lottieErrorMessage);
        }
    }, [lottieErrorMessage, onLottiePlayerError]);
    useEffect(() => {
        const player = lottiePlayerRef.current;
        if (!player) {
            return;
        }
        if (onAnimationLoaded) {
            player.addEventListener('ready', onAnimationLoaded, { once: true });
        }
        if (onFirstFrameRender) {
            player.addEventListener('firstFrame', onFirstFrameRender, { once: true });
        }
        return () => {
            onFirstFrameRender && player.removeEventListener('firstFrame', onFirstFrameRender);
            onAnimationLoaded && player.removeEventListener('ready', onAnimationLoaded);
        };
    }, [lottieLoaded]);
    useEffect(() => {
        const player = lottiePlayerRef.current;
        if (!player) {
            return;
        }
        player.addEventListener('destroy', handleComplete, { once: true });
        return () => {
            /**
             * Не отписываемся, если анимация закончилась не по причине исчерпания loopsLimit,
             * иначе просто не будет успевать срабатывать событие. Событие навешивается только при условии,
             * что есть плеер. Следовательно, при дестрое компонента сработает событие. Из-за опции once оно сразу и отпишется.
             */
            if (isCompleted.current) {
                player.removeEventListener('destroy', handleComplete);
            }
        };
    }, [lottieRendered]);
    useEffect(() => {
        const player = lottiePlayerRef.current;
        if (!player) {
            return;
        }
        const loopsLimit = getAnimationLayerLoopsLimit(layer);
        const loopCounter = () => {
            loopCount.current += 1;
            if (loopCount.current === loopsLimit) {
                handleComplete();
                player.removeEventListener('loopComplete', loopCounter);
                return;
            }
        };
        player.addEventListener('loopComplete', loopCounter);
        return () => {
            player.removeEventListener('loopComplete', loopCounter);
        };
    }, [lottieLoaded]);
    return (_jsx("div", { onClick: handleClick, className: classNames(styles.wrapper, {
            [styles.wrapperClickable]: Boolean(onAnimationClick) && playerOptions.speed !== SPEED_ON_DESTROY,
        }), style: toJS(style), ref: lottieContainerRef }));
});
//# sourceMappingURL=LottiePlayer.js.map