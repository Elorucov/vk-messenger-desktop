import { debounce, isEqual } from '@vkontakte/vkjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { serializeMediaQuery } from './utils/serializeMediaQuery';
/**
 * @param rawQueries - Список медиа запросов со значением, которое устанавливается при соответствии
 * @param defaultValue - Значение используемое по умолчанию, если нет соответствий с другими условиями
 */
export const useAdaptivityMediaQueries = (rawQueries, defaultValue) => {
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const queriesRef = useRef(undefined);
    const [currentValue, setCurrentValue] = useState();
    const queries = useMemo(() => {
        const serializedQueries = Array.isArray(rawQueries) ? serializeMediaQueries(rawQueries) : rawQueries;
        const prevQueries = queriesRef.current;
        const isPrevQueriesEqual = isEqual(prevQueries, serializedQueries);
        if (prevQueries && isPrevQueriesEqual) {
            return prevQueries;
        }
        queriesRef.current = serializedQueries;
        return serializedQueries;
    }, [rawQueries]);
    const { mediaQueries, initialValue } = useMemo(() => {
        const mediaQueriesList = getMediaQueries(queries);
        const currentMedia = getCurrentMedia(mediaQueriesList);
        const initialMatchedValue = queries[currentMedia];
        return { mediaQueries: mediaQueriesList, initialValue: initialMatchedValue };
    }, [queries]);
    useEffect(() => {
        const changeHandler = debounce(() => {
            const currentMedia = getCurrentMedia(mediaQueries);
            setCurrentValue(currentMedia ? queries[currentMedia] : defaultValue);
        }, 50);
        mediaQueries.forEach((query) => query.addEventListener('change', changeHandler));
        return () => mediaQueries.forEach((query) => query.removeEventListener('change', changeHandler));
    }, [mediaQueries, queries, defaultValue]);
    if (currentValue !== undefined) {
        return currentValue;
    }
    if (initialValue !== undefined) {
        return initialValue;
    }
    return defaultValue;
};
function getCurrentMedia(mediaQueries) {
    for (const { matches, media } of mediaQueries) {
        if (matches) {
            return media;
        }
    }
    return '';
}
function getMediaQueries(queries) {
    return Object.keys(queries).map((query) => matchMedia(query));
}
function serializeMediaQueries(queries) {
    return Object.fromEntries(queries.map(({ query, value }) => [serializeMediaQuery(query), value]));
}
//# sourceMappingURL=useAdaptivityMediaQueries.js.map