import { useCallback, useEffect } from 'react';
import { debounce } from '@vkontakte/vkjs';
export const useDebouncedEffect = (effect, deps, delay) => {
    const callback = useCallback(debounce(effect, delay), deps);
    useEffect(() => {
        callback();
        return () => callback?.cancel();
    }, [callback, ...deps]);
    return { debouncedCallback: callback };
};
//# sourceMappingURL=useDebouncedEffect.js.map