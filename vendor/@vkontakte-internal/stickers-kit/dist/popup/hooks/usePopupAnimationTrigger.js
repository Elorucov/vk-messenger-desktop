import { usePopupAnimationObserver } from '../components/PopupAnimationObserverProvider/usePopupAnimationObserver';
import { useEffect, useState } from 'react';
export function usePopupAnimationTrigger({ isAnimationEnabled, targetRef, targetId, }) {
    const { observerRef } = usePopupAnimationObserver();
    const [isReady, setIsReady] = useState(false);
    const [disconnected, setDisconnected] = useState(false);
    useEffect(() => {
        if (!isAnimationEnabled || !targetRef.current || !observerRef.current) {
            return;
        }
        observerRef.current.observe(targetRef.current, () => {
            setIsReady(true);
        }, () => {
            setDisconnected(true);
        }, targetId);
    }, [isAnimationEnabled]);
    return {
        isReady,
        disconnected,
    };
}
//# sourceMappingURL=usePopupAnimationTrigger.js.map