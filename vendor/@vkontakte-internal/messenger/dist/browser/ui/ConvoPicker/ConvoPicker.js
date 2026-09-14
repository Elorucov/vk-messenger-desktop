import React, { useCallback, useEffect, useState, useMemo, useRef, } from 'react';
import { useBrowserEnv, useConvos, useConvosSearchIndex, useDispatch, useFeatureFlags, useInsertIntoCache, useOrganisers, useOwner, } from '../../hooks/misc';
import { fromApiConvo } from '../../../data/converter/ConvoConverter';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import * as Trie from '../../../core/model/Trie';
import { PeerChipsSearchInput } from '../../ui/PeerChipsSearchInput/PeerChipsSearchInput';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
import { Picker, } from '../../ui/Picker/Picker';
import '../../ui/ConvoPicker/ConvoPicker.css';
import cx from 'classnames';
import { getOwnerGroupId } from '../../../data/store/State';
import { useConvoOrganiser } from '../../hooks/useConvoOrganiser';
import { debounce, exhaustivenessCheck } from '../../../core/utils/misc';
import { SEARCH_CONVOS_COUNT } from '../../../core/config/config';
import { useApiFetch } from '../../hooks/useApiFetch';
const NO_SELECTION = [];
export const getItemId = (item) => {
    switch (item.kind) {
        case 'peer':
        case 'edu_peer':
            return item.peerId.toString();
        case 'template':
            return item.id;
        default:
            return exhaustivenessCheck(item);
    }
};
export const ConvoPicker = ({ filter = 'all', selectedPeerIds = NO_SELECTION, sublistsPeerIds, initialQuery = '', onQueryChange, onSelectionChange, checkDisabledItem, strategy = 'singular', previousStrategy, searchRenderer = PeerChipsSearchInput, listRenderer = PeerPickerList, templateItemsCount = 0, listFilter, className, withFavorites = false, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const dispatch = useDispatch();
    const insertIntoCache = useInsertIntoCache();
    const searchIndex = useConvosSearchIndex();
    const owner = useOwner();
    const convosCache = useConvos();
    const organisers = useOrganisers();
    const { selectedOrganiser, peerIds: organiserPeerIds, setSelectedOrganiser, hasMore, } = useConvoOrganiser(organisers, convosCache, { kind: 'filters', filter }, 'all');
    const [convoIds, setConvoIds] = useState(organiserPeerIds);
    const [isLoading, setLoading] = useState(false);
    const [hasFailed, setFailed] = useState(false);
    const [searchTotalCount, setSearchTotalCount] = useState(null);
    const lastQuery = useRef(null);
    const [currentQuery, setCurrentQuery] = useState(initialQuery);
    const isSearch = !!currentQuery;
    useEffect(() => {
        onQueryChange?.(currentQuery);
    }, [onQueryChange, currentQuery]);
    const localDirectSearch = useCallback((query) => Array.from(Trie.search(searchIndex, query, { direct: true }).values()), [searchIndex]);
    const localIndirectSearch = useCallback((query) => Array.from(Trie.search(searchIndex, query, {
        direct: false,
        localCased: true,
        translit: true,
    }).values()), [searchIndex]);
    useEffect(() => {
        setSelectedOrganiser({
            kind: 'filters',
            filter,
        });
    }, [setSelectedOrganiser, filter]);
    const toSelection = useCallback((peerIds) => {
        const map = new Map();
        peerIds.forEach((peerId) => {
            map.set(peerId.toString(), {
                kind: 'peer',
                peerId,
            });
        });
        return map;
    }, []);
    const [selection, setSelection] = useState(toSelection(selectedPeerIds));
    const getSelectionPeerIds = (selection) => {
        const items = Array.from(selection.values());
        const ids = [];
        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            if (item?.kind !== 'peer') {
                continue;
            }
            ids.push(item.peerId);
        }
        return ids;
    };
    useEffect(() => {
        const values = getSelectionPeerIds(selection);
        const isEqual = values.length === selectedPeerIds?.length &&
            values.every((value) => selectedPeerIds.includes(value));
        if (isEqual) {
            // Поскольку этот компонент работает с массивами, а пикер с Map, то добиться ссылочного равенства между коллекциями нельзя
            // Проверяем вручную что приходит снаружи компонента чтобы не провоцировать лишний вызов цепочки апдейта данных
            return;
        }
        setSelection(toSelection(selectedPeerIds));
        /**
         * Не вызываем повторную работу эффекта в случае изменения селекта (selection) чтобы не
         * провоцировать неправильную работу функции и не создавать лишнюю сложность (usePrevious)
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPeerIds, toSelection]);
    const loadMore = () => {
        dispatch({
            type: 'MoreConvosNeeded',
            organiser: selectedOrganiser,
        });
    };
    const search = useMemo(() => debounce(async (query) => {
        try {
            setLoading(true);
            setFailed(false);
            // Вывод результатов поиска (не поддерживает пагинацию)
            const result = await apiFetch('messages.searchConversations', {
                q: query,
                count: SEARCH_CONVOS_COUNT,
                extended: 1,
                group_id: getOwnerGroupId(owner.id),
            });
            if (lastQuery.current !== query) {
                return;
            }
            const total = result.count;
            const conversations = result.items;
            const profiles = result.profiles || [];
            const groups = result.groups || [];
            const contacts = result.contacts || [];
            insertIntoCache({
                profiles,
                groups,
                conversations,
                contacts,
            });
            const peerIds = [];
            conversations.forEach((convo) => {
                const model = fromApiConvo(featureFlags, convo);
                if (!model?.convo.peerId) {
                    return;
                }
                peerIds.push(model.convo.peerId);
            });
            peerIds.push(...localIndirectSearch(query));
            setConvoIds((currentConvoIds) => {
                const result = currentConvoIds.slice();
                peerIds.forEach((peerId) => {
                    if (result.includes(peerId)) {
                        return;
                    }
                    result.push(peerId);
                });
                return result;
            });
            setSearchTotalCount(total);
        }
        catch {
            setFailed(true);
        }
        finally {
            setLoading(false);
        }
    }, 300, false), [
        setLoading,
        setConvoIds,
        setSearchTotalCount,
        apiFetch,
        featureFlags,
        insertIntoCache,
        owner.id,
        localIndirectSearch,
    ]);
    // Отменяем дебаунс, чтобы не вызывался после анманута
    useEffect(() => {
        return () => {
            search.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (isSearch) {
            return;
        }
        // Если это данные из папки, записываем их в стейт для вывода в списке
        setConvoIds(organiserPeerIds);
        setLoading(hasMore);
    }, [isSearch, organiserPeerIds, hasMore, setConvoIds, setLoading]);
    const prefetch = ({ query }) => {
        if (!query) {
            /*
             * Не выполняем поиск для пустого запроса, поскольку в вызове search данные тянем в любом случае
             * тоже с локального кеша и поэтому нет смысла тянуть данные локально два раза вызывая двойной рендер
             */
            return;
        }
        const searchResults = localDirectSearch(query);
        setConvoIds(searchResults);
        if (searchResults.length === 0) {
            /**
             * Если в индексе ничего не нашлось, показываем лоадер чтобы пользователь не видел
             * пока ожидается отправка запроса к серверу через debounce
             */
            setLoading(true);
        }
    };
    const onSelection = (selection) => {
        setSelection(selection);
    };
    useEffect(() => {
        onSelectionChange(getSelectionPeerIds(selection));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection]);
    const getItemSubhead = useCallback((peerId) => {
        if (sublistsPeerIds?.includes(peerId)) {
            return lang.use('me_convo_picker_already_in_folder');
        }
        return undefined;
    }, [sublistsPeerIds, lang]);
    const items = useMemo(() => {
        let ids = convoIds;
        if (withFavorites && !isSearch) {
            ids = ids.filter((peerId) => !Peer.isFavorites(peerId, owner.id));
            ids.unshift(owner.id);
        }
        if (listFilter || filter === 'chats') {
            ids = ids.filter((peerId) => {
                const convo = Convo.safeGet(convosCache, peerId);
                if (listFilter && !listFilter(convo)) {
                    return false;
                }
                if (filter === 'chats' && !Peer.isChatPeerId(peerId)) {
                    return false;
                }
                return true;
            });
        }
        const items = ids.map((peerId) => ({
            kind: 'peer',
            peerId,
            subhead: getItemSubhead(peerId),
        }));
        return items;
    }, [
        convoIds,
        withFavorites,
        isSearch,
        listFilter,
        filter,
        owner.id,
        convosCache,
        getItemSubhead,
    ]);
    const total = useMemo(() => {
        if (isSearch) {
            if (searchTotalCount === null) {
                // Если это поиск, и количество результатов неизвестно
                return null;
            }
            /*
             * Если это поиск и мы знаем количество результатов на сервере, возвращаем
             * фактическое количество результатов после фильтрации
             */
            return items.length;
        }
        if (hasMore) {
            // Если в папке еще есть данные, возвращаем null (список бесконечный, будет загружаться)
            return null;
        }
        // Если все данные из папки загружены, выводим количество результатов после фильтрации
        return items.length + templateItemsCount;
    }, [isSearch, hasMore, items, searchTotalCount, templateItemsCount]);
    // Алгоритм удаленного поиска бесед
    const onSearch = async ({ query, offset, count, }) => {
        setFailed(false);
        lastQuery.current = query;
        if (!isSearch && query) {
            // Если произошел переход из общего списка бесед в поиск бесед
            setSearchTotalCount(null);
        }
        if (query) {
            search(query);
        }
        else {
            const to = offset + count;
            if (items.length <= to) {
                // Если в папке после фильтрации результатов менее чем нам нужно, загружаем дополнительные данные
                loadMore();
            }
        }
    };
    return (React.createElement(Picker, { items: items, total: total, isLoading: isLoading, hasFailed: hasFailed, onSelectionChange: onSelection, getItemId: getItemId, search: onSearch, prefetch: prefetch, initialQuery: initialQuery, selection: selection, listRenderer: listRenderer, searchRenderer: searchRenderer, strategy: strategy, previousStrategy: previousStrategy, checkDisabledItem: checkDisabledItem, onQueryChange: setCurrentQuery, className: cx('vkmConvoPicker', className) }));
};
//# sourceMappingURL=ConvoPicker.js.map