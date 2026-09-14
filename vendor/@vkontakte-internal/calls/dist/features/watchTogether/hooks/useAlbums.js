import { useState, useEffect, useCallback, useRef } from 'react';
import { getWatchTogetherAlbums } from '../../../services/backend';
import { DEFAULT_COUNT } from '../constants';
export const useAlbums = () => {
    const rawData = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isNextPage, setIsNextPage] = useState(false);
    const fetchData = useCallback((signal) => {
        if (signal.aborted) {
            return Promise.resolve(); // do nothing
        }
        setLoading(true);
        setError(null);
        return getWatchTogetherAlbums({
            count: DEFAULT_COUNT,
            extended: 1,
            offset: rawData.current?.items?.length,
        }, { signal })
            .then((data) => {
            if (signal.aborted) {
                return; // do nothing
            }
            const nextRawData = {
                ...rawData.current,
                ...data,
                items: rawData.current ? [...rawData.current.items, ...data.items] : data.items,
            };
            setData((prev) => [...prev, ...data.items]);
            setIsNextPage(nextRawData.count > nextRawData.items.length);
            rawData.current = nextRawData;
        })
            .catch((e) => {
            if (signal.aborted) {
                return; // do nothing
            }
            setError(e);
        })
            .finally(() => {
            if (signal.aborted) {
                return; // do nothing
            }
            setLoading(false);
        });
    }, []);
    useEffect(() => {
        const ac = new AbortController();
        fetchData(ac.signal);
        return () => ac.abort();
    }, []);
    return {
        data,
        error,
        loading,
        isNextPage,
        getNextPage: fetchData,
    };
};
//# sourceMappingURL=useAlbums.js.map