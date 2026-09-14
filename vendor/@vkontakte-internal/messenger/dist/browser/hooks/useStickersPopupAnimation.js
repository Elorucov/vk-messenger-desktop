import React, { useCallback, useContext, useMemo, useState, } from 'react';
export function useStickersPopupAnimationContext() {
    const context = useContext(StickersPopupAnimationContext);
    if (!context) {
        throw new Error('StickersPopupAnimationContextProvider не добавлен в дерево Реакта!');
    }
    return context;
}
// отдельный контекст – если нужно прервать анимацию
// далеко за пределами дерева компонентов, где отображается стикер,
// чтобы не подписываться на лишние реактивные переменные
export function useStickersPopupAnimationStopperContext() {
    const context = useContext(StickersPopupAnimationStopperContext);
    if (!context) {
        throw new Error('StickersPopupAnimationStopperContextProvider не добавлен в дерево Реакта!');
    }
    return context;
}
const StickersPopupAnimationContext = React.createContext(null);
const StickersPopupAnimationStopperContext = React.createContext(null);
export const StickersPopupAnimationContextProvider = ({ children, }) => {
    const [currentAnimatedMessage, setCurrentAnimatedMessage] = useState(null);
    const playPopupAnimation = useCallback((currentAnimatedMessage) => {
        setCurrentAnimatedMessage(currentAnimatedMessage);
    }, []);
    const [animationShouldBeStopped, setAnimationShouldBeStopped] = useState(false);
    const resetPopupAnimation = useCallback(() => {
        setCurrentAnimatedMessage(null);
    }, []);
    const hasPopupAnimationPlaying = useCallback((message) => {
        if (!currentAnimatedMessage) {
            return false;
        }
        const isSamePeer = currentAnimatedMessage.peerId === message.peerId;
        if (message.kind === 'Queued' &&
            currentAnimatedMessage.kind !== 'Foreign') {
            return (isSamePeer && currentAnimatedMessage.randomId === message.randomId);
        }
        else {
            return isSamePeer && currentAnimatedMessage.cmid === message.cmid;
        }
    }, [currentAnimatedMessage]);
    const value = useMemo(() => {
        return {
            animationShouldBeStopped,
            setAnimationShouldBeStopped,
            hasPopupAnimationPlaying,
            playPopupAnimation,
            resetPopupAnimation,
            currentAnimatedMessage,
        };
    }, [
        hasPopupAnimationPlaying,
        playPopupAnimation,
        resetPopupAnimation,
        currentAnimatedMessage,
        animationShouldBeStopped,
        setAnimationShouldBeStopped,
    ]);
    const stopperValue = useMemo(() => {
        return {
            stopPopupStickerAnimation: () => {
                setAnimationShouldBeStopped(true);
            },
        };
    }, [setAnimationShouldBeStopped]);
    return (React.createElement(StickersPopupAnimationContext.Provider, { value: value },
        React.createElement(StickersPopupAnimationStopperContext.Provider, { value: stopperValue }, children)));
};
//# sourceMappingURL=useStickersPopupAnimation.js.map