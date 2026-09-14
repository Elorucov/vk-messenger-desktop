import { useCallback, useEffect, useState } from 'react';
import { throttle } from '../../../core/utils/misc';
const COMPACT_RANGES = [
    [640, 800],
    [0, 480],
];
/**
 * Нужно ли отображать аттач в компактном варианте, необходимо для узких девайсов.
 * Для фастчата устанавливаем isCompactInitial
 */
export function useIsCompactPlaylist(targetEL, isCompactInitial) {
    const [isCompact, setIsCompact] = useState(isCompactInitial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onResize = useCallback(throttle(() => {
        setIsCompact(COMPACT_RANGES.some(([min, max]) => inRange(window.innerWidth, min, max)));
    }, 150), []);
    useEffect(() => {
        // Если передали isCompactInitial, то ничего не делаем
        if (!targetEL.current || isCompactInitial) {
            return;
        }
        onResize();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            onResize.cancel();
        };
    }, [targetEL, onResize, isCompactInitial]);
    return isCompactInitial || isCompact;
}
function inRange(num, min, max) {
    return num >= min && num <= max;
}
//# sourceMappingURL=useIsCompactPlaylist.js.map