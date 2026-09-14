import { useRef, useCallback, useEffect } from 'react';
export function useTimeout() {
    const timeout = useRef(null);
    const clear = useCallback(() => {
        if (timeout.current) {
            clearTimeout(timeout.current);
            timeout.current = null;
        }
    }, []);
    const add = useCallback((fn, delay) => {
        clear();
        timeout.current = setTimeout(() => {
            fn();
            clear();
        }, delay);
    }, [clear]);
    const isTimeout = useCallback(() => {
        return !!timeout.current;
    }, []);
    useEffect(() => clear, []);
    return {
        add,
        clear,
        timeout,
        isTimeout,
    };
}
//# sourceMappingURL=useTimeout.js.map