import { useConvoSearchData, useUsersGlobalSearchData, } from '../../hooks/useSearch';
import '../../ui/SearchConvoTab/SearchConvoTab.css';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, } from 'react';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import { NoResults } from '../../ui/NoResults/NoResults';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { SearchResult, } from '../../ui/SearchResult/SearchResult';
import { useBrowserEnv, useCommunityMessagingWithToggle, useOwner, usePeers, } from '../../hooks/misc';
import cx from 'classnames';
import { useTabListNavigation } from '../../hooks/useKeyboardNavigation';
import { CONVO_TAB_ID, } from '../../ui/SearchTabs/SearchTabs';
import { HorizontalScroll, HorizontalCell } from '@vkontakte/vkui';
import { useSelectedConvosFromSearch } from '../../hooks/useSelectedConvosFromSearch';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { SkeletonLoader } from '../../ui/SkeletonLoader/SkeletonLoader';
import { IconIllustrationCatClosedWall78h } from '@vkontakte-internal/icons-private';
import { IMPORTANT_USERS_COUNT } from '../../../data/store/reducer';
import { useConvoListItemHeight } from '../../hooks/useConvoListItemHeight';
import { useControlledKeyboardFocusNavigation } from '../../hooks/useControlledKeyboardFocusNavigation';
import { nanoid } from 'nanoid';
import { useSearchConvoTabStats } from '../../ui/SearchConvoTab/useSearchConvoTabStats';
import { Icon56SearchOutline } from '@vkontakte/icons';
export const CONVO_TAB_PANEL_ID = 'search_convos_tab_panel';
export const SearchConvoTab = ({ activeTabPanelProps, convosCache, convosSearchIndex, defaultResults: defaultResultsProp, query: queryProp, debouncedQuery: debouncedQueryProp, openConvo, importantUsers, selectedConvoId, handleContextMenuAction, handleRejectMRAction, toggleSearchPanel, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const isActive = activeTabPanelProps !== undefined;
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const query = useRef('');
    const $searchQueryUuid = useRef(nanoid());
    const debouncedQuery = useRef('');
    if (isActive) {
        if (query.current !== queryProp) {
            $searchQueryUuid.current = nanoid();
        }
        // Не обновляем компонент и не делаем запросов на API, пока вкладка не активна.
        query.current = queryProp;
        debouncedQuery.current = debouncedQueryProp;
    }
    const isQueryEmpty = query.current.length === 0;
    const owner = useOwner();
    const globalSearch = useUsersGlobalSearchData({
        query: owner.kind === 'User' ? debouncedQuery.current : '',
        enabled: true,
    });
    const { setTabsCount, setSelectHandler, resetIndexToSelect, onKeyDown, // TODO Добавить модульную подписку
    indexToSelect, forceScrollToLoader, } = useTabListNavigation({ hasMore: globalSearch.hasMore });
    useEffect(() => {
        activeTabPanelProps?.setNavigationParams({ resetIndexToSelect, onKeyDown });
    }, [activeTabPanelProps, resetIndexToSelect, onKeyDown]);
    const { results: friends, isLoading: isLoadingFriends } = useConvoSearchData({
        query: query.current,
        searchIndex: convosSearchIndex,
        defaultResults: useMemo(() => new Set(defaultResultsProp.map((convo) => convo.peerId)), [defaultResultsProp]),
    });
    const selectedConvos = useSelectedConvosFromSearch();
    const listItemHeight = useConvoListItemHeight();
    const friendsContainerRef = useRef(null);
    const globalContainerRef = useRef(null);
    const friendsContainerHandler = useControlledKeyboardFocusNavigation([friendsContainerRef], { onlyTabbable: false });
    const globalContainerHandler = useControlledKeyboardFocusNavigation([globalContainerRef], { onlyTabbable: false });
    const globalResults = useMemo(() => globalSearch.results.filter((peerId) => !friends.has(peerId)), [globalSearch.results, friends]);
    const isInitialLoadingGlobal = globalResults.length === 0 && globalSearch.isLoading;
    const isLoading = friends.size === 0 && (isLoadingFriends || isInitialLoadingGlobal);
    const isEmpty = friends.size === 0 &&
        !isLoadingFriends &&
        globalResults.length === 0 &&
        !globalSearch.isLoading;
    // Здесь повторяется логика отображения UI, но для удобства
    // навигации все элементы объединены в один массив.
    const allResults = useMemo(() => {
        if (isLoading) {
            return [];
        }
        if (isQueryEmpty && selectedConvos.convos !== 'loading') {
            return (selectedConvos.convos ?? []).map((peerId) => ({
                peerId,
                entrypoint: 'recent_searches',
            }));
        }
        return [
            ...Array.from(friends).map((peerId) => ({
                peerId,
                entrypoint: 'conversations_search',
            })),
            ...(!isLoadingFriends
                ? globalResults.map((peerId) => ({
                    peerId,
                    entrypoint: 'global_search',
                }))
                : []),
        ];
    }, [
        isLoading,
        globalResults,
        friends,
        isLoadingFriends,
        isQueryEmpty,
        selectedConvos.convos,
    ]);
    const { logSelect } = useSearchConvoTabStats({
        query: queryProp,
        isActive,
        debouncedQuery: debouncedQueryProp,
        friends,
        globalResults,
        selectedConvos,
        isLoadingFriends,
        searchQueryUuid: $searchQueryUuid.current,
        importantUsers,
    });
    const onSelect = useCallback((entrypoint, peerId) => {
        openConvo({ peerId, entrypoint });
        selectedConvos.push(peerId);
        toggleSearchPanel(false);
        logSelect(entrypoint, peerId);
    }, [logSelect, openConvo, selectedConvos, toggleSearchPanel]);
    useEffect(() => {
        setTabsCount(allResults.length);
    }, [setTabsCount, allResults]);
    useEffect(() => {
        setSelectHandler((index) => {
            if (isLoading || isEmpty) {
                return;
            }
            const peerToSelect = allResults[index];
            if (peerToSelect === undefined) {
                return;
            }
            resetIndexToSelect(index);
            onSelect(peerToSelect.entrypoint, peerToSelect.peerId);
        });
    }, [
        onSelect,
        isLoading,
        setSelectHandler,
        isEmpty,
        allResults,
        resetIndexToSelect,
    ]);
    useLayoutEffect(() => {
        activeTabPanelProps?.tabPanelRef.current
            ?.querySelector('[aria-selected="true"]')
            ?.scrollIntoView({ block: 'nearest' });
        // Не включаем activeTabPanelProps в зависимости, поскольку не хотим вызывать скролл
        // к выбранному элементу, когда вкладка становится активной.
        // Если пользователь скроллил список и потом ушел в другой tab,
        // то вернувшись сюда он проскроллится к выбранному элементу,
        // который скорее всего в самом начале списка.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indexToSelect]);
    useLayoutEffect(() => {
        if (forceScrollToLoader) {
            activeTabPanelProps?.tabPanelRef.current
                ?.querySelector('.SearchMessageTab__loader')
                ?.scrollIntoView({ block: 'nearest' });
        }
        // Не включаем activeTabPanelProps в зависимости, поскольку не хотим вызывать скролл
        // к выбранному элементу, когда вкладка становится активной.
        // Если пользователь скроллил список и потом ушел в другой tab,
        // то вернувшись сюда он проскроллится к выбранному элементу,
        // который скорее всего в самом начале списка.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceScrollToLoader]);
    const getContent = () => {
        if (isLoading) {
            return React.createElement(OptimizedSpinner, { className: "SearchConvoTab__contentSpinner" });
        }
        if (isEmpty) {
            return (React.createElement(NoResults, { icon: React.createElement(IconIllustrationCatClosedWall78h, null) }, lang.use('me_convo_list_search_chat_no_results_description')));
        }
        if (isQueryEmpty) {
            return (React.createElement(React.Fragment, null,
                owner.kind !== 'Group' && (React.createElement(React.Fragment, null,
                    React.createElement("h3", { className: "SearchConvoTab__sectionHeader" },
                        React.createElement("span", { className: "SearchConvoTab__sectionHeaderText" }, lang.use('me_search_important'))),
                    importantUsers === null ? (React.createElement("div", { className: "SearchConvoTab__importantUserSkeletonContainer" }, new Array(IMPORTANT_USERS_COUNT + 1).fill(0).map(() => (React.createElement(ImportantUserSkeleton, null))))) : (React.createElement(HorizontalScroll, { showArrows: true, arrowSize: "m", getScrollToLeft: (i) => i - 200, getScrollToRight: (i) => i + 200, className: "SearchConvoTab__horizontalScroll" },
                        React.createElement("div", { className: "SearchConvoTab__importantUsersContainer" },
                            React.createElement(HorizontalCell, { title: React.createElement("span", { className: "SearchConvoTab__importantUserName" }, lang.use('me_favorites')), onClick: () => {
                                    onSelect('popular_suggestions', owner.id);
                                }, className: "SearchConvoTab__importantUser" },
                                React.createElement(AvatarFavorites, { size: 56 })),
                            [...importantUsers.values()]
                                // На всякий случай фильтруем избранное, так как отобразили его первым
                                .filter((peerId) => !Peer.isFavorites(peerId, owner.id))
                                .map((peerId) => {
                                const peer = Peer.safeGet(peers, peerId);
                                return (React.createElement(HorizontalCell, { key: peer.id, title: React.createElement("span", { className: "SearchConvoTab__importantUserName" }, Peer.firstName(peer)), onClick: () => {
                                        onSelect('popular_suggestions', peer.id);
                                    }, className: "SearchConvoTab__importantUser" },
                                    React.createElement(PeerAvatar, { size: 56, peer: peer })));
                            })))))),
                selectedConvos.convos === 'loading' ? (React.createElement("div", { style: { height: `${listItemHeight}px` } },
                    React.createElement(OptimizedSpinner, { className: "SearchConvoTab__loader" }))) : !!selectedConvos.convos?.length ? (React.createElement(React.Fragment, null,
                    !isCommunityMessaging && (React.createElement("div", { className: "SearchConvoTab__sectionSeparator" })),
                    React.createElement("h3", { className: "SearchConvoTab__sectionHeader" },
                        React.createElement("span", { className: "SearchConvoTab__sectionHeaderText" }, lang.use('me_recent_search_queries')),
                        React.createElement("button", { onClick: selectedConvos.removeAll, onMouseDown: (event) => {
                                event.preventDefault(); // Необходимо чтобы поиск не терял фокус
                            }, "aria-label": lang.use('me_recent_search_queries_clear_label'), className: "SearchConvoTab__recentSelectedClear" }, lang.use('me_recent_search_queries_clear'))),
                    React.createElement("div", { className: "SearchConvoTab__resultsContainer", role: "menu" }, selectedConvos.convos.map((peerId, index) => {
                        /**
                         * Может быть недостаток данных в кеше.
                         * Например для кейса из https://jira.mvk.com/browse/ME-36486.
                         */
                        const peer = peers.get(peerId);
                        const convoData = convosCache.get(peerId);
                        if (!peer || !convoData || Convo.isDeleted(convoData)) {
                            return null;
                        }
                        return (React.createElement(SearchResult, { key: peer.id, convo: convoData, peer: peer, isFocused: index === indexToSelect, onClick: onSelect.bind(null, 'recent_searches'), onRemove: selectedConvos.remove, showScreenName: false }));
                    })))) : (React.createElement(NoResults, { icon: React.createElement(Icon56SearchOutline, null) }, lang.use('me_convo_list_search_convo_empty_query')))));
        }
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "SearchConvoTab__resultsContainer", role: "menu", ref: friendsContainerRef, onKeyDown: friendsContainerHandler }, [...friends.values()].map((peerId, index) => {
                const peer = Peer.safeGet(peers, peerId);
                const convoData = Convo.safeGet(convosCache, peer.id);
                const needShowScreenName = ((peer.kind === 'User' || peer.kind === 'Group') &&
                    peer.screenName?.includes(query.current)) ||
                    query.current[0] === '@';
                if (Convo.isDeleted(convoData)) {
                    return null;
                }
                return (React.createElement(SearchResult, { key: peer.id, convo: convoData, peer: peer, isFocused: index === indexToSelect, onClick: onSelect.bind(null, 'conversations_search'), showScreenName: needShowScreenName, withContext: true, selectedConvoId: selectedConvoId, handleContextMenuAction: handleContextMenuAction, handleRejectMRAction: handleRejectMRAction }));
            })),
            isLoadingFriends || isInitialLoadingGlobal ? (React.createElement("div", { style: { height: `${listItemHeight}px` } },
                React.createElement(OptimizedSpinner, { className: "SearchConvoTab__loader" }))) : (owner.kind !== 'Group' &&
                globalResults.length > 0 && (React.createElement(React.Fragment, null,
                friends.size > 0 && (React.createElement("div", { className: "SearchConvoTab__sectionSeparator" })),
                React.createElement("h3", { className: "SearchConvoTab__sectionHeader" },
                    React.createElement("span", { className: "SearchConvoTab__sectionHeaderText" }, lang.use('me_global_search'))),
                React.createElement("div", { className: "SearchConvoTab__resultsContainer", role: "menu", ref: globalContainerRef, onKeyDown: globalContainerHandler }, globalResults.map((peerId, index) => {
                    const peer = Peer.safeGet(peers, peerId);
                    return (React.createElement(SearchResult, { key: peer.id, peer: peer, isFocused: index === indexToSelect - friends.size, onClick: onSelect.bind(null, 'global_search'), showScreenName: true }));
                })),
                globalSearch.hasMore && (React.createElement("div", { style: { height: `${listItemHeight}px` } },
                    React.createElement(OptimizedSpinner, { className: "SearchConvoTab__loader", onIntersection: globalSearch.loadMore }))))))));
    };
    const contentProps = useMemo(() => ({
        className: 'SearchConvoTab__scrollbar-content',
    }), []);
    return (React.createElement("div", { className: cx('SearchConvoTab', { 'SearchConvoTab--hidden': !isActive }), ref: isActive ? activeTabPanelProps.tabPanelRef : undefined, role: "tabpanel", id: CONVO_TAB_PANEL_ID, "aria-hidden": !isActive, "area-labelledby": CONVO_TAB_ID },
        React.createElement(ScrollbarProvider, { overflowX: "hidden", contentProps: contentProps }, getContent())));
};
const SKELETON_COLORS = {
    animationStartColor: 'var(--vkui--color_field_background)',
    animationEndColor: 'var(--vkui--color_background_secondary)',
};
const ImportantUserSkeleton = () => {
    return (React.createElement("div", { className: "SearchConvoTab_importantUserSkeleton" },
        React.createElement("div", { className: "SearchConvoTab_importantUserSkeleton--avatar" },
            React.createElement(SkeletonLoader, { width: '100%', height: '100%', ...SKELETON_COLORS })),
        React.createElement("div", { className: "SearchConvoTab_importantUserSkeleton--name" },
            React.createElement(SkeletonLoader, { width: '100%', height: '100%', ...SKELETON_COLORS }))));
};
//# sourceMappingURL=SearchConvoTab.js.map