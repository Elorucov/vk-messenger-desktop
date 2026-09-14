import { useMessagesSearchData } from '../../hooks/useSearch';
import '../../ui/SearchMessagesTab/SearchMessageTab.css';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import React, { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, } from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { SearchMessageResult } from '../../ui/SearchMessageResult/SearchMessageResult';
import { NoResults } from '../../ui/NoResults/NoResults';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import cx from 'classnames';
import { useTabListNavigation } from '../../hooks/useKeyboardNavigation';
import { Icon20Cancel, Icon20Search, Icon56SearchOutline, } from '@vkontakte/icons';
import { isSameDate, isSameYear } from '../../../core/utils/misc';
import { useStorageValue } from '../../hooks/useStorageValue';
import { pushWithLimit } from '../../hooks/useSelectedConvosFromSearch';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { IconIllustrationCatClosedWall78h } from '@vkontakte-internal/icons-private';
import { useConvoListItemHeight } from '../../hooks/useConvoListItemHeight';
import { useNow } from '../../hooks/useNow';
export const MESSAGE_TAB_PANEL_ID = 'search_messages_tab_panel';
const SEARCH_REQUESTS_HISTORY_COUNT_LIMIT = 20;
export const SearchMessageTab = ({ query: queryProp, debouncedQuery: debouncedQueryProp, activeTabPanelProps, openConvo, convosCache, changeQueryForced, hideToLeft, }) => {
    const { lang, storage } = useBrowserEnv();
    const peers = usePeers();
    const now = useNow();
    const isActive = activeTabPanelProps !== undefined;
    const firstDateSeparatorRef = useRef(null);
    const query = useRef('');
    const debouncedQuery = useRef('');
    if (isActive) {
        // Не обновляем компонент и не делаем запросов на API, пока вкладка не активна.
        query.current = queryProp;
        debouncedQuery.current = debouncedQueryProp;
    }
    const isQueryEmpty = query.current.length === 0;
    const [requestsHistory, setRequestsHistory] = useStorageValue(storage, 'search-messages-requests', []);
    const searchHistory = useSearchHistory(setRequestsHistory, debouncedQuery.current);
    const { results, loadMore, isLoading, hasMore } = useMessagesSearchData({
        query: debouncedQuery.current,
    });
    const showLoader = (results !== 'empty' && results.length === 0 && isLoading) ||
        debouncedQuery.current !== query.current;
    const { setTabsCount, setSelectHandler, resetIndexToSelect, onKeyDown, // TODO ME-29290 Добавить модульную подписку
    indexToSelect, forceScrollToLoader, } = useTabListNavigation({ hasMore });
    const listItemHeight = useConvoListItemHeight();
    useEffect(() => {
        activeTabPanelProps?.setNavigationParams({
            resetIndexToSelect,
            onKeyDown,
        });
    }, [activeTabPanelProps, resetIndexToSelect, onKeyDown]);
    const onSelect = useCallback((message) => {
        const index = results === 'empty' ? -1 : results.indexOf(message);
        resetIndexToSelect(index);
        openConvo({
            peerId: message.peerId,
            entrypoint: 'message_search',
            cmid: message.cmid,
            messageHighlightQuery: query.current,
        });
    }, [openConvo, results, resetIndexToSelect]);
    useEffect(() => {
        setTabsCount(isQueryEmpty
            ? (requestsHistory ?? []).length
            : results === 'empty'
                ? 0
                : results.length);
    }, [setTabsCount, results, requestsHistory, isQueryEmpty]);
    useEffect(() => {
        setSelectHandler((index) => {
            if (isQueryEmpty) {
                const request = (requestsHistory ?? [])[index];
                if (request !== undefined) {
                    changeQueryForced(request);
                }
                return;
            }
            if (results === 'empty' || showLoader) {
                return;
            }
            const selected = results[index];
            if (selected === undefined) {
                return;
            }
            onSelect(selected);
        });
    }, [
        onSelect,
        results,
        setSelectHandler,
        requestsHistory,
        changeQueryForced,
        isQueryEmpty,
        showLoader,
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
        if (isQueryEmpty) {
            return requestsHistory !== undefined && requestsHistory.length > 0 ? (React.createElement(React.Fragment, null,
                React.createElement("h3", { className: "SearchMessageTab__sectionHeader" },
                    React.createElement("span", { className: "SearchMessageTab__sectionHeaderText" }, lang.use('me_recent_search_queries')),
                    React.createElement("button", { onClick: searchHistory.removeAll, "aria-label": lang.use('me_recent_search_queries_clear_label'), className: "SearchMessageTab__recentSelectedClear", onMouseDown: (event) => {
                            event.preventDefault(); // Необходимо чтобы поиск не терял фокус
                        } }, lang.use('me_recent_search_queries_clear'))),
                React.createElement("div", { className: "SearchMessageTab__resultsContainer", role: "presentation" }, requestsHistory.map((request, index) => (React.createElement(SearchRequest, { request: request, onSelect: changeQueryForced, isSelected: index === indexToSelect, onRemove: searchHistory.remove, key: request })))))) : (React.createElement(NoResults, { icon: React.createElement(Icon56SearchOutline, null) }, lang.use('me_convo_list_search_message_empty_query')));
        }
        if (showLoader) {
            return React.createElement(OptimizedSpinner, { className: "SearchMessageTab__contentSpinner" });
        }
        if (results === 'empty') {
            return (React.createElement(NoResults, { icon: React.createElement(IconIllustrationCatClosedWall78h, null) }, lang.use('me_convo_list_search_messages_no_results_description')));
        }
        return (React.createElement("div", { className: "SearchMessageTab__resultsContainer", role: "presentation" },
            results.map((message, index) => {
                const peer = Peer.safeGet(peers, message.peerId);
                const convo = Convo.safeGet(convosCache, peer.id);
                const isFirst = index === 0;
                const prev = results[index - 1];
                const addSplitDate = isFirst || (prev && !isSameDate(prev.sentAt, message.sentAt));
                return (React.createElement(Fragment, { key: `${message.peerId}_${message.cmid}` },
                    addSplitDate && (React.createElement("div", { className: "SearchMessageTab__separatorDate", ref: isFirst ? firstDateSeparatorRef : undefined }, isSameYear(now, message.sentAt)
                        ? lang.use('me_convo_list_search_messages_date', {
                            now,
                            date: message.sentAt,
                        })
                        : lang.use('global_date', {
                            now,
                            date: message.sentAt,
                        }))),
                    React.createElement(SearchMessageResult, { message: message, isSelected: index === indexToSelect, onClick: onSelect, peer: peer, convo: convo, searchQuery: query.current, className: "SearchMessageTab__SearchMessageResult" })));
            }),
            hasMore && (React.createElement("div", { style: { height: `${listItemHeight}px` } },
                React.createElement(OptimizedSpinner, { className: "SearchMessageTab__loader", onIntersection: loadMore })))));
    };
    const contentProps = useMemo(() => ({
        className: 'SearchMessageTab__scrollbar-content',
    }), []);
    return (React.createElement("div", { className: cx('SearchMessageTab', {
            'SearchMessageTab--hiddenRight': !isActive && !hideToLeft,
            'SearchMessageTab--hiddenLeft': !isActive && hideToLeft,
        }), ref: isActive ? activeTabPanelProps.tabPanelRef : undefined, style: {
            '--date_separator_height': `${firstDateSeparatorRef.current?.offsetHeight ?? 0 // Подразумевается, что у всех разделителей одинаковая высота.
            }px`,
        }, role: "menu", id: MESSAGE_TAB_PANEL_ID, "aria-hidden": !isActive },
        React.createElement(ScrollbarProvider, { overflowX: "hidden", role: "presentation", scrollableProps: {
                role: 'presentation',
            }, contentProps: {
                ...contentProps,
                role: 'presentation',
            } }, getContent())));
};
export const SearchRequest = ({ request, onSelect, onRemove, isSelected }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('SearchMessageTab__SearchRequest', {
            'SearchMessageTab__SearchRequest--selected': isSelected,
        }), onClick: () => onSelect(request), role: "menuitem" },
        React.createElement(Icon20Search, null),
        React.createElement("span", { className: "SearchMessageTab__SearchRequestText" }, request),
        React.createElement(Tooltip, { content: lang.use('me_search_request_remove'), position: "top", delay: 500 },
            React.createElement("button", { className: "SearchMessageTab__SearchRequestDelete", onClick: (event) => {
                    onRemove(request);
                    event.stopPropagation();
                } },
                React.createElement(Icon20Cancel, null)))));
};
export const useSearchHistory = (setHistory, valueToAdd, addTimeout = 2000) => {
    const remove = useCallback((requestToRemove) => {
        setHistory((requests) => (requests ?? []).filter((request) => request !== requestToRemove));
    }, [setHistory]);
    const removeAll = useCallback(() => {
        setHistory(() => []);
    }, [setHistory]);
    const setHistoryRef = useRef(setHistory);
    setHistoryRef.current = setHistory;
    useEffect(function addQueryToSearchRequestsHistory() {
        if (valueToAdd.length > 0) {
            // Считаем, что если пользователь 2 секунды не изменял запрос, то он
            // просматривает результаты и такой запрос можно добавить в историю.
            const timeoutId = setTimeout(() => {
                setHistoryRef.current((requests) => pushWithLimit(valueToAdd, requests, SEARCH_REQUESTS_HISTORY_COUNT_LIMIT));
            }, addTimeout);
            return () => clearTimeout(timeoutId);
        }
        return;
    }, 
    // Не добавляем в зависимости addTimeout, чтобы при его изменении
    // не добавлять запрос в историю.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valueToAdd]);
    return {
        remove,
        removeAll,
    };
};
//# sourceMappingURL=SearchMessageTab.js.map