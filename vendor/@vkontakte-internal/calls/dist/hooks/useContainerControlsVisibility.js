import { useCallback, useEffect, useRef, useState } from 'react';
import { throttle } from '@vkontakte/vkjs';
const DEFAULT_HIDE_TIME = 3000;
export const useContainerControlsVisibility = (params) => {
    const { hideTime = DEFAULT_HIDE_TIME, onAsyncHide, onMouseMove, onMouseLeave, onMouseOver, isHardStop = false, } = params || {};
    const [isFocus, setIsFocus] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const timeoutRef = useRef(null);
    const handleHideControls = useCallback(() => {
        setIsShow(false);
    }, []);
    const handleShowControls = useCallback(() => {
        setIsShow(true);
    }, []);
    const clearTimeoutEvent = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };
    const asyncHide = useCallback(() => {
        clearTimeoutEvent();
        timeoutRef.current = setTimeout(() => {
            handleHideControls();
            onAsyncHide?.();
            timeoutRef.current = null;
        }, hideTime);
    }, [hideTime, onAsyncHide]);
    useEffect(() => {
        if (isHardStop) {
            clearTimeoutEvent();
            handleShowControls();
            return;
        }
        if (!isFocus) {
            asyncHide();
        }
    }, [isShow, isFocus, isHardStop, asyncHide]);
    const handleMouseOver = useCallback(() => {
        if (isHardStop) {
            return;
        }
        if (!isFocus) {
            setIsFocus(true);
            handleShowControls();
        }
        onMouseOver?.(isFocus);
    }, [isFocus, isHardStop, onMouseOver]);
    const handleMouseLeave = useCallback(() => {
        if (isHardStop) {
            return;
        }
        clearTimeoutEvent();
        setIsFocus(false);
        handleHideControls();
        onMouseLeave?.();
    }, [isHardStop, onMouseLeave]);
    const handleMouseMove = useCallback(throttle(() => {
        if (isHardStop) {
            return;
        }
        if (isFocus) {
            if (isShow) {
                asyncHide();
            }
            else {
                handleShowControls();
            }
        }
        onMouseMove?.(isFocus);
    }, 1000), [isFocus, isShow, isHardStop, onMouseMove]);
    const handleFocusCaptured = useCallback(() => {
        if (isHardStop) {
            return;
        }
        if (!isFocus) {
            setIsFocus(true);
            handleShowControls();
        }
    }, [isFocus, isHardStop]);
    const handleBlurCaptured = useCallback(() => {
        if (isHardStop) {
            return;
        }
        clearTimeoutEvent();
        setIsFocus(false);
        handleHideControls();
    }, [isHardStop]);
    return {
        isShowControls: isShow,
        isFocusInElement: isFocus,
        handleMouseLeave,
        handleMouseMove,
        handleMouseOver,
        handleFocusCaptured,
        handleBlurCaptured,
        handleShowControls,
        handleHideControls,
    };
};
//# sourceMappingURL=useContainerControlsVisibility.js.map