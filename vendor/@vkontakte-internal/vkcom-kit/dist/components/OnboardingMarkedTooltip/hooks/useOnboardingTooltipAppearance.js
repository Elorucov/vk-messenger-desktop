import { useStableCallback, useValueRef } from '@vkontakte-internal/react-utils';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useClickOutsideListener } from '../../../hooks/useClickOutsideListener/useClickOutsideListener';
export const useOnboardingTooltipAppearance = ({ shown, onShowStart, onShowEnd, onHideStart, onHideEnd, onClose, }) => {
    const [computedShown, setComputedShown] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [animated, setAnimated] = useState(false);
    const [animationIn, setAnimationIn] = useState(true);
    const handleShowCallback = useStableCallback((start = true) => (start ? onShowStart?.() : onShowEnd?.()));
    const handleHideCallback = useStableCallback((start = true) => (start ? onHideStart?.() : onHideEnd?.()));
    const handleCloseCallback = useStableCallback(() => onClose?.());
    const initializedRef = useValueRef(initialized);
    const animationInRef = useValueRef(animationIn);
    useLayoutEffect(() => {
        if (shown) {
            setComputedShown(true);
        }
        else if (initializedRef.current) {
            setAnimated(true);
            handleHideCallback();
        }
        setAnimationIn(shown);
    }, [shown, initializedRef, handleHideCallback]);
    useLayoutEffect(() => {
        if (!animated && !animationInRef.current && initializedRef.current) {
            setInitialized(false);
            setComputedShown(false);
            handleHideCallback(false);
        }
    }, [animated, initializedRef, animationInRef, handleHideCallback]);
    const startAnimation = () => {
        if (!initialized) {
            setInitialized(true);
            handleShowCallback();
        }
        setAnimated(true);
    };
    const endAnimation = useCallback(() => {
        setAnimated(false);
        animationIn && handleShowCallback(false);
    }, [animationIn, handleShowCallback]);
    const tipRef = useClickOutsideListener(() => {
        if (animated || !initialized)
            return;
        handleCloseCallback();
    }, [animated, initialized, handleCloseCallback]);
    return {
        computedShown,
        animated,
        initialized,
        animationIn,
        startAnimation,
        endAnimation,
        tipRef,
    };
};
//# sourceMappingURL=useOnboardingTooltipAppearance.js.map