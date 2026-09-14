import { useEffect } from 'react';
/**
 * Исправляет поведение скролла на m.vk.com
 */
export function useScrollView(ref) {
    useEffect(() => {
        const container = ref.current;
        if (!container) {
            return;
        }
        container.setAttribute('data-scroll-view', '');
    }, []);
}
//# sourceMappingURL=scrollView.js.map