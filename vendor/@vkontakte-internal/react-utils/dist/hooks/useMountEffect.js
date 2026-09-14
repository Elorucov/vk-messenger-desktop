import { useEffect } from 'react';
/**
 * Эффект, который запускается только на первый рендеринг при mount-е компонента и очищается при unmount-е.
 */
export function useMountEffect(effect) {
    useEffect(effect, []);
}
//# sourceMappingURL=useMountEffect.js.map