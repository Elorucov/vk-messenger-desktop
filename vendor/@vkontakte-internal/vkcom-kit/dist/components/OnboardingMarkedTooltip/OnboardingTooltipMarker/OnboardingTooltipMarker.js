import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useStableCallback } from '@vkontakte-internal/react-utils';
import { LottieManager, useLottie } from '@vkontakte-internal/rlottie';
import { useEffect, useState, } from 'react';
import { getAnimationDirection, getNearestMarkerSize } from '../helpers';
import { loadAnimationModule } from './OnboardingTooltipMarkerAnimations';
import styles from './OnboardingTooltipMarker.module.css';
const markerColorMap = {
    lime: styles.rootLime,
    cyan: styles.rootCyan,
    blue: styles.rootBlue,
    pink: styles.rootPink,
};
const ONBOARDING_TOOLTIP_MARKER_GROUP = 'onboarding_tooltip_marker_group';
LottieManager.observer.ignoreGroup(ONBOARDING_TOOLTIP_MARKER_GROUP);
export const OnboardingTooltipMarker = ({ targetRef, mode, size, appearance, animated, animationIn, startAnimation, endAnimation, onClick, }) => {
    const [animationData, setAnimationData] = useState(null);
    const animationDirection = getAnimationDirection(animationIn);
    const cursor = targetRef.current && typeof window !== 'undefined'
        ? getComputedStyle(targetRef.current).getPropertyValue('cursor')
        : 'default';
    const markerSize = getNearestMarkerSize(size[1]);
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const module = await loadAnimationModule(mode, markerSize);
                if (mounted) {
                    setAnimationData(module.default);
                }
            }
            catch {
                endAnimation();
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [mode, markerSize, endAnimation]);
    const { lottieContainerRef, lottiePlayerRef, lottieLoaded } = useLottie({
        animationData,
        width: size[0],
        height: size[1],
        direction: animationDirection,
        group: ONBOARDING_TOOLTIP_MARKER_GROUP,
        color: 'currentColor',
        loop: false,
        autoplay: false,
    }, {
        play: animated && !!animationData,
    });
    const onClickHandler = (e) => {
        e.stopPropagation();
        onClick?.(e);
    };
    const startAnimationStable = useStableCallback(startAnimation);
    const handleAnimationEndStable = useStableCallback(() => {
        endAnimation();
        const player = lottiePlayerRef.current;
        if (!player) {
            return;
        }
        // Форсируем отображение последнего кадра, если во время анимации пользователь переключал вкладку
        if (animationIn) {
            player.setDirection(-1);
            player.reset();
        }
    });
    useEffect(() => {
        const player = lottiePlayerRef.current;
        if (!player || !animationData) {
            return;
        }
        player.setDirection(animationDirection);
        player.setSpeed(animationIn ? 1 : 2);
        player.reset();
    }, [animationIn, animationDirection, lottiePlayerRef, lottieLoaded, animationData]);
    useEffect(() => {
        const player = lottiePlayerRef.current;
        if (!player || !animationData) {
            return;
        }
        player.addEventListener('firstFrame', startAnimationStable, { once: true });
        player.addEventListener('loopComplete', handleAnimationEndStable, { once: true });
        return () => {
            player.removeEventListener('firstFrame', startAnimationStable);
            player.removeEventListener('loopComplete', handleAnimationEndStable);
        };
    }, [
        lottieLoaded,
        lottiePlayerRef,
        startAnimationStable,
        handleAnimationEndStable,
        animated,
        animationIn,
        animationData,
    ]);
    return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions  */
    _jsx("div", { ref: lottieContainerRef, className: classNames(styles.root, appearance && markerColorMap[appearance]), style: { cursor }, onClick: onClickHandler }));
};
//# sourceMappingURL=OnboardingTooltipMarker.js.map