import { useState, useEffect, useCallback, useRef } from 'react';
import { getWatchTogetherRecommended } from '../../../services/backend';
import { DEFAULT_COUNT } from '../constants';
import { mapData } from '../utils';
export const useRecommendedVideos = () => {
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
        return getWatchTogetherRecommended({
            count: DEFAULT_COUNT,
            extended: 1,
            fields: 'screen_name',
            start_from: rawData?.current?.next_from,
        }, { signal })
            .then((data) => {
            if (signal.aborted) {
                return; // do nothing
            }
            rawData.current = {
                ...rawData.current,
                ...data,
                items: rawData.current?.items ? [...rawData.current.items, ...data.items] : data.items,
            };
            setData((prev) => [...prev, ...mapData(data)]);
            setIsNextPage(rawData.current.count > rawData.current.items.length);
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
//# sourceMappingURL=useRecommendedVideos.js.map