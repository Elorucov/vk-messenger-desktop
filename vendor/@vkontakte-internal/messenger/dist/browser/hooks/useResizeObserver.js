import { useCallback, useEffect, useRef } from 'react';
import { debounce, noop, throttle } from '../../core/utils/misc';
export function useResizeObserver({ throttleInterval, debounceInterval, } = {}, containerCallback) {
    const $resizeObserver = useRef();
    const $targetCallbacks = useRef(new Map());
    const $containerCallback = useRef();
    $containerCallback.current = containerCallback;
    const startObserver = useCallback(() => {
        const entriesBuffer = new Map();
        const bufferedCallback = () => {
            const entries = Array.from(entriesBuffer.values());
            entries.forEach((entry) => {
                const targetCallback = $targetCallbacks.current.get(entry.target);
                if (targetCallback) {
                    targetCallback(entry);
                }
            });
            if ($containerCallback.current) {
                $containerCallback.current(entries);
            }
            entriesBuffer.clear();
        };
        // Добавляем метод cancel для соответствия типов с throttle и debounce
        bufferedCallback.cancel = noop;
        const wrappedContainerCallback = throttleInterval
            ? throttle(bufferedCallback, throttleInterval)
            : debounceInterval
                ? debounce(bufferedCallback, debounceInterval, true)
                : bufferedCallback;
        $resizeObserver.current = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                entriesBuffer.set(entry.target, entry);
            });
            wrappedContainerCallback();
        });
        /**
         * Если observe был вызван раньше вызова этой функции, то подпишемся здесь.
         */
        const elementsToObserve = [...$targetCallbacks.current.keys()];
        elementsToObserve.forEach((element) => {
            $resizeObserver.current?.observe(element);
        });
        return () => {
            wrappedContainerCallback.cancel();
            if ($resizeObserver.current) {
                $resizeObserver.current.disconnect();
                $resizeObserver.current = undefined;
            }
        };
    }, [throttleInterval, debounceInterval]);
    useEffect(() => {
        return startObserver();
    }, [startObserver]);
    useEffect(() => () => {
        $targetCallbacks.current.clear();
    }, []);
    const observe = useCallback((target, targetCallback) => {
        $resizeObserver.current?.observe(target);
        if (targetCallback) {
            $targetCallbacks.current.set(target, targetCallback);
        }
        return () => {
            if (targetCallback) {
                $targetCallbacks.current.delete(target);
            }
            $resizeObserver.current?.unobserve(target);
        };
    }, []);
    return { observe };
}
export function useOnResize($target, observe, targetCallback) {
    useEffect(() => {
        if (!$target.current) {
            return;
        }
        const unobserve = observe($target.current, targetCallback);
        return unobserve;
    }, [$target, observe, targetCallback]);
}
//# sourceMappingURL=useResizeObserver.js.map