import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef } from 'react';
import { Placeholder, Spinner } from '@vkontakte-internal/vkcom-kit';
export const InfiniteScroll = ({ children, hasMore = false, loadMore }) => {
    const isLoadingRef = useRef(false);
    const containerRef = useRef(null);
    const spinnerRef = useRef(null);
    // Основной обработчик загрузки
    const loadMoreHandler = useCallback(async () => {
        if (!hasMore || isLoadingRef.current)
            return;
        isLoadingRef.current = true;
        try {
            await loadMore();
        }
        finally {
            isLoadingRef.current = false;
        }
    }, [hasMore, loadMore]);
    // IntersectionObserver для загрузки при появлении спиннера
    useEffect(() => {
        const spinnerEl = spinnerRef.current;
        if (!hasMore || !spinnerEl)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                loadMoreHandler();
            }
        });
        observer.observe(spinnerEl);
        return () => observer.disconnect();
    }, [hasMore, loadMoreHandler]);
    return (_jsxs("div", { ref: containerRef, children: [children, hasMore && (_jsx(Placeholder, { getRootRef: spinnerRef, children: _jsx(Spinner, {}) }))] }));
};
//# sourceMappingURL=InfiniteScroll.js.map