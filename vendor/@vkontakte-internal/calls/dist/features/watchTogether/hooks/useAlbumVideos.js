import { useState, useEffect, useCallback, useRef } from 'react';
import { videoGet } from '../../../services/backend';
import { DEFAULT_COUNT } from '../constants';
import { mapData } from '../utils';
export const useAlbumVideos = (albumId) => {
    const rawData = useRef(null);
    /**
     * todo: в различных хуках идентичный код. Вынести в общий хук
     * @link: https://jira.mvk.com/browse/CALL-23799
     */
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isNextPage, setIsNextPage] = useState(false);
    const fetchData = useCallback((signal) => {
        /**
         * todo: возможно не нужно
         * @link: https://jira.mvk.com/browse/CALL-23799
         */
        if (signal.aborted) {
            return Promise.resolve(); // do nothing
        }
        setLoading(true);
        setError(null);
        return videoGet({
            album_id: albumId,
            count: DEFAULT_COUNT,
            offset: rawData.current?.items?.length,
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
            /**
             * todo: тут возможно лучше проверять, что компонент еще живой
             * @link: https://jira.mvk.com/browse/CALL-23799
             */
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
//# sourceMappingURL=useAlbumVideos.js.map