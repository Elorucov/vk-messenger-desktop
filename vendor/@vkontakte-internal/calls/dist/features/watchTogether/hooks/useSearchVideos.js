import { useRef, useState, useCallback } from 'react';
import { getSearchVideo } from '../../../services/backend';
import { DEFAULT_COUNT } from '../constants';
import { mapData, mapSearchMovieSettings } from '../utils';
const defaultData = { count: 0, mappedMovies: null };
const defaultOffset = { last: -1, next: 0 };
/**
 * хук для сетевого вызова поиска мувиков и маппинга данных ответа
 */
export const useSearchVideos = ({ searchSettings }) => {
    /** последний запрошенный текст (to prevent promise race) */
    const textRef = useRef('');
    /** последние запрошенные настройки (to prevent promise race) */
    const settingsRef = useRef('');
    /** raw данные по ответу с сервера */
    const resultRaw = useRef(null);
    /** страница выдачи */
    const offsetRef = useRef(defaultOffset);
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const getSearchMovies = useCallback((searchText, signal) => {
        // сохраняем последние переданные опции
        const settingsJSON = JSON.stringify(searchSettings);
        // проверяем необходимость сброса состояний
        const isSameSettings = textRef.current === searchText && settingsRef.current === settingsJSON;
        // проверяем, что не повторный вызов
        if (isSameSettings && offsetRef.current.next === offsetRef.current.last) {
            // значит, мы просим еще раз сделал предыдущий вызов
            // поэтому просто возвращаем
            return Promise.resolve();
        }
        if (!isSameSettings) {
            // убираем результаты
            setData(defaultData);
            // сохраняем последний текст, по которому идет вызов
            textRef.current = searchText;
            // сохраняем последние настройки, по которым идет вызов
            settingsRef.current = settingsJSON;
            // ставим страницу в 0
            offsetRef.current = { ...defaultOffset };
        }
        // view states
        setError(null);
        setLoading(true);
        // request
        const offset = offsetRef.current.next;
        return getSearchVideo(mapSearchMovieSettings({
            searchSettings,
            searchText,
            offset,
        }), {
            signal,
        })
            .then((result) => {
            if (signal.aborted || textRef.current !== searchText || settingsRef.current !== settingsJSON) {
                // из за того, что нет механизма отмены запросов
                // просто проверяем, что ответ пришел именно по
                // последнему запрошенному тексту
                return; // do nothing
            }
            setData((prev) => ({
                mappedMovies: prev.mappedMovies ? [...prev.mappedMovies, ...mapData(result)] : mapData(result),
                count: result.count,
            }));
            resultRaw.current = result;
            offsetRef.current.last = offset;
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
    }, [searchSettings]);
    const getNextPage = useCallback((signal) => {
        offsetRef.current = {
            last: offsetRef.current.next,
            next: offsetRef.current.next + DEFAULT_COUNT,
        };
        return getSearchMovies(textRef.current, signal);
    }, [getSearchMovies]);
    return {
        data,
        loading,
        error,
        getSearchMovies,
        getNextPage,
    };
};
//# sourceMappingURL=useSearchVideos.js.map