import { useMemo, useRef } from 'react';
import { useStore } from 'effector-react';
import { $variant } from '../model/variant';
import { useElementSize } from './elementSize';
const cache = new Map();
export function useGrid({ tab, itemWidth, itemsCount = 0, }) {
    const { setRef, width } = useElementSize();
    const variant = useStore($variant);
    const cacheKey = String([tab, variant]);
    const prevGridRef = useRef(cache.get(cacheKey) || {
        rows: 0,
        columns: 0,
    });
    const grid = useMemo(() => {
        const prevGrid = prevGridRef.current;
        if (!width) {
            return prevGrid;
        }
        const columns = Math.floor(width / itemWidth);
        if (!columns || columns === prevGrid.columns) {
            return prevGrid;
        }
        const rows = Math.ceil(itemsCount / columns);
        const grid = {
            rows,
            columns,
        };
        prevGridRef.current = grid;
        cache.set(cacheKey, grid);
        return grid;
    }, [width, cacheKey, itemWidth, itemsCount]);
    return {
        setGridRef: setRef,
        ...grid,
    };
}
//# sourceMappingURL=grid.js.map