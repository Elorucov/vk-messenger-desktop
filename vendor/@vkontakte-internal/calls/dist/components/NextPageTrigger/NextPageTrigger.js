import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useRef, useEffect } from 'react';
export const NextPageTrigger = ({ onNextPage }) => {
    const divRef = useRef(null);
    // TODO [react@>=19.0.0]: Заменить дженерик `T | null` на `T`
    const observer = useRef(null);
    const inProgress = useRef(false);
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const ac = useRef(undefined);
    const handleNextPage = () => {
        ac.current = new AbortController();
        return onNextPage(ac.current.signal);
    };
    useEffect(() => {
        return () => ac.current?.abort();
    }, []);
    if (!observer.current) {
        observer.current = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && !inProgress.current) {
                    inProgress.current = true;
                    handleNextPage().finally(() => {
                        inProgress.current = false;
                    });
                }
            }
        }, { threshold: 1.0 });
    }
    useEffect(() => {
        if (observer.current && divRef.current) {
            observer.current.observe(divRef.current);
        }
        return () => {
            observer.current?.disconnect();
        };
    }, []);
    return _jsx("div", { className: "CallsNextPageTrigger", ref: divRef });
};
//# sourceMappingURL=NextPageTrigger.js.map