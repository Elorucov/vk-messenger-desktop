import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { useEffect } from 'react';
export function useResizeObserver({ onResize, ref, isLog }) {
    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const observer = createResizeObserver(onResize, isLog);
        observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, [onResize, isLog]);
}
export function createResizeObserver(onResize, isLog) {
    const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (isLog) {
                debugMessage(DebugMessageType.LOG, { text: '[useResizeObserver]', entry });
            }
            onResize?.(entry);
        }
    });
    return observer;
}
//# sourceMappingURL=useResizeObserver.js.map