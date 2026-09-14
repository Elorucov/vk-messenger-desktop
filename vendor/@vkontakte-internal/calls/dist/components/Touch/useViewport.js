import { useState, useEffect, useRef } from 'react';
export const useViewport = () => {
    const [viewport, setViewPort] = useState(() => {
        return [window.innerHeight, window.innerWidth];
    });
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const timeout = useRef(undefined);
    useEffect(() => {
        const callback = () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            timeout.current = setTimeout(() => {
                setViewPort([window.innerHeight, window.innerWidth]);
            }, 300);
        };
        window.addEventListener('resize', callback);
        return () => {
            window.removeEventListener('resize', callback);
        };
    }, []);
    return viewport;
};
//# sourceMappingURL=useViewport.js.map