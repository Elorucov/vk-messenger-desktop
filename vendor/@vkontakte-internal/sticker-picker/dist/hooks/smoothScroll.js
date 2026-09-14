import { debounce } from '@vkontakte/vkjs';
import { useCallback, useRef } from 'react';
import { easeOutQuart } from '../utils/easeOutQuart';
export function useSmoothScroll(virtualizer) {
    const startTimeRef = useRef(0);
    const scrollTo = useCallback(debounce(({ offset = 0, duration = 300 } = {}) => {
        startTimeRef.current = Date.now();
        const start = virtualizer.scrollOffset;
        if (!start) {
            return;
        }
        const startTime = startTimeRef.current;
        const run = () => {
            if (startTimeRef.current !== startTime) {
                return;
            }
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = easeOutQuart(Math.min(elapsed / duration, 1));
            const interpolated = start + (offset - start) * progress;
            if (elapsed < duration) {
                requestAnimationFrame(run);
            }
            virtualizer.scrollToOffset(interpolated);
        };
        requestAnimationFrame(run);
    }, 150), [virtualizer]);
    return {
        scrollTo,
    };
}
//# sourceMappingURL=smoothScroll.js.map