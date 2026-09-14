import { debounce } from '@vkontakte/vkjs';
import { useState, useLayoutEffect } from 'react';
export function useElementSize() {
    const [ref, setRef] = useState(null);
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });
    useLayoutEffect(() => {
        const updateSize = () => {
            const offsetWidth = ref?.offsetWidth || 0;
            const offsetHeight = ref?.offsetHeight || 0;
            setSize({
                width: offsetWidth,
                height: offsetHeight,
            });
        };
        updateSize();
        const debouncedUpdateSize = debounce(updateSize, 150);
        window.addEventListener('resize', debouncedUpdateSize);
        return () => {
            window.removeEventListener('resize', debouncedUpdateSize);
        };
    }, [ref]);
    return {
        setRef,
        ...size,
    };
}
//# sourceMappingURL=elementSize.js.map