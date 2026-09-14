import { useEffect, useCallback, useRef } from 'react';
export function useVideoMessageTransform(rootRef, status) {
    const isDefaultStateCalculated = useRef(false);
    const isActiveStateCalculated = useRef(false);
    const resizeListener = useCallback(() => {
        if (!rootRef.current) {
            return;
        }
        isDefaultStateCalculated.current = false;
        isActiveStateCalculated.current = false;
        status === 'ended' || status === 'stopped'
            ? calculateAndSetDefaultStateTransform(rootRef.current)
            : calculateAndSetActiveStateTransform(rootRef.current);
    }, [rootRef, status]);
    useEffect(() => {
        window.addEventListener('resize', resizeListener, true);
        return () => window.removeEventListener('resize', resizeListener, true);
    }, [resizeListener]);
    useEffect(() => {
        if (!rootRef.current) {
            return;
        }
        if ((status === 'ended' || status === 'stopped') &&
            !isDefaultStateCalculated.current) {
            calculateAndSetDefaultStateTransform(rootRef.current);
        }
        if ((status === 'playing' || status === 'paused') &&
            !isActiveStateCalculated.current) {
            calculateAndSetActiveStateTransform(rootRef.current);
        }
    }, [rootRef, status]);
    function calculateAndSetDefaultStateTransform(rootElement) {
        setTransfromCustomProperty('default', rootElement, calculateTransform(rootElement));
        isDefaultStateCalculated.current = true;
    }
    function calculateAndSetActiveStateTransform(rootElement) {
        setTransfromCustomProperty('playing', rootElement, calculateTransform(rootElement));
        isActiveStateCalculated.current = true;
    }
}
function calculateTransform(rootElement) {
    const BASE_WIDTH = 216;
    const scale = rootElement.clientWidth / BASE_WIDTH;
    const offset = (rootElement.clientWidth - BASE_WIDTH) / 2 / scale;
    return [parseFloat(scale.toPrecision(5)), parseFloat(offset.toPrecision(2))];
}
function setTransfromCustomProperty(status, rootElement, [scale, offset]) {
    rootElement.style.setProperty(`--${status}-status-transform`, `scale(${scale}) translate(${offset}px, ${offset}px)`);
}
//# sourceMappingURL=useVideoMessageTransform.js.map