import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { CallsSearchResult } from '../../CallsSearchResult/CallsSearchResult';
import { COUNT_OF_CHAT_MEMBERS_TO_LOAD, COUNT_OF_FRIENDS_TO_LOAD, COUNT_OF_GROUP_MEMBERS_TO_LOAD, SearchResultType, } from '../../../constants';
import { EMPTY_PEER_ID, isParticipantContact, peerIdToVkId, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { getDefaultSuggests, isParticipantDisabled, isSelectedItem, nameGetter } from '../utils';
import { useLang } from '../../../hooks/useLang';
import { VkIndexer } from '@vkontakte-internal/vkjs/lib/Indexer';
import { EMembersType } from '../constants';
import { handlePromiseError } from '../../../helpers/logger';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useConfig } from '../../../services/config';
import { getCallConversation, getChatMembersCache, getChatMembersCount, getDevices, getFriendsCache, getFriendsCount, getGroupId, getGroupMembersCache, getGroupMembersCount, getPeerIdToDevices, getMembers, getMyId, getParticipants, getPeerId, getUnableToCallGroupMembersIds, } from '../../../selectors';
import { loadMoreChatMembers, loadMoreFriends, searchChatMembers, searchFriends, searchGroupMembers, } from '../../../services/callMembers';
import { addChatInfo, addFriends, addGroupMembers } from '../../../actions/callMembers';
/**
 * перенесенная бизнес логика из компонента `AddParticipants`,
 * которая постепенно перебирается на формат хуков
 */
export const useTabContentController = ({ onChange, initMembers, selected, personCache, memberType, }) => {
    const needFilterSearchSuggest = useRef(false);
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const searchTimeout = useRef(undefined);
    const { enableChatMembersPagination } = useConfig();
    // redux
    const friendsCache = useTypedSelector(getFriendsCache);
    const chatMembersCache = useTypedSelector(getChatMembersCache);
    const groupMembersCount = useTypedSelector(getGroupMembersCount);
    const groupMembersCache = useTypedSelector(getGroupMembersCache);
    const stateUnableToCallGroupMembersIds = useTypedSelector(getUnableToCallGroupMembersIds);
    const callConversation = useTypedSelector(getCallConversation);
    const dispatch = useTypedDispatch();
    // lang
    const { getLang } = useLang();
    /** участники беседы \ друзья \ сообщества */
    const [members, setMembers] = useState(initMembers);
    /** Часть данных может быть закешировано, вычисляем, какая "страница" пагинации загружена сейчас */
    const loadedPageMap = {
        [EMembersType.Friends]: Math.ceil(initMembers.length / COUNT_OF_FRIENDS_TO_LOAD),
        [EMembersType.Members]: Math.ceil(initMembers.length / COUNT_OF_CHAT_MEMBERS_TO_LOAD),
        [EMembersType.CommunityMembers]: Math.ceil(initMembers.length / COUNT_OF_GROUP_MEMBERS_TO_LOAD),
    };
    const initialLoadedPage = loadedPageMap[memberType] || 1;
    // local state
    const [query, setQuery] = useState('');
    const [showMore, setShowMore] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedPage, setLoadedPage] = useState(initialLoadedPage);
    const [searchCache, setSearchCache] = useState({});
    const bridge = useCallsBridge();
    const friendsCount = useTypedSelector(getFriendsCount) || 0;
    const chatMembersCount = useTypedSelector(getChatMembersCount) || 0;
    const callMembers = useTypedSelector(getMembers);
    const devices = useTypedSelector(getDevices);
    const peerIdToDevices = useTypedSelector(getPeerIdToDevices);
    const me = useTypedSelector(getMyId);
    const peerId = useTypedSelector(getPeerId);
    const groupId = useTypedSelector(getGroupId);
    const participants = useTypedSelector(getParticipants);
    const selectedMap = useMemo(() => new Set(selected), [selected]);
    /** флаг-костыль для подгрузки участников сообщества (тк они не скачиваются целиком)
     * после перехода на серверный поиск для всех табов будет удалено */
    const needServerSearch = groupMembersCount > COUNT_OF_GROUP_MEMBERS_TO_LOAD || memberType === EMembersType.Friends; /* ||
    memberType === EMembersType.Members */
    /** VkIndexer, позволяет быстро(tree search) искать по списку, поддерживает транслитерацию  */
    const searchIndex = useMemo(() => new VkIndexer(members, nameGetter), []);
    /** синхронный поиск по VkIndexer */
    const searchSync = useCallback((q) => {
        if (q) {
            const result = searchIndex.search(q);
            if (needFilterSearchSuggest.current) {
                let obj = {};
                result.forEach((value) => {
                    obj[value.id] = value;
                });
                return Object.values(obj);
            }
            return result;
        }
        const countAll = memberType === EMembersType.Friends
            ? friendsCount
            : memberType === EMembersType.Members
                ? chatMembersCount
                : 0;
        return getDefaultSuggests({
            getLang,
            members,
            showMore,
            memberType,
            countAll,
            enableChatMembersPagination,
        });
    }, [members, searchIndex, getLang, showMore, memberType]);
    const loadMore = useCallback(() => {
        if (members.length < friendsCount && memberType === EMembersType.Friends) {
            setIsLoading(true);
            if (!bridge.authorizedGroupId) {
                loadMoreFriends(friendsCache, loadedPage).then((friends) => {
                    if (friends) {
                        dispatch(addFriends({ count: friends.count, members: friends.data }));
                        setLoadedPage(loadedPage + 1);
                        const newFriends = [...members];
                        friends.data.forEach((friend) => {
                            newFriends.push(friend);
                            searchIndex.add(friend);
                        });
                        setMembers(newFriends);
                    }
                    setIsLoading(false);
                });
            }
        }
        else if (members.length < chatMembersCount && memberType === EMembersType.Members) {
            setIsLoading(true);
            loadMoreChatMembers(me, peerIdToVkId(peerId), chatMembersCache, loadedPage).then((chatMembers) => {
                if (chatMembers) {
                    setLoadedPage(loadedPage + 1);
                    dispatch(addChatInfo({
                        count: chatMembers.count,
                        conversation: callConversation,
                        members: chatMembers.data,
                    }));
                    const newMembers = [...members];
                    chatMembers.data.forEach((chatMember) => {
                        newMembers.push(chatMember);
                        searchIndex.add(chatMember);
                    });
                    setMembers(newMembers);
                }
                setIsLoading(false);
            });
        }
    }, [members.length, memberType, friendsCache, friendsCount, chatMembersCount, loadedPage]);
    // Found state (uses search with dependencies)
    const [found, setFound] = useState(() => searchSync(query));
    const selectMember = useCallback((mid) => {
        const next = [...selected, mid];
        onChange(next);
    }, [selected, onChange]);
    const deselectMember = useCallback((id) => {
        const next = selected.filter((mid) => mid !== id);
        onChange(next);
    }, [selected, onChange]);
    useEffect(() => {
        setFound(searchSync(query)); // Update search results
    }, [searchSync]);
    useEffect(() => {
        const q = query;
        if (needServerSearch && memberType === EMembersType.CommunityMembers) {
            if (q.length >= 3 && !isSearching) {
                searchTimeout.current = setTimeout(() => {
                    setIsSearching(true);
                    searchGroupMembers(-groupId, q, groupMembersCache)
                        .then(({ data, unableToCallGroupMembersIds }) => {
                        if (data.length) {
                            dispatch(addGroupMembers({ members: data, unableToCallGroupMembersIds }));
                        }
                        setIsSearching(false);
                        if (data.length) {
                            needFilterSearchSuggest.current = true;
                            const newMembers = [...members];
                            for (const member of data) {
                                newMembers.push(member);
                                searchIndex.add(member);
                            }
                            setMembers(newMembers);
                            setFound(searchSync(q));
                        }
                    })
                        .catch(handlePromiseError);
                }, 1000);
            }
            else {
                if (searchTimeout.current) {
                    setIsSearching(false);
                    clearTimeout(searchTimeout.current);
                }
            }
        }
        else if (needServerSearch &&
            memberType === EMembersType.Friends && // в этой секции поиск для таба Друзья, скорее всего потом переработается
            !searchCache[q] // проверяем, что еще не искали для такого запроса
        ) {
            if (q.length >= 3 && !isSearching) {
                searchTimeout.current = setTimeout(() => {
                    setIsSearching(true);
                    if (!bridge.authorizedGroupId) {
                        searchFriends(peerIdToVkId(me), q, friendsCache).then((friends) => {
                            if (friends) {
                                dispatch(addFriends({ members: friends.data }));
                                setIsSearching(false);
                                setSearchCache((cache) => ({ ...cache, [q]: true }));
                                if (friends.data.length) {
                                    needFilterSearchSuggest.current = true;
                                    const newMembers = [...members];
                                    friends.data.forEach((friend) => {
                                        newMembers.push(friend);
                                        searchIndex.add(friend);
                                    });
                                    setMembers(newMembers);
                                    setFound(() => searchSync(q));
                                }
                            }
                        });
                    }
                }, 1000);
            }
            else {
                setMembers(initMembers);
                if (searchTimeout.current) {
                    setIsSearching(false);
                    clearTimeout(searchTimeout.current);
                }
            }
        }
        else if (needServerSearch &&
            memberType === EMembersType.Members && // в этой секции поиск для таба уч. чата, скорее всего потом переработается
            !searchCache[q] && // проверяем, что еще не искали для такого запроса
            enableChatMembersPagination // toggle, будет удален
        ) {
            if (q.length >= 3 && !isSearching) {
                searchTimeout.current = setTimeout(() => {
                    setIsSearching(true);
                    searchChatMembers(peerIdToVkId(peerId), q, chatMembersCache).then((result) => {
                        if (result) {
                            dispatch(addChatInfo({ members: result.data }));
                            setIsSearching(false);
                            setSearchCache((cache) => ({ ...cache, [q]: true }));
                            if (result.data.length) {
                                needFilterSearchSuggest.current = true;
                                const newMembers = [...members];
                                result.data.forEach((member) => {
                                    newMembers.push(member);
                                    searchIndex.add(member);
                                });
                                setMembers(newMembers);
                                setFound(() => searchSync(q));
                            }
                        }
                    });
                }, 1000);
            }
            else {
                setMembers(initMembers);
                if (searchTimeout.current) {
                    setIsSearching(false);
                    clearTimeout(searchTimeout.current);
                }
            }
        }
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [
        query,
        initMembers.length,
        friendsCache,
        chatMembersCache,
        friendsCount,
        chatMembersCount,
        members.length,
    ]);
    // Search input onChange handler
    const onChangeHandler = useCallback((e) => {
        if (e.target.value !== query) {
            setQuery(e.target.value);
            setFound(searchSync(e.target.value));
        }
    }, [query, searchSync]);
    // Remove token by cross
    const onRemoveToken = useCallback((id) => {
        deselectMember(id);
        return Promise.resolve();
    }, [deselectMember]);
    // Toggle suggest
    const onSelect = useCallback((id) => {
        const isSelected = isSelectedItem(id, { devices, maps: { peerIdToDevices }, me, participants }, selectedMap);
        if (isSelected) {
            deselectMember(id);
        }
        else if (
        // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
        !selectedMap.has(id) &&
            !isParticipantDisabled({
                callMembers,
                devices,
                groupId,
                me,
                member: isParticipantContact(id)
                    ? members.find((m) => m.peerId === id)
                    : personCache.current.get(peerIdToVkId(id)),
                participants,
                selectedMap,
                peerIdToDevices,
            })) {
            selectMember(id);
            setQuery('');
            setFound(searchSync(''));
        }
        return Promise.resolve();
    }, [
        callMembers,
        devices,
        groupId,
        me,
        participants,
        peerIdToDevices,
        selectedMap,
        searchSync,
        selectMember,
        deselectMember,
    ]);
    // Click by list item
    const onItemClick = useCallback((row, onSelect) => {
        const isLoadMore = 'type' in row &&
            (row.type === SearchResultType.FRIENDS_MORE ||
                (row.type === SearchResultType.MEMBERS_MORE && enableChatMembersPagination));
        if (isLoadMore) {
            // setShowMore упразднится после общего перехода на серверный поиск
            return loadMore;
        }
        else if ('type' in row) {
            return () => setShowMore(true);
        }
        else {
            return onSelect;
        }
    }, [members.length]);
    const renderSuggest = useCallback((row, onSelect) => {
        const peerId = 'peerId' in row ? row.peerId : EMPTY_PEER_ID;
        const hideFriendsPaginator = 'type' in row && row.type === SearchResultType.FRIENDS_MORE && members.length === friendsCount;
        const hideChatMembersPaginator = 'type' in row &&
            row.type === SearchResultType.MEMBERS_MORE &&
            members.length === chatMembersCount &&
            enableChatMembersPagination;
        if (hideFriendsPaginator || hideChatMembersPaginator) {
            return;
        }
        return (_jsx(CallsSearchResult, { data: row, onClick: onItemClick(row, onSelect), selected: isSelectedItem(peerId, { devices, maps: { peerIdToDevices }, me, participants }, selectedMap), disabled: selectedMap.has(peerId) ||
                isParticipantDisabled({
                    callMembers,
                    devices,
                    groupId,
                    me,
                    member: isParticipantContact(peerId)
                        ? members.find((m) => m.peerId === peerId)
                        : personCache.current.get(peerIdToVkId(peerId)),
                    participants,
                    selectedMap,
                    peerIdToDevices,
                }), loading: isSearching || isLoading, moreButtonDisabled: isLoading }, peerId || ('text' in row && row.text) || undefined));
    }, [
        selectedMap,
        groupId,
        devices,
        participants,
        peerIdToDevices,
        me,
        stateUnableToCallGroupMembersIds,
        members,
        isLoading,
        isSearching,
    ]);
    return {
        query,
        found,
        onRemoveToken,
        onChangeHandler,
        onSelect,
        renderSuggest,
    };
};
//# sourceMappingURL=useTabContentController.js.map