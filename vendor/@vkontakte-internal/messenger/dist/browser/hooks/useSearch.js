import { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo, } from 'react';
import { useBrowserEnv, useInsertIntoCache, useDebounced, useOwner, usePeers, useFeatureFlags, useViewer, useConvos, } from './misc';
import * as Peer from '../../core/model/Peer';
import * as Convo from '../../core/model/Convo';
import * as Trie from '../../core/model/Trie';
import { searchMessages, searchConversations, searchUsersGlobal, searchPosts, searchChannels, searchConversationMembers, searchSferumContacts, } from './searchHelpers';
import { useTabListNavigation, } from '../hooks/useKeyboardNavigation';
import { onElementKeyDownFactory, } from '../utils/elementKeyDown';
import { getOwnerGroupId } from '../../data/store/State';
import { useApiFetch } from '../hooks/useApiFetch';
import { MEMBERS_SEARCH_COUNT, SEARCH_CHANNELS_COUNT, SEARCH_DEBOUNCE_MS, SEARCH_POSTS_COUNT, EDU_CONTACTS_SEARCH_COUNT, } from '../../core/config/config';
import * as Viewer from '../../core/model/Viewer';
import * as Channel from '../../core/model/Channel';
import { IApi } from '../../data/env/IApi';
import { nanoid } from 'nanoid';
import { doVariativeSearch, isMatchFound } from '../ui/Highlighter/search';
/**
 * Поиск бесед.
 * Хук возвращает обработчики для поля ввода и результаты поиска.
 */
export function useConvoSearch({ onSelect, searchIndex, defaultResults, }) {
    const { setTabsCount, setSelectHandler, resetIndexToSelect, onKeyDown, indexToSelect, forceScrollToLoader, } = useTabListNavigation({});
    const { query, setNavigationParams, ...handlers } = useSearchHandlers();
    useEffect(() => {
        setNavigationParams({ resetIndexToSelect, onKeyDown });
    }, [setNavigationParams, resetIndexToSelect, onKeyDown]);
    const { results, isLoading, isDefault } = useConvoSearchData({
        searchIndex,
        defaultResults,
        query,
    });
    const convoIds = useMemo(() => getConvoIds(results) ?? [], [results]);
    const selectHandler = useCallback((index) => {
        const selectedConvo = convoIds[index];
        if (selectedConvo !== undefined) {
            onSelect(selectedConvo);
        }
    }, [convoIds, onSelect]);
    useEffect(() => {
        setSelectHandler(selectHandler);
    }, [selectHandler, setSelectHandler]);
    useEffect(() => {
        setTabsCount(convoIds.length);
    }, [convoIds, setTabsCount]);
    return {
        query,
        ...handlers,
        results,
        isLoading,
        isDefault,
        indexToSelect,
        forceScrollToLoader,
    };
}
/**
 * Хук возвращающий обработчики для инпута поиска
 * и навигации клавишами по результатам по поиска.
 */
export function useSearchHandlers($inputRef) {
    const navigation = useRef(null);
    const setNavigationParams = useCallback((params) => (navigation.current = params), []);
    const [query, setQ] = useState('');
    const [focused, setFocused] = useState(false);
    const setQuery = useCallback((value) => {
        setQ(value);
        navigation.current?.resetIndexToSelect();
    }, []);
    const onChange = useCallback((e) => setQuery(e.target.value), [setQuery]);
    const onKeyDown = useMemo(() => {
        const handler = (keyCombo, event) => {
            switch (keyCombo) {
                case 'Escape':
                    event.preventDefault();
                    if (query) {
                        setQuery('');
                        event.stopPropagation();
                    }
                    if ($inputRef?.current) {
                        $inputRef?.current?.blur();
                        event.stopPropagation();
                    }
                    return;
                default:
                    navigation.current?.onKeyDown(keyCombo, event);
            }
        };
        return onElementKeyDownFactory(handler);
    }, [query, setQuery, $inputRef]);
    const onFocus = useCallback(() => {
        setFocused(true);
    }, []);
    const onBlur = useCallback(() => {
        setFocused(false);
    }, []);
    const reset = useCallback(() => {
        setQuery('');
    }, [setQuery]);
    const prevQuery = useRef();
    const [becameEmpty, setBecameEmpty] = useState(false);
    useLayoutEffect(() => {
        /**
         * Важно сбрасывать becameEmpty только при фокусе инпута, так как если это делать
         * при потере фокуса, то возможны моргания интерфейса, так как при закрытии
         * интерфейса поиска смотрим на дебаунсенное значение focused для корректной
         * работы SegmentedControl.
         */
        if (focused) {
            setBecameEmpty(false);
        }
    }, [focused]);
    useLayoutEffect(() => {
        // Не даем отрисоваться с неактуальным значением - чтобы не было дергания
        setBecameEmpty(!query && !!prevQuery.current);
        prevQuery.current = query;
    }, [query]);
    return {
        onChange,
        onKeyDown,
        onFocus,
        onBlur,
        reset,
        isFocused: focused,
        becameEmpty,
        setNavigationParams,
        query,
        setQuery,
    };
}
const defaultConvoSearchResults = new Set();
/**
 * Хук с логикой поиска бесед (запросом к API и с поиском по данным на клиенте).
 */
export function useConvoSearchData({ defaultResults = defaultConvoSearchResults, searchIndex, query, }) {
    const convos = useConvos();
    const featureFlags = useFeatureFlags();
    const [state, setState] = useState({ isLoading: false, results: defaultResults });
    const isResultsDefault = useRef(true); // Флаг нужный для списка друзей в Fast Chats
    const { debounced: debouncedQuery, debouncedUpdatesCount } = useDebounced(query, SEARCH_DEBOUNCE_MS);
    const apiFetch = useApiFetch();
    const owner = useOwner();
    const insertIntoCache = useInsertIntoCache();
    const isQueryEmpty = query.length === 0;
    const peers = usePeers();
    useEffect(() => {
        if (!isQueryEmpty) {
            return;
        }
        isResultsDefault.current = true;
        setState({
            isLoading: false,
            results: defaultResults,
        });
    }, [isQueryEmpty, defaultResults]);
    useEffect(() => {
        if (isQueryEmpty) {
            return;
        }
        isResultsDefault.current = false;
        // Ищем по данным, доступным на клиенте.
        let results = searchIndex
            ? Trie.search(searchIndex, query, {
                direct: true,
                translit: featureFlags.vkm_search_convos_new_sort,
            })
            : new Set();
        /**
         * Удаленные беседы могут быть как в поисковом индексе, так и в ответах с сервера
         * Исключаем лишние результаты чтобы не показывать чаты в которые мы не можем перейти
         * @see https://jira.mvk.com/browse/ME-42312
         */
        if (featureFlags.vkm_delete_chat) {
            results = new Set([...results].filter((peerId) => {
                const convo = Convo.safeGet(convos, peerId);
                return !Convo.isDeleted(convo);
            }));
        }
        const sortedResults = sortConvoSearchResults({
            results,
            query,
            convosCache: convos,
            peersCache: peers,
            featureFlags,
        });
        setState({
            isLoading: true,
            results: sortedResults,
        });
        // Исключили из зависимостей searchIndex, так как он изменяется при вызове
        // insertIntoCache внутри searchConversations, это приводит к циклическим вызовам эффекта.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, isQueryEmpty]);
    const $convos = useRef(convos);
    $convos.current = convos;
    const $peers = useRef(peers);
    $peers.current = peers;
    const queryRef = useRef(query);
    queryRef.current = query;
    const serverSearch = useCallback(async (requestQuery) => {
        if (requestQuery.length === 0) {
            return;
        }
        setState((prevState) => ({
            ...prevState,
            loading: true,
        }));
        try {
            const response = await searchConversations(apiFetch, featureFlags, insertIntoCache, requestQuery, getOwnerGroupId(owner.id));
            // Используем ниже мутабельный реф queryRef, чтобы работать именно с
            // актуальным значением query на момент ответа на запрос API.
            // Без рефов мы были получили значения актуальные на момент вызова функции.
            if (queryRef.current !== requestQuery) {
                // Если query изменился, пока мы ждали запрос, то нам не нужно ничего делать,
                // в том числе переводить loading в false, поэтому строка: setLoading(false)
                // дублируется ниже в try и в блоке catch, а не используется в finally.
                return;
            }
            const sortedResponse = sortConvoSearchResults({
                results: response,
                query,
                /**
                 * Необходимо использовать актуальные данные кэша чатов
                 * после асинхронного вызова searchConversations.
                 */
                convosCache: $convos.current,
                peersCache: $peers.current,
                featureFlags,
            });
            setState((prevState) => {
                const results = new Set([...prevState.results.values()]);
                sortedResponse.forEach((peerId) => {
                    // Если пир - ранее сконвертированный контакт, то не добавляем его в результаты
                    if (Peer.isContactPeerId(peerId)) {
                        const peer = $peers.current.get(peerId);
                        if (peer?.kind === 'Contact' && peer.userId) {
                            return;
                        }
                    }
                    // Добавляем только те результаты, которых не было на клиенте
                    if (results.has(peerId)) {
                        return;
                    }
                    results.add(peerId);
                });
                return {
                    isLoading: false,
                    results,
                };
            });
        }
        catch {
            setState((prevState) => ({
                ...prevState,
                loading: false,
            }));
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Необходима зависимость на peers для актуальной фильтрации
    [apiFetch, insertIntoCache, owner.id, peers, query, featureFlags]);
    useEffect(() => {
        void serverSearch(debouncedQuery);
        // Не указываем в зависимости serverSearch, так как это легко приведет к
        // циклическим зависимостям при возможных изменениях логики serverSearch.
        //
        // debouncedUpdatesCount в зависимостях нужен для кейса:
        // добавляешь одну букву и не дожидаясь дебаунса стираешь ее, в таком случае
        // нужно отправить снова запрос к API, потому что поиском на клиенте данные с
        // прошлого запроса уже затерлись, а при этом debouncedQuery остался тот же.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedUpdatesCount, debouncedQuery]);
    const { isLoading, results } = state;
    return {
        results,
        isLoading,
        isDefault: isResultsDefault.current,
    };
}
function sortConvoSearchResults({ results, query, convosCache, peersCache, featureFlags, }) {
    if (!featureFlags.vkm_search_convos_new_sort) {
        return results;
    }
    const sortedArray = [...results.values()].sort((a, b) => {
        const convoA = Convo.safeGet(convosCache, a);
        const peerA = Peer.safeGet(peersCache, a);
        const isMatchFoundA = isMatchFound(doVariativeSearch({
            content: Peer.name(peerA),
            search: query,
            withLocalCase: false,
        }));
        const convoB = Convo.safeGet(convosCache, b);
        const peerB = Peer.safeGet(peersCache, b);
        const isMatchFoundB = isMatchFound(doVariativeSearch({
            content: Peer.name(peerB),
            search: query,
            withLocalCase: false,
        }));
        if (isMatchFoundA !== isMatchFoundB) {
            return isMatchFoundA ? -1 : 1;
        }
        return convoB.minorSortId - convoA.minorSortId;
    });
    return new Set(sortedArray);
}
const defaultSearchMessagesResults = [];
/**
 * Хук с логикой работы с API для поиска сообщений.
 * Если не передан параметр peerId, сообщения ищутся по всем беседам.
 */
export function useMessagesSearchData({ query, date, peerId, }) {
    const isQueryEmpty = query.length === 0 && !date;
    const { logger } = useBrowserEnv();
    const owner = useOwner();
    const insertIntoCache = useInsertIntoCache();
    const featureFlags = useFeatureFlags();
    const apiFetch = useApiFetch();
    const [state, setState] = useState({
        isLoading: false,
        hasMore: true,
        results: defaultSearchMessagesResults,
    });
    const offset = useRef(0);
    const queryRef = useRef(query);
    queryRef.current = query;
    const loadResults = useCallback(async (requestQuery) => {
        if (isQueryEmpty) {
            return;
        }
        setState((prevState) => ({
            ...prevState,
            isLoading: true,
        }));
        try {
            const response = await searchMessages(apiFetch, logger, featureFlags, insertIntoCache, {
                q: requestQuery,
                peer_id: peerId,
                date,
                offset: offset.current,
                group_id: getOwnerGroupId(owner.id),
            });
            // Используем ниже мутабельный реф queryRef, чтобы работать именно с
            // актуальным значением query на момент ответа на запрос API.
            // Без рефов мы были получили значения актуальные на момент вызова функции.
            if (queryRef.current !== requestQuery) {
                // Если query изменился, пока мы ждали запрос, то нам не нужно ничего делать,
                // в том числе переводить loading в false, поэтому строка: setLoading(false)
                // дублируется ниже в try и в блоке catch, а не используется в finally.
                return;
            }
            const { results, count, apiItemsCount } = response;
            offset.current += apiItemsCount;
            setState((prevState) => ({
                isLoading: false,
                hasMore: count > offset.current && apiItemsCount > 0,
                results: [...prevState.results, ...results],
            }));
        }
        catch {
            setState((prevState) => ({
                ...prevState,
                isLoading: false,
                // Убираем бесконечно висящий спиннер
                hasMore: false,
            }));
        }
    }, [
        isQueryEmpty,
        peerId,
        date,
        apiFetch,
        featureFlags,
        insertIntoCache,
        logger,
        owner.id,
    ]);
    const { isLoading, hasMore, results } = state;
    const loadMore = useCallback(() => {
        if (!hasMore || isLoading) {
            return;
        }
        void loadResults(query);
    }, [hasMore, isLoading, loadResults, query]);
    useLayoutEffect(() => {
        offset.current = 0;
        if (isQueryEmpty) {
            setState({
                isLoading: false,
                hasMore: false,
                results: defaultSearchMessagesResults,
            });
            return;
        }
        setState({
            isLoading: true,
            hasMore: true,
            results: [],
        });
        void loadResults(query);
        // Не запускаем еффект при изменении loadResults, так как это может
        // привести к багам: зацикливаемости или неожиданным загрузкам данных
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isQueryEmpty, query, peerId, date]);
    const isResultEmpty = results.length === 0 && !isLoading && !hasMore && !isQueryEmpty;
    return {
        results: isResultEmpty ? 'empty' : results,
        isLoading,
        hasMore,
        loadMore,
    };
}
export function usePostsSearchData({ query, channelId, }) {
    const isQueryEmpty = query.length === 0;
    const { logger } = useBrowserEnv();
    const insertIntoCache = useInsertIntoCache();
    const apiFetch = useApiFetch();
    const [state, setState] = useState({
        isLoading: false,
        hasMore: true,
        results: [],
    });
    const offset = useRef(0);
    const queryRef = useRef(query);
    queryRef.current = query;
    const loadResults = useCallback(async (requestQuery) => {
        if (isQueryEmpty) {
            return;
        }
        setState((prevState) => ({
            ...prevState,
            isLoading: true,
        }));
        try {
            if (!channelId) {
                return;
            }
            const response = await searchPosts(apiFetch, logger, insertIntoCache, {
                query: requestQuery,
                channelId,
                offset: offset.current,
            });
            // Используем ниже мутабельный реф queryRef, чтобы работать именно с
            // актуальным значением query на момент ответа на запрос API.
            // Без рефов мы были получили значения актуальные на момент вызова функции.
            if (queryRef.current !== requestQuery) {
                // Если query изменился, пока мы ждали запрос, то нам не нужно ничего делать,
                // в том числе переводить loading в false, поэтому строка: setLoading(false)
                // дублируется ниже в try и в блоке catch, а не используется в finally.
                return;
            }
            const { results, apiItemsCount } = response;
            offset.current += apiItemsCount;
            setState((prevState) => ({
                isLoading: false,
                hasMore: SEARCH_POSTS_COUNT === apiItemsCount,
                results: [...prevState.results, ...results],
            }));
        }
        catch {
            setState((prevState) => ({
                ...prevState,
                isLoading: false,
                // Убираем бесконечно висящий спиннер
                hasMore: false,
            }));
        }
    }, [isQueryEmpty, apiFetch, insertIntoCache, logger, channelId]);
    const { isLoading, hasMore, results } = state;
    const loadMore = useCallback(() => {
        if (!hasMore || isLoading) {
            return;
        }
        void loadResults(query);
    }, [hasMore, isLoading, loadResults, query]);
    useLayoutEffect(() => {
        offset.current = 0;
        if (isQueryEmpty) {
            setState({
                isLoading: false,
                hasMore: false,
                results: [],
            });
            return;
        }
        setState({
            isLoading: true,
            hasMore: true,
            results: [],
        });
        void loadResults(query);
        // Не запускаем еффект при изменении loadResults, так как это может
        // привести к багам: зацикливаемости или неожиданным загрузкам данных
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isQueryEmpty, query, channelId]);
    const isResultEmpty = results.length === 0 && !isLoading && !hasMore && !isQueryEmpty;
    return {
        results: isResultEmpty ? 'empty' : results,
        isLoading,
        hasMore,
        loadMore,
    };
}
const USERS_GLOBAL_SEARCH_COUNT = 20;
const USERS_GLOBAL_SEARCH_DEFAULT_RESULTS = [];
/**
 * Хук с логикой работы с API для поиска пользователей, которых нет в друзьях.
 */
export function useUsersGlobalSearchData({ query, enabled, }) {
    const isQueryEmpty = query.length === 0;
    const apiFetch = useApiFetch();
    const { profileType } = useViewer();
    const isEnabled = enabled && !Viewer.isEdu(profileType);
    const insertIntoCache = useInsertIntoCache();
    const [state, setState] = useState({
        isLoading: false,
        hasMore: true,
        results: USERS_GLOBAL_SEARCH_DEFAULT_RESULTS,
    });
    const offset = useRef(0);
    const queryRef = useRef(query);
    queryRef.current = query;
    const loadResults = useCallback(async (requestQuery) => {
        if (isQueryEmpty) {
            return;
        }
        setState((prevState) => ({
            ...prevState,
            isLoading: true,
        }));
        try {
            const response = await searchUsersGlobal(apiFetch, insertIntoCache, {
                q: requestQuery,
                offset: offset.current,
                count: USERS_GLOBAL_SEARCH_COUNT,
            });
            // Используем ниже мутабельный реф queryRef, чтобы работать именно с
            // актуальным значением query на момент ответа на запрос API.
            // Без рефов мы были получили значения актуальные на момент вызова функции.
            if (queryRef.current !== requestQuery) {
                // Если query изменился, пока мы ждали запрос, то нам не нужно ничего делать,
                // в том числе переводить loading в false, поэтому строка: setLoading(false)
                // дублируется ниже в try и в блоке catch, а не используется в finally.
                return;
            }
            const { results, count } = response;
            // results.length приводит к дублям при дозагрузке,
            // так как присылается меньше переданного count.
            offset.current += USERS_GLOBAL_SEARCH_COUNT;
            setState((prevState) => ({
                isLoading: false,
                hasMore: count > offset.current &&
                    // результаты могут закончиться раньше полученного count.
                    results.length !== 0,
                results: [...prevState.results, ...results],
            }));
        }
        catch {
            setState((prevState) => ({
                ...prevState,
                isLoading: false,
                // Убираем бесконечно висящий спиннер
                hasMore: false,
            }));
        }
    }, [isQueryEmpty, apiFetch, insertIntoCache]);
    const { isLoading, hasMore, results } = state;
    const loadMore = useCallback(() => {
        if (!hasMore || isLoading || !isEnabled) {
            return;
        }
        void loadResults(query);
    }, [hasMore, isLoading, loadResults, query, isEnabled]);
    const reset = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            hasMore: true,
            results: USERS_GLOBAL_SEARCH_DEFAULT_RESULTS,
        }));
    }, []);
    useLayoutEffect(() => {
        offset.current = 0;
        if (isQueryEmpty || !isEnabled) {
            setState({
                isLoading: false,
                hasMore: false,
                results: USERS_GLOBAL_SEARCH_DEFAULT_RESULTS,
            });
            return;
        }
        setState({
            isLoading: true,
            hasMore: true,
            results: USERS_GLOBAL_SEARCH_DEFAULT_RESULTS,
        });
        void loadResults(query);
        // Не запускаем еффект при изменении loadResults, так как это может
        // привести к багам: зацикливаемости или неожиданным загрузкам данных
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isQueryEmpty, query, isEnabled]);
    return {
        results,
        isLoading,
        hasMore,
        loadMore,
        reset,
    };
}
const getConvoIds = (results) => {
    return Array.from(results.values());
};
const useSearch = ({ query, defaultQuery, searchCount, defaultResults = [], loadResults, isQueryEmpty, isQueryEqual, }) => {
    const { api } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const insertIntoCache = useInsertIntoCache();
    const { debounced: debouncedQuery } = useDebounced(query, SEARCH_DEBOUNCE_MS);
    const [state, setState] = useState({
        results: defaultResults,
        hasMore: true,
        query: defaultQuery,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(undefined);
    const $lastFetchedQuery = useRef(defaultQuery);
    const $offset = useRef(0);
    const $trackId = useRef(undefined);
    const reset = useCallback(() => {
        setState({ results: defaultResults, hasMore: true, query: defaultQuery });
        $lastFetchedQuery.current = defaultQuery;
        $offset.current = 0;
        $trackId.current = undefined;
        setIsLoading(false);
        setError(undefined);
    }, [defaultResults, defaultQuery]);
    const queryUUID = useMemo(() => {
        return nanoid();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);
    const searchApi = useCallback(async (query, offset = 0) => loadResults((method, params, opts) => {
        if ($trackId.current)
            api.dangerouslyAbort($trackId.current);
        const trackId = IApi.resolveTrackId(method, nanoid(5));
        $trackId.current = trackId;
        return apiFetch(method, params, { ...opts, trackId });
    }, insertIntoCache, {
        query,
        offset,
        count: searchCount,
        queryUUID,
    }), [api, apiFetch, loadResults, searchCount, insertIntoCache, queryUUID]);
    const fetchData = useCallback(async (query, offset) => {
        setIsLoading(true);
        setError(undefined);
        try {
            const response = await searchApi(query, offset);
            /**
             * Может получится так, что был сделан более актуальный запрос, а
             * этот мы не успели абортнуть. Тогда просто проигнорируем его.
             */
            if (query !== $lastFetchedQuery.current)
                return;
            setState((prev) => ({
                results: offset
                    ? [...prev.results, ...response.items]
                    : response.items,
                hasMore: response.apiCount > $offset.current && !!response.items.length,
                query,
            }));
            $offset.current = (offset ?? 0) + searchCount;
            setIsLoading(false);
        }
        catch (err) {
            /**
             * Ничего не делаем, так как этот запрос уже неактуален и
             * был отменен перед выполнением другого запроса
             * на более актуальный query
             */
            if (err instanceof IApi.AbortError) {
                return;
            }
            // Дополнительно проверяем, что это ошибка для актуального query.
            if (err instanceof IApi.RequestError &&
                query === $lastFetchedQuery.current) {
                setError(err);
                setIsLoading(false);
            }
        }
    }, [searchApi, searchCount]);
    const loadMore = useCallback(() => {
        if (!state.hasMore || isLoading)
            return;
        fetchData($lastFetchedQuery.current, $offset.current);
    }, [fetchData, isLoading, state.hasMore]);
    const retry = useCallback(() => {
        if (error === undefined) {
            return;
        }
        fetchData($lastFetchedQuery.current, $offset.current);
    }, [fetchData, error]);
    useEffect(() => {
        $lastFetchedQuery.current = debouncedQuery;
        if (isQueryEqual(debouncedQuery, state.query)) {
            return;
        }
        fetchData(debouncedQuery);
        // Запускаем эффект только при изменении debouncedQuery.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery]);
    useEffect(() => {
        setIsLoading(query !== state.query);
        if (isQueryEmpty(query)) {
            reset();
        }
        /**
         * Запускаем эффект только при изменении query или isQueryEmpty.
         * Тут никаких запросов не нужно. Просто максимально быстро реагируем
         * на изменения, чтобы обновить статус загрузки не дожидаясь дебаунса.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, isQueryEmpty]);
    return { ...state, isLoading, error: error, loadMore, retry };
};
const isChannelsSearchQueryEmpty = (query) => query.length === 0;
const isChannelsSearchQueryEqual = (newQuery, currentQuery) => newQuery === currentQuery;
export function useChannelsSearchData({ query, }) {
    const { withNewChannels } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const loadResults = useCallback(async (apiFetch, insertIntoCache, params) => {
        return searchChannels(apiFetch, insertIntoCache, params, featureFlags);
    }, [featureFlags]);
    const searchState = useSearch({
        query,
        defaultQuery: '',
        isQueryEmpty: isChannelsSearchQueryEmpty,
        isQueryEqual: isChannelsSearchQueryEqual,
        searchCount: SEARCH_CHANNELS_COUNT,
        loadResults,
    });
    if (withNewChannels) {
        searchState.results = searchState.results.filter((channel) => {
            /**
             * Вот здесь мы перестраховываемся.
             * И старые и новые каналы используют один метод channels.search
             * во время поиска мы "запоминаем" локально айдишники каналов на которые кликал пользователь,
             * чтобы при инициализации мессенджера дозагрузить их как "Недавние".
             * Но если бэк скрутит ручку с channels.search для новых каналов по какой-либо причине, то апи метод будет
             * возвращать старые каналы и при клике на них в вкком и мвк пользователь увидит заглушки "Канал заблочен или удалён",
             * а мы запомним айдишник старого канала, который при инициализации попадёт в channels.getById и положит весь execute.
             *
             * Ручка бэкенда: https://pmcmanager.mvk.com/Confdata/key/messages.enabled.big_channel.channels_search/
             */
            return Channel.isCommunityChannel(channel);
        });
        return searchState;
    }
    return searchState;
}
const isSearchConversationMembersQueryEmpty = (query) => !query.query;
const isSearchConversationMembersQueryEqual = (newQuery, currentQuery) => newQuery.query === currentQuery.query;
export function useSearchConversationMembers({ query, peerId, }) {
    const owner = useOwner();
    const featureFlags = useFeatureFlags();
    const { searchCount = MEMBERS_SEARCH_COUNT } = featureFlags.vkm_members_search_pagination || {};
    const loadResults = useCallback(async (apiFetch, insertIntoCache, { query, count }) => searchConversationMembers(apiFetch, insertIntoCache, {
        query,
        count,
        peerId,
        ownerId: owner.id,
    }), [owner.id, peerId]);
    return useSearch({
        query,
        defaultQuery: {},
        isQueryEmpty: isSearchConversationMembersQueryEmpty,
        isQueryEqual: isSearchConversationMembersQueryEqual,
        searchCount,
        loadResults,
    });
}
const isSearchSferumContactsQueryEmpty = (query) => query === '';
const isSearchSferumContactsQueryEqual = (newQuery, currentQuery) => newQuery === currentQuery;
export function useSearchSferumContacts(query, onError) {
    const loadResults = useCallback(async (apiFetch, insertIntoCache, { query, count }) => {
        const apiFetchWithSnackbar = async (...args) => {
            try {
                const response = await apiFetch(...args);
                return response;
            }
            catch (error) {
                onError();
                throw error;
            }
        };
        return searchSferumContacts(apiFetchWithSnackbar, insertIntoCache, {
            query,
            count,
        });
    }, [onError]);
    return useSearch({
        query,
        defaultQuery: '',
        isQueryEmpty: isSearchSferumContactsQueryEmpty,
        isQueryEqual: isSearchSferumContactsQueryEqual,
        searchCount: EDU_CONTACTS_SEARCH_COUNT,
        loadResults,
    });
}
//# sourceMappingURL=useSearch.js.map