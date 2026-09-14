import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { useBrowserEnv, useDebounced, useInsertIntoCache, usePeers, useViewer, } from '../../hooks/misc';
import { usePicker, usePickerSearch, } from '../../hooks/usePicker';
import * as Peer from '../../../core/model/Peer';
import * as Trie from '../../../core/model/Trie';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
import '../../ui/ConvoPicker/ConvoPicker.css';
import { fromApiContact, fromApiUser } from '../../../data/converter/PeerConverter';
import { NoResults } from '../../ui/NoResults/NoResults';
import { Icon56UsersOutline } from '@vkontakte/icons';
import '../../ui/PeersPicker/PeersPicker.css';
import { debounce, exhaustivenessCheck } from '../../../core/utils/misc';
import { useUsersGlobalSearchData } from '../../hooks/useSearch';
import { SEARCH_DEBOUNCE_MS } from '../../../core/config/config';
import * as Viewer from '../../../core/model/Viewer';
import { SearchInputChip, } from '../../ui/SearchInputChip/SearchInputChip';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { Chip } from '../../ui/Chip/Chip';
import { classNames as cx } from '@vkontakte/vkjs';
import { fromApiOrganizationGroup } from '../../../data/converter/OrganizationConverter';
import { FormattedPhoneNumber } from '../../ui/FormattedPhoneNumber/FormattedPhoneNumber';
import { nanoid } from 'nanoid';
import { useApiFetch } from '../../hooks/useApiFetch';
const NO_SELECTION = [];
/**
 * Лимит количества выбранных друзей
 * Чаты могут содержать разное количество пользователей
 * Технически сейчас просто большая цифра, поскольку сейчас мы не можем определить точный лимит создаваемого чата
 */
const SELECTION_LIMIT = 300 - 1; // Лимит минус текущий пользователь
const SEARCH_PAGE_SIZE = 20;
export const PeersPicker = ({ selectedPeerIds = NO_SELECTION, phoneNumbers, initialQuery = '', onPeersSelectionChange, onPhoneNumbersChange, onQueryChange, buttons, strategy = 'singular', listRenderer: List = PeerPickerList, listFilter, controlSide = 'left', className, fromConvo, searchInputPlaceholder, limit = SELECTION_LIMIT, customLangs = {}, getItemDescription: externalGetItemDescription, checkDisabledItem: externalCheckDisabledItem, customFetchPeers, viewerAsFavorites = true, convo, autoFocus, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const insertIntoCache = useInsertIntoCache();
    const peers = usePeers();
    const [userIds, setUserIds] = useState([]);
    const offset = useRef(0);
    const [searchTotal, setSearchTotal] = useState(null);
    const [chatMembers, setChatMembers] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [hasFailed, setFailed] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');
    const [globalResults, setGlobalResults] = useState([]);
    const trackIdRef = useRef(nanoid());
    const [friendsFinished, setFriendsFinished] = useState(false);
    const viewer = useViewer();
    const isService = Viewer.isService(viewer);
    const isEdu = Viewer.isEdu(viewer.profileType);
    const eduSections = useRef([]);
    const isSferumContactsList = isEdu;
    const toSelection = useCallback((peerIds) => {
        const map = new Map();
        peerIds.forEach((peerId) => {
            if (listFilter === undefined || listFilter(peerId)) {
                map.set(peerId.toString(), {
                    kind: 'peer',
                    peerId,
                });
            }
        });
        return map;
    }, [listFilter]);
    const [selection, setSelection] = useState(toSelection(selectedPeerIds));
    const getSelectionPeerIds = (selection) => {
        const items = Array.from(selection.values());
        const ids = [];
        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            if (!item) {
                continue;
            }
            switch (item?.kind) {
                case 'peer':
                case 'edu_peer':
                    ids.push(item.peerId);
                    break;
                case 'template':
                    continue;
                default:
                    exhaustivenessCheck(item);
            }
        }
        return ids;
    };
    useEffect(() => {
        setSelection((prevSelection) => {
            const values = getSelectionPeerIds(prevSelection);
            const isEqual = values.length === selectedPeerIds.length &&
                values.every((value) => selectedPeerIds.includes(value));
            if (isEqual) {
                // Поскольку этот компонент работает с массивами, а пикер с Map,
                // то добиться ссылочного равенства между коллекциями нельзя.
                // Проверяем вручную, что приходит снаружи компонента,
                // чтобы не провоцировать лишний вызов цепочки апдейта данных
                return prevSelection;
            }
            return toSelection(selectedPeerIds);
        });
    }, [selectedPeerIds, toSelection]);
    const getItemId = useCallback((item) => {
        switch (item.kind) {
            case 'peer':
            case 'edu_peer':
                return item.peerId.toString();
            case 'template':
                return item.id;
            default:
                return exhaustivenessCheck(item);
        }
    }, []);
    const checkDisabledItem = useCallback((item) => {
        if (externalCheckDisabledItem && 'peerId' in item) {
            return externalCheckDisabledItem(item.peerId);
        }
        if (item.kind === 'template' && item.disabled) {
            return true;
        }
        // Не даем выбирать больше пользователей, чем допустимо
        return selection.has(getItemId(item)) ? false : selection.size >= limit;
    }, [getItemId, selection, limit, externalCheckDisabledItem]);
    const getItemDescription = useCallback((item) => {
        if (externalGetItemDescription && 'peerId' in item) {
            return externalGetItemDescription(item.peerId);
        }
        return undefined;
    }, [externalGetItemDescription]);
    const searchInChatMembers = useCallback(({ query }, fromConvo) => {
        const chatMemberIds = new Set(getChatMembers(fromConvo));
        const memberPeers = [...chatMemberIds.values()].reduce((acc, peerId) => {
            const peer = Peer.safeGet(peers, peerId);
            return acc.set(peer.id, peer);
        }, new Map());
        const searchIndex = Trie.add(Trie.create(), [...memberPeers.values()], (peer) => ({
            id: peer.id,
            strings: Trie.peerWords(peer),
        }));
        const matchesPeerIds = [...Trie.search(searchIndex, query).values()];
        setChatMembers(matchesPeerIds);
    }, [peers]);
    const { debounced: debouncedQuery } = useDebounced(currentQuery, SEARCH_DEBOUNCE_MS);
    const globalSearch = useUsersGlobalSearchData({
        query: debouncedQuery,
        enabled: !isEdu,
    });
    const searchIndexRef = useRef(Trie.create());
    useEffect(() => {
        Trie.add(searchIndexRef.current, userIds.map((id) => Peer.safeGet(peers, id)), (peer) => ({
            id: peer.id,
            strings: Trie.peerWords(peer),
        }));
    }, [peers, userIds]);
    const fetchPeers = useCallback(async ({ query, offset }) => {
        const peerIds = [];
        const sections = [];
        let total = 0;
        switch (true) {
            case isSferumContactsList:
                const responseEduContactList = await apiFetch('messagesEdu.usersSearch', {
                    q: query,
                    offset,
                    count: SEARCH_PAGE_SIZE,
                    extended: 1,
                });
                insertIntoCache({
                    profiles: responseEduContactList.profiles,
                    contacts: responseEduContactList.contacts,
                });
                sections.push(...(responseEduContactList.sections?.map(fromApiOrganizationGroup) ?? []));
                total = responseEduContactList.total_count;
                break;
            case isService:
                const responseContacts = await apiFetch('account.getContactList', {
                    extended: 1,
                    offset: offset,
                }, { retries: 1 });
                insertIntoCache({
                    contacts: responseContacts.contacts,
                });
                responseContacts?.contacts?.forEach((contact) => {
                    const model = fromApiContact(contact);
                    if (!model) {
                        return;
                    }
                    peerIds.push(model.id);
                });
                if (responseContacts?.contacts?.length) {
                    total = responseContacts?.contacts?.length;
                }
                break;
            default:
                const response = await apiFetch('friends.search', {
                    q: query,
                    offset: offset,
                    count: SEARCH_PAGE_SIZE,
                });
                insertIntoCache({
                    profiles: response.items,
                });
                response?.items.forEach((user) => {
                    const model = fromApiUser(user);
                    if (!model) {
                        return;
                    }
                    peerIds.push(model.user.id);
                });
                total = response.count;
        }
        return {
            peerIds,
            totalCount: total,
            eduSections: sections,
        };
    }, [isSferumContactsList, apiFetch, insertIntoCache, isService]);
    const search = useCallback(async ({ query }) => {
        try {
            const trackId = trackIdRef.current;
            setLoading(true);
            setFailed(false);
            const fetchPeersParams = {
                query,
                offset: offset.current,
            };
            const searchResult = await (customFetchPeers || fetchPeers)(fetchPeersParams);
            const { peerIds, eduSections: sections } = searchResult;
            let { totalCount } = searchResult;
            // Если поисковой запрос поменялся в процессе выполнения текущего запроса
            if (trackId !== trackIdRef.current) {
                return;
            }
            if (sections) {
                eduSections.current = mergeSections(eduSections.current, sections);
                totalCount += eduSections.current.length;
            }
            offset.current += SEARCH_PAGE_SIZE;
            peerIds.push(...Trie.search(searchIndexRef.current, query, {
                direct: false,
                localCased: true,
                translit: true,
            }));
            setUserIds((currentUserIds) => {
                const result = currentUserIds.slice();
                peerIds.forEach((peerId) => {
                    if (result.includes(peerId)) {
                        return;
                    }
                    result.push(peerId);
                });
                return result;
            });
            setSearchTotal(totalCount || null);
            setFriendsFinished(offset.current >= totalCount);
        }
        catch {
            setFailed(true);
        }
        finally {
            setLoading(false);
        }
    }, [fetchPeers, customFetchPeers]);
    useEffect(() => {
        setGlobalResults(() => globalSearch.results.filter((userId) => !userIds.includes(userId)));
    }, [globalSearch.results, userIds]);
    // Алгоритм удаленного поиска друзей
    const searchDebounced = useMemo(() => debounce(search, 300, false), [search]);
    const onSearch = useCallback((options) => {
        setLoading(true);
        trackIdRef.current = nanoid();
        offset.current = 0;
        if (isSferumContactsList) {
            setUserIds([]);
            eduSections.current = [];
        }
        else {
            setUserIds([
                ...Trie.search(searchIndexRef.current, options.query, {
                    direct: true,
                }),
            ]);
        }
        globalSearch.reset();
        searchDebounced(options);
        onQueryChange?.(options.query);
        if (fromConvo) {
            searchInChatMembers(options, fromConvo);
        }
    }, [
        isSferumContactsList,
        fromConvo,
        globalSearch,
        onQueryChange,
        searchDebounced,
        searchInChatMembers,
    ]);
    useEffect(() => {
        if (friendsFinished) {
            setLoading(globalSearch.isLoading);
        }
    }, [globalSearch.isLoading, friendsFinished]);
    const handleLoadMore = useCallback(() => {
        if (isLoading)
            return;
        void search({ query: currentQuery });
        globalSearch.loadMore();
    }, [currentQuery, isLoading, search, globalSearch]);
    const createEduPeerDescription = useCallback((group, rawPeerId) => {
        const peerId = Peer.resolveId(rawPeerId);
        const peer = Peer.safeGet(peers, peerId);
        if (group.organization.id && peer.kind === 'User') {
            // Участник образовательной организации
            const org = peer.eduRoles?.organizations.find((org) => org.id === group.organization.id);
            if (!org) {
                // Исключительный сценарий, когда пользователь есть, организация есть, а в модели она не пришла
                return '';
            }
            return [...org.roles].map((role) => role.name).join('; ');
        }
        else if (peer.kind === 'Contact' && !group.organization.id) {
            // Это контакт из блока контактов
            if (peer.userId) {
                // Это доверенный контакт
                const user = Peer.safeGet(peers, peer.userId);
                return user.kind === 'User' ? user.eduRoles?.mainRole ?? '' : '';
            }
            else {
                // Это НЕ доверенный контакт
                return (React.createElement(FormattedPhoneNumber, { phone: peer.phone, className: "PeerPickerListItem__info" }));
            }
        }
        return '';
    }, [peers]);
    const items = useMemo(() => {
        const listItems = [];
        if (buttons) {
            for (const button of buttons) {
                listItems.push({
                    kind: 'template',
                    id: button.id,
                    node: button.node,
                });
            }
        }
        const applyTransform = (peerIds, isGlobal = false) => peerIds
            .filter((peerId) => {
            return listFilter === undefined || listFilter(peerId);
        })
            .map((peerId) => {
            const peer = Peer.safeGet(peers, peerId);
            const isChatMember = convo?.members.memberIds.has(peerId);
            const isClosedPrivacySettings = peer?.kind === 'User' && !peer.canInviteToChats;
            let subhead = null;
            if (peer) {
                if (isChatMember) {
                    subhead = lang.use('me_user_chat_presence_status');
                }
                else if (isClosedPrivacySettings) {
                    subhead = lang.use('me_user_closed_intive_to_chat', {
                        sex: Peer.sex(peer),
                    });
                }
            }
            return {
                kind: 'peer',
                peerId,
                isGlobal,
                subhead,
            };
        });
        const filteredChatMembers = applyTransform(chatMembers);
        const filteredContacts = applyTransform(userIds);
        const filteredGlobalResults = applyTransform(globalResults, true);
        if (fromConvo && filteredChatMembers.length) {
            const addPeerIds = (peerIds) => {
                const selectedPeerIds = getSelectionPeerIds(selection);
                setSelection(toSelection([...selectedPeerIds, ...peerIds]));
            };
            const removePeerIds = (peerIds) => {
                setSelection((selection) => {
                    const selectedPeerIds = getSelectionPeerIds(selection);
                    const updatedSelection = selectedPeerIds.filter((peerId) => !peerIds.includes(peerId));
                    return toSelection(updatedSelection);
                });
            };
            listItems.push({
                kind: 'template',
                id: 'sample',
                node: (React.createElement(ChatMembersListSubheader, { selectedPeerIds: selectedPeerIds, convo: fromConvo, addPeerIds: addPeerIds, removePeerIds: removePeerIds, listFilter: listFilter })),
            }, ...filteredChatMembers);
        }
        if (isSferumContactsList) {
            /**
             * Специальный метод наполнения item'ов для Сферума – группировка по организациям, вывод ролей
             * Поскольку это в корне новый флоу вывода, собираем список отдельной веткой
             * @see https://jira.mvk.com/browse/ME-65302
             */
            eduSections.current.forEach((group) => {
                listItems.push({
                    kind: 'template',
                    id: group.organization.id || group.organization.name,
                    node: (React.createElement("div", { className: "PeersPicker__ListSubHeader" },
                        React.createElement("div", { className: "PeersPicker__ListSubHeaderTitle PeersPicker__ListSubHeaderTitle--org" }, group.organization.name))),
                    disabled: true,
                });
                listItems.push(...group.peerIds.map((peerId) => ({
                    kind: 'edu_peer',
                    peerId: Peer.resolveId(peerId),
                    node: createEduPeerDescription(group, peerId),
                })));
            });
        }
        else {
            if (filteredContacts.length) {
                if (filteredChatMembers.length) {
                    listItems.push({
                        kind: 'template',
                        id: 'sample',
                        node: (React.createElement("div", { className: "PeersPicker__ListSubHeader" },
                            React.createElement("div", { className: "PeersPicker__ListSubHeaderTitle" }, lang.use('me_all_interlocutors')))),
                    });
                }
                listItems.push(...filteredContacts);
            }
            if (friendsFinished && filteredGlobalResults.length) {
                listItems.push({
                    kind: 'template',
                    id: 'global_search',
                    node: (React.createElement("div", { className: "PeersPicker__ListSubHeader" },
                        React.createElement("div", { className: "PeersPicker__ListSubHeaderTitle" }, lang.use('me_global_search')))),
                });
                listItems.push(...filteredGlobalResults);
            }
        }
        return listItems;
    }, [
        createEduPeerDescription,
        eduSections,
        isSferumContactsList,
        buttons,
        chatMembers,
        userIds,
        globalResults,
        fromConvo,
        friendsFinished,
        listFilter,
        selectedPeerIds,
        selection,
        toSelection,
        lang,
        convo,
        peers,
    ]);
    const total = useMemo(() => {
        if (!searchTotal) {
            return null;
        }
        const hasMore = offset.current < searchTotal || globalSearch.hasMore;
        if (hasMore) {
            return null;
        }
        if (listFilter) {
            // Если нет данных для загрузки, берем фактический размер списка после фильтрации
            return items.length;
        }
        else {
            // Если данные берутся с сервера и выводятся как есть
            return searchTotal;
        }
    }, [searchTotal, offset, listFilter, items, globalSearch.hasMore]);
    const { toggleSelection, selection: currentSelection } = usePicker({
        strategy,
        selection,
    });
    const { query, onKeyDown, onQueryUpdate, indexToSelect, forceScrollToLoader, } = usePickerSearch({
        items,
        onSelect: toggleSelection,
        getItemId,
        onQueryChange: setCurrentQuery,
        initialQuery,
        hasMore: total === null || total > items.length,
    });
    useEffect(() => {
        onSearch({ query, offset: 0, count: 50 });
        // Запрос должен отправляться только при смене поискового запроса
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);
    useEffect(() => {
        onPeersSelectionChange(getSelectionPeerIds(currentSelection));
        /**
         * Исключаем onSelectionChange из зависимостей чтобы не провоцировать лишний вызов эффекта который
         * приведет к неправильному поведению компонента (вызов функции обратного вызова без реального
         * изменения данных). Поскольку ссылка на onSelectionChange всегда актуальна, решаем средствами
         * зависимостей чтобы не создавать лишнюю сложность (usePrevious).
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSelection]);
    const onChipRemove = useCallback((id) => {
        if (typeof id === 'string') {
            onPhoneNumbersChange?.((phoneNumbers ?? []).filter((phone) => phone !== id));
        }
        else {
            const item = items.find((entry) => entry.kind === 'peer' && entry.peerId === id);
            if (!item) {
                onPeersSelectionChange(selectedPeerIds.filter((peerId) => peerId !== id));
                return;
            }
            toggleSelection({
                id: getItemId(item),
                value: item,
            });
        }
    }, [
        getItemId,
        items,
        onPeersSelectionChange,
        onPhoneNumbersChange,
        phoneNumbers,
        selectedPeerIds,
        toggleSelection,
    ]);
    // Адаптер данных из обычной модели в модель данных под список
    const listItems = useMemo(() => {
        return items.map((item, index) => {
            const id = getItemId(item);
            const disabled = checkDisabledItem(item);
            return {
                id,
                item,
                selected: currentSelection.has(id),
                description: getItemDescription(item),
                disabled,
                focusedWithNavigation: index === indexToSelect && !disabled,
            };
        });
    }, [
        getItemId,
        checkDisabledItem,
        getItemDescription,
        items,
        currentSelection,
        indexToSelect,
    ]);
    useLayoutEffect(() => {
        if (indexToSelect !== -1) {
            listRef.current?.scrollToItem(indexToSelect);
        }
    }, [indexToSelect]);
    useLayoutEffect(() => {
        if (forceScrollToLoader) {
            listRef.current?.scrollToItem(indexToSelect + 1);
        }
    }, [forceScrollToLoader, indexToSelect]);
    const listRef = useRef(null);
    const chipRenderer = useCallback(({ id, onRemove, }) => {
        let peer = null;
        if (typeof id !== 'string') {
            peer = Peer.safeGet(peers, id);
            if (!peer) {
                return null;
            }
        }
        return (React.createElement(Chip, { key: id, name: peer ? Peer.firstName(peer) : id, fullName: peer ? Peer.name(peer) : `${id}`, avatar: peer && React.createElement(PeerAvatar, { peer: peer, size: 20, emptyAlt: true }), onRemove: onRemove, className: "PeersPicker__chip" }));
    }, [peers]);
    const allIds = useMemo(() => [...selectedPeerIds, ...(phoneNumbers ?? [])], [phoneNumbers, selectedPeerIds]);
    const ListComponent = useCallback(
    // @todo Какое-то сложное расхождение по типам между Picker, PickerList, PeersPicker, PeersPickerList
    // Нужно детальнее погрузиться в цепочку вложенности компонентов и привести типы в порядок.
    (props) => {
        return (React.createElement(List, { ...props, controlSide: controlSide, emptyNode: React.createElement(NoResults, { icon: React.createElement(Icon56UsersOutline, null), className: "PeersPicker__empty" }, customLangs.emptyResults ||
                lang.use('me_friends_picker_empty_results')) }));
    }, [List, lang, controlSide, customLangs.emptyResults]);
    return (React.createElement("div", { className: cx('PeersPicker', className) },
        React.createElement("div", { className: "PeersPicker__search" },
            React.createElement(SearchInputChip, { query: query, onQueryChange: onQueryUpdate, selection: allIds, onRemove: onChipRemove, onSearchInputKeyDown: onKeyDown, placeholder: searchInputPlaceholder ??
                    lang.use('me_friends_picker_search_placeholder'), autoFocus: autoFocus }, chipRenderer)),
        React.createElement(ListComponent, { items: listItems, total: total, onItemSelection: toggleSelection, loadMore: handleLoadMore, loading: isLoading, pristine: false, failed: hasFailed, listRef: listRef, viewerAsFavorites: viewerAsFavorites })));
};
const getChatMembers = (convo) => {
    const { members, adminIds } = convo.members;
    if (!members) {
        return [];
    }
    const sortedMembers = [
        ...[...adminIds].filter((id) => members.has(id)),
        ...members.keys(),
    ];
    return sortedMembers.filter((peerId) => Peer.isUserPeerId(peerId) || Peer.isContactPeerId(peerId));
};
const ChatMembersListSubheader = ({ convo, selectedPeerIds, addPeerIds, removePeerIds, listFilter = () => true, }) => {
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const convoTitle = Peer.safeGet(peers, convo.peerId).title;
    const fromConvoRef = useRef(convo);
    const addAllMembersFromConvo = useCallback(() => addPeerIds(getChatMembers(fromConvoRef.current).filter(listFilter)), [addPeerIds, listFilter]);
    const removeAllMembersFromConvo = useCallback(() => removePeerIds(getChatMembers(fromConvoRef.current).filter(listFilter)), [listFilter, removePeerIds]);
    const isAllChatMembersAdded = useMemo(() => {
        const chatMembers = getChatMembers(fromConvoRef.current).filter(listFilter);
        return !chatMembers.filter((peerId) => !selectedPeerIds.includes(peerId))
            .length;
    }, [listFilter, selectedPeerIds]);
    return (React.createElement("div", { className: "PeersPicker__ListSubHeader" },
        React.createElement("div", { className: "PeersPicker__ListSubHeaderTitle" }, lang.use('me_from_chat', { values: { chatTitle: convoTitle } })),
        isAllChatMembersAdded ? (React.createElement("button", { className: "PeersPicker__ListSubHeaderAsideButton", onClick: removeAllMembersFromConvo }, lang.use('me_remove_selection'))) : (React.createElement("button", { className: "PeersPicker__ListSubHeaderAsideButton", onClick: addAllMembersFromConvo }, lang.use('me_choose_all')))));
};
const mergeSections = (existing, update) => {
    const sections = Array.from(existing);
    update.forEach((group) => {
        const org = sections.find((existingOrg) => existingOrg.organization.id === group.organization.id);
        if (org) {
            org.peerIds.push(...group.peerIds);
        }
        else {
            sections.push(group);
        }
    });
    return sections;
};
//# sourceMappingURL=PeersPicker.js.map