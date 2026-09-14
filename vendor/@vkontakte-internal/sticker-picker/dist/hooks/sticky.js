import { useCallback, useMemo, useRef } from 'react';
import { defaultRangeExtractor } from '@tanstack/react-virtual';
export function useSticky({ rows }) {
    const activeStickyHeaderIndexRef = useRef(0);
    const stickyIndexes = useMemo(() => rows.reduce((stickyIndexes, { sticky }, index) => {
        if (sticky) {
            stickyIndexes.push(index);
        }
        return stickyIndexes;
    }, []), [rows]);
    const rangeExtractor = useCallback((range) => {
        activeStickyHeaderIndexRef.current =
            [...stickyIndexes].reverse().find((index) => range.startIndex >= index) || 0;
        const next = new Set([activeStickyHeaderIndexRef.current, ...defaultRangeExtractor(range)]);
        return [...next].sort((a, b) => a - b);
    }, [stickyIndexes]);
    const isSticky = (index) => activeStickyHeaderIndexRef.current === index;
    return {
        isSticky,
        rangeExtractor,
    };
}
//# sourceMappingURL=sticky.js.map