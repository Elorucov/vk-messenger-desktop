import { useEffect, useState, useRef, useCallback } from 'react';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { getWatchTogetherOwnerVideos } from '../../../services/backend';
import { EMovieChooseTab } from '../interfaces';
import { mapData } from '../utils';
const ALBUM_TYPE_MAP = {
    [EMovieChooseTab.Added]: -2,
    [EMovieChooseTab.Uploaded]: -1,
};
export const useOwnerVideos = (albumType) => {
    const isMounted = useIsMounted();
    const groupId = useTypedSelector((state) => state.groupId);
    const rawData = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [isNextPage, setIsNextPage] = useState(false);
    const fetchData = useCallback((groupId, signal) => {
        if (signal.aborted) {
            return Promise.resolve(); // do nothing
        }
        setLoading(true);
        setError(null);
        const params = {
            album_id: ALBUM_TYPE_MAP[albumType],
            start_from: rawData.current?.next_from,
            fields: 'screen_name',
            extended: 1,
        };
        if (groupId) {
            params.owner_id = groupId;
        }
        return getWatchTogetherOwnerVideos(params, { signal })
            .then((data) => {
            rawData.current = {
                ...rawData.current,
                ...data,
                items: rawData.current?.items ? [...rawData.current.items, ...data.items] : data.items,
                next_from: data.next_from,
            };
            if (!isMounted()) {
                return;
            }
            setData((prev) => [...prev, ...mapData(data)]);
            setIsNextPage(Boolean(data.next_from));
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
        fetchData(groupId, ac.signal);
        return () => ac.abort();
    }, [groupId]);
    const getNextPage = useCallback((signal) => {
        return fetchData(groupId, signal);
    }, [groupId, fetchData]);
    return {
        data,
        loading,
        error,
        isNextPage,
        getNextPage,
    };
};
//# sourceMappingURL=useOwnerVideos.js.map