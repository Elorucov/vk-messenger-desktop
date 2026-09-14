import { useEffect } from 'react';
import { useScrollView } from './scrollView';
export function useHorizontalScroll(target) {
    useScrollView(target);
    useEffect(() => {
        const container = target.current;
        if (!container) {
            return;
        }
        const handleScroll = (event) => {
            container.scrollLeft += event.deltaY + event.deltaX;
        };
        container.addEventListener('wheel', handleScroll, {
            passive: true,
        });
        return () => {
            container.removeEventListener('wheel', handleScroll);
        };
    }, [target]);
}
//# sourceMappingURL=horizontalScroll.js.map