import { useCallback, useEffect, useRef } from 'react';
/**
 * Хук, проверяющий, что компонент смонтирован
 */
export const useIsMounted = () => {
    const isMountedRef = useRef(false);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    return useCallback(() => isMountedRef.current, []);
};
//# sourceMappingURL=useIsMounted.js.map