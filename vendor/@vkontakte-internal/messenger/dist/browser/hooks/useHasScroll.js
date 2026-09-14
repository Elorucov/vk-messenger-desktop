import { isShallowEqual, throttle } from '../../core/utils/misc';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
export function useHasScroll(throttleDelay = 50) {
    const ref = useRef(null);
    const resizeObserver = useRef(null);
    const [directions, setDirections] = useState({
        up: false,
        down: false,
        left: false,
        right: false,
    });
    const onChange = useMemo(() => throttle(() => {
        if (ref.current) {
            // В системах, использующих масштабирование дисплея, scrollLeft может дать вам десятичное значение.
            const right = Math.abs(ref.current.clientWidth +
                ref.current.scrollLeft -
                ref.current.scrollWidth) > 1;
            const newDirections = {
                up: ref.current.scrollTop !== 0,
                down: ref.current.scrollHeight !==
                    ref.current.clientHeight + ref.current.scrollTop,
                left: ref.current.scrollLeft !== 0,
                right,
            };
            setDirections((oldDirections) => {
                if (!isShallowEqual(oldDirections, newDirections)) {
                    return newDirections;
                }
                return oldDirections;
            });
        }
    }, throttleDelay), [throttleDelay]);
    useLayoutEffect(() => {
        if (!window.ResizeObserver) {
            return;
        }
        resizeObserver.current?.disconnect();
        resizeObserver.current = new ResizeObserver(() => onChange());
        return () => onChange.cancel();
    }, [onChange]);
    useEffect(() => {
        const observer = resizeObserver.current;
        return () => {
            observer?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const setRef = useCallback((node) => {
        if (ref.current) {
            ref.current.removeEventListener('scroll', onChange);
            resizeObserver.current?.unobserve(ref.current);
        }
        if (node) {
            node.addEventListener('scroll', onChange);
            resizeObserver.current?.observe(node);
            onChange();
        }
        ref.current = node;
    }, [onChange]);
    return {
        setRef,
        onChange,
        directions,
    };
}
//# sourceMappingURL=useHasScroll.js.map