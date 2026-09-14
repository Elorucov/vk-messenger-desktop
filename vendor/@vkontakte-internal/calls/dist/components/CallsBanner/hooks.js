import { useCallback, useEffect, useState } from 'react';
import { useTimeout } from '../../hooks/useTimeout';
export const useAutoDismissDelay = (delay, onDismiss) => {
    const tmt = useTimeout();
    useEffect(() => {
        if (delay === false) {
            tmt.clear();
            return;
        }
        tmt.add(onDismiss, delay);
        return () => tmt.clear();
    }, [delay, onDismiss]);
    return tmt;
};
export const useControlledState = (initial = true) => {
    const [isOpen, setIsOpen] = useState(initial);
    const toggleState = useCallback((arg) => {
        setIsOpen((value) => (typeof arg === 'boolean' ? arg : !value));
    }, []);
    return [isOpen, toggleState];
};
//# sourceMappingURL=hooks.js.map