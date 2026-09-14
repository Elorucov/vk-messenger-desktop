import { useCallback, useEffect, useRef } from 'react';
export const useSeenHistoryItems = ({ onSeenItemsReady, }) => {
    const queue = useRef(new Map());
    const handleViewItemsChange = useCallback((items) => {
        const now = Date.now();
        const readyItems = [];
        const itemIds = new Set(items.map((item) => item.id));
        queue.current.forEach((queued, _, self) => {
            const isStillVisible = itemIds.has(queued.id);
            if (isStillVisible) {
                return;
            }
            queued.endTime = now;
            readyItems.push(queued);
            self.delete(queued.id);
        });
        items.forEach((item) => {
            const queued = queue.current.get(item.id);
            if (queued) {
                queue.current.set(item.id, {
                    ...queued,
                    target: item.target,
                });
                return;
            }
            queue.current.set(item.id, {
                ...item,
                startTime: now,
                endTime: 0,
            });
        }, []);
        if (readyItems.length !== 0) {
            onSeenItemsReady(readyItems);
        }
    }, [onSeenItemsReady]);
    useEffect(() => () => handleViewItemsChange([]), [handleViewItemsChange]);
    return { handleViewItemsChange };
};
//# sourceMappingURL=useSeenHistoryItems.js.map