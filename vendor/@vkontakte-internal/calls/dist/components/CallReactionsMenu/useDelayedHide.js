import { useState, useEffect } from 'react';
import { useTimeout } from '../../hooks/useTimeout';
const DELAY = 2000;
/**
 * создан для того, чтобы в случае перетаскивания реакций
 * увеличить задержку закрытия тултипа с меню реакций
 */
export const useDelayedHide = () => {
    const timeout = useTimeout();
    const [delay, setDelay] = useState();
    const [moving, setMoving] = useState(false);
    useEffect(() => {
        if (!moving) {
            return;
        }
        setDelay(DELAY);
        timeout.clear();
        return () => {
            timeout.add(() => setDelay(undefined), DELAY);
        };
    }, [moving]);
    return {
        delay,
        onMoving: setMoving,
    };
};
//# sourceMappingURL=useDelayedHide.js.map