export const createDestroyListeners = (onDestroy) => {
    const removeDestroyListener = (callback) => {
        document.removeEventListener('wheel', callback);
        document.removeEventListener('touchmove', callback);
        window.removeEventListener('resize', callback);
    };
    const handleDestroy = () => {
        removeDestroyListener(handleDestroy);
        onDestroy();
    };
    const addDestroyListener = () => {
        document.addEventListener('wheel', handleDestroy, { once: true });
        document.addEventListener('touchmove', handleDestroy, { once: true });
        window.addEventListener('resize', handleDestroy, { once: true });
    };
    return {
        addDestroyListener,
        removeDestroyListener: removeDestroyListener.bind(this, handleDestroy),
        handleDestroy,
    };
};
export const setDestroyListeners = (data, listeners) => {
    const handleEndPlay = () => {
        listeners.removeDestroyListener();
        data.onEndPlay?.();
    };
    const handleEndPrepare = (success) => {
        if (success) {
            listeners.addDestroyListener();
        }
        data.onEndPrepare?.(success);
    };
    const onAnimationClick = (event) => {
        listeners.handleDestroy();
        data.onAnimationClick?.(event);
    };
    return {
        ...data,
        onEndPlay: handleEndPlay,
        onEndPrepare: handleEndPrepare,
        onAnimationClick,
    };
};
//# sourceMappingURL=destroyListeners.js.map