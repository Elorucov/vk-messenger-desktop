import { useEffect, useRef } from 'react';
/**
 * Этот хук аналогичен useEffect() с одним исключением - он пропускает первый рендеринг.
 */
export function useUpdateEffect(effect, dependencies) {
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (!isFirstRender.current) {
            effect();
        }
        isFirstRender.current = false;
    }, dependencies);
}
//# sourceMappingURL=useUpdateEffect.js.map