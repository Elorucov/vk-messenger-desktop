import { useState, useCallback } from 'react';
import { useIsMounted } from '@vkontakte-internal/react-utils';
/**
 * хелпер для прокидки fetch-коллбека и loading states по нему
 */
export const useFetchData = ({ cb, initialLoading, }) => {
    const [loading, setLoading] = useState(!!initialLoading);
    const [error, setError] = useState(null);
    const isMounted = useIsMounted();
    const fetchData = useCallback((...args) => {
        setLoading(true);
        setError(null);
        return cb(...args)
            .catch((e) => {
            setError(e);
            throw e;
        })
            .finally(() => {
            if (isMounted()) {
                setLoading(false);
            }
        });
    }, [cb]);
    return {
        fetchData,
        loading,
        error,
    };
};
//# sourceMappingURL=useFetchData.js.map