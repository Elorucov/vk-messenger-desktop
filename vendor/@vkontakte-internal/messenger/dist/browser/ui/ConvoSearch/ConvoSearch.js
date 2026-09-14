import '../../ui/ConvoSearch/ConvoSearch.css';
import '../../ui/SearchMessagesTab/SearchMessageTab.css';
import React, { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { useBrowserEnv, useDebounced, useDidUpdate, usePeers, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { Icon24CancelOutline, Icon56SearchOutline } from '@vkontakte/icons';
import { useMessagesSearchData, useSearchHandlers, } from '../../hooks/useSearch';
import { useRouter } from '../../ui/Router/Router';
import { Calendar } from '../../ui/Calendar/Calendar';
import { useTabListNavigation } from '../../hooks/useKeyboardNavigation';
import { IconIllustrationCatClosedWall78h } from '@vkontakte-internal/icons-private';
import { NoResults } from '../../ui/NoResults/NoResults';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { SearchMessageResult } from '../../ui/SearchMessageResult/SearchMessageResult';
import { isSameDate, isSameYear } from '../../../core/utils/misc';
import { useStorageValue } from '../../hooks/useStorageValue';
import { SearchRequest, useSearchHistory, } from '../../ui/SearchMessagesTab/SearchMessageTab';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { useModal } from '../../hooks/useModal';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { SEARCH_DEBOUNCE_MS } from '../../../core/config/config';
import { OnboardingTooltip } from '../../ui/OnboardingTooltip/OnboardingTooltip';
import { RightPanelIconButton } from '../../ui/RightPanel/RightPanelIconButton';
import { Search } from '@vkontakte/vkui';
import { useConvoListItemHeight } from '../../hooks/useConvoListItemHeight';
import { useNow } from '../../hooks/useNow';
/**
 * Поиск по сообщениям сделали через роутинг, так как это позволяет
 * легко открывать поиск из других компонентов и приложений.
 * Например при клике по хэштегу в истории чата на большом экране
 * и в фаст чатах.
 */
export const ConvoSearch = ({ onMessageClick }) => {
    const panel = useModal(undefined, 'rightPanel');
    /**
     * Не анмаунтим поиск на разных роутах, чтобы устранить
     * утечку памяти, связанную с инпутом.
     */
    const { navigate, replace, screenRoute: route } = useRouter();
    const isSearching = route.kind === 'ConvoRoute' && route.search !== undefined;
    const routeSearchQuery = isSearching ? route.search : undefined;
    const { onChange, query, setQuery, onKeyDown, setNavigationParams, onBlur, onFocus, } = useSearchHandlers();
    const forcedSetQuery = useCallback((query) => {
        if (!isSearching) {
            return;
        }
        setQuery(query);
        replace({ ...route, search: query });
    }, [isSearching, setQuery, replace, route]);
    /**
     * Синхронизация route.search с состоянием панели поиска.
     */
    useEffect(function syncPanelStateWithRoute() {
        if (isSearching && !panel.isInStack) {
            panel.open();
        }
        if (!isSearching && panel.isActive) {
            panel.close();
        }
    }, [panel, isSearching]);
    const { debounced: debouncedQuery } = useDebounced(query, 
    // Если мы не в режиме поиска, то хотим дебаунсенное значение обновлять без задержки.
    isSearching ? SEARCH_DEBOUNCE_MS : 0);
    useDidUpdate(function debouncedNavigatingOnInputChange() {
        if (debouncedQuery !== query || !isSearching) {
            return;
        }
        const routeQuery = route.search ?? '';
        if (routeQuery !== debouncedQuery) {
            replace({ ...route, search: debouncedQuery });
        }
    }, [debouncedQuery]);
    useLayoutEffect(function syncInputWithRoute() {
        if (panel.isActive &&
            routeSearchQuery !== undefined &&
            routeSearchQuery !== query) {
            setQuery(routeSearchQuery);
        }
        if (!isSearching && query.length > 0) {
            setQuery('');
        }
    }, 
    // Не должен срабатывать при обновлении setQuery и query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [panel.isActive, isSearching, routeSearchQuery]);
    const onClose = useCallback(() => {
        if (isSearching) {
            navigate({ ...route, search: undefined, cmid: undefined });
        }
    }, [isSearching, navigate, route]);
    if (!isSearching) {
        return null;
    }
    return (React.createElement(RightPanel, { isActive: panel.isActive, indexInStack: panel.indexInStack, onEscape: onClose },
        React.createElement(ConvoSearchPanelContent, { query: query, onChange: onChange, onKeyDown: onKeyDown, setNavigationParams: setNavigationParams, forcedSetQuery: forcedSetQuery, queryToRequest: routeSearchQuery ?? '', peerId: route.peerId, onClose: onClose, onBlur: onBlur, onFocus: onFocus, onMessageClick: onMessageClick })));
};
const ConvoSearchPanelContent = React.memo(({ queryToRequest = '', onChange, query, forcedSetQuery, onKeyDown, setNavigationParams, peerId, onClose, onMessageClick, onBlur, onFocus, }) => {
    const { lang, storage } = useBrowserEnv();
    const peers = usePeers();
    const now = useNow();
    const [date, setDate] = useState();
    useEffect(() => () => {
        setDate(undefined);
    }, [peerId]);
    const $input = useRef(null);
    useEffect(() => {
        $input.current?.focus();
    }, [date]);
    const { results, isLoading, hasMore, loadMore } = useMessagesSearchData({
        peerId,
        date: date && mapDateIntoDDMMYYYY(date),
        query: queryToRequest,
    });
    const [requestsHistory, setRequestsHistory] = useStorageValue(storage, 'search-convo-messages-requests', []);
    const searchHistory = useSearchHistory(setRequestsHistory, queryToRequest);
    const listItemHeight = useConvoListItemHeight();
    const { setTabsCount, setSelectHandler, indexToSelect, onKeyDown: onTabsNavigationKeyDown, resetIndexToSelect, forceScrollToLoader, } = useTabListNavigation({ hasMore });
    const handleMessageClick = useCallback((message) => {
        const index = results === 'empty' ? -1 : results.indexOf(message);
        resetIndexToSelect(index);
        onMessageClick(message);
    }, [onMessageClick, resetIndexToSelect, results]);
    useEffect(() => {
        const onInputKeyDown = (keyCombo, event) => {
            switch (keyCombo) {
                case 'Escape':
                    event.stopPropagation();
                    event.preventDefault();
                    return onClose();
                default:
                    onTabsNavigationKeyDown(keyCombo, event);
            }
        };
        setNavigationParams({ onKeyDown: onInputKeyDown, resetIndexToSelect });
    }, [
        onTabsNavigationKeyDown,
        onClose,
        setNavigationParams,
        resetIndexToSelect,
    ]);
    const contentRef = useRef(null);
    const firstDateSeparatorRef = useRef(null);
    const isQueryEmpty = query.length === 0 && !date;
    const showLoader = (results !== 'empty' && results.length === 0 && isLoading) ||
        queryToRequest !== query;
    useEffect(() => {
        const getTabsCount = () => {
            if (isQueryEmpty) {
                return (requestsHistory ?? []).length;
            }
            if (results === 'empty' || showLoader) {
                return 0;
            }
            return results.length;
        };
        setTabsCount(getTabsCount());
    }, [setTabsCount, results, showLoader, requestsHistory, isQueryEmpty]);
    useEffect(() => {
        setSelectHandler((index) => {
            if (isQueryEmpty) {
                const request = (requestsHistory ?? [])[index];
                if (request !== undefined) {
                    forcedSetQuery(request);
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
            handleMessageClick(selected);
        });
    }, [
        results,
        showLoader,
        setSelectHandler,
        requestsHistory,
        forcedSetQuery,
        isQueryEmpty,
        handleMessageClick,
    ]);
    useLayoutEffect(() => {
        contentRef.current
            ?.querySelector('[aria-selected="true"]')
            ?.scrollIntoView({ block: 'nearest' });
    }, [indexToSelect]);
    useLayoutEffect(() => {
        if (forceScrollToLoader) {
            contentRef.current
                ?.querySelector('.SearchMessageTab__loader')
                ?.scrollIntoView({ block: 'nearest' });
        }
    }, [forceScrollToLoader]);
    const getContent = () => {
        if (isQueryEmpty) {
            if (requestsHistory === undefined || requestsHistory.length === 0) {
                return (React.createElement(NoResults, { icon: React.createElement(Icon56SearchOutline, null) }, lang.use('me_convo_list_search_message_empty_query')));
            }
            return (React.createElement(React.Fragment, null,
                React.createElement("h3", { className: "SearchMessageTab__sectionHeader" },
                    React.createElement("span", { className: "SearchMessageTab__sectionHeaderText" }, lang.use('me_recent_search_queries')),
                    React.createElement("button", { onClick: searchHistory.removeAll, onMouseDown: (event) => {
                            event.preventDefault(); // Необходимо чтобы поиск не терял фокус
                        }, "aria-label": lang.use('me_recent_search_queries_clear_label'), className: "SearchMessageTab__recentSelectedClear" }, lang.use('me_recent_search_queries_clear'))),
                React.createElement("div", { className: "SearchMessageTab__resultsContainer", role: "presentation" }, requestsHistory.map((request, index) => (React.createElement(SearchRequest, { request: request, onSelect: forcedSetQuery, isSelected: index === indexToSelect, onRemove: searchHistory.remove, key: request }))))));
        }
        if (showLoader) {
            return React.createElement(OptimizedSpinner, { className: "ConvoSearch__spinner" });
        }
        if (results === 'empty') {
            return (React.createElement(NoResults, { icon: React.createElement(IconIllustrationCatClosedWall78h, null) }, lang.use('me_convo_list_search_message_no_results_one_line')));
        }
        return (React.createElement("div", { className: "SearchMessageTab__resultsContainer", role: "presentation" },
            results.map((message, index) => {
                const author = Peer.safeGet(peers, message.authorId);
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
                    React.createElement(SearchMessageResult, { message: message, isSelected: index === indexToSelect, onClick: handleMessageClick, peer: author, searchQuery: query, className: "SearchMessageTab__SearchMessageResult" })));
            }),
            hasMore && (React.createElement("div", { style: { height: `${listItemHeight}px` } },
                React.createElement(OptimizedSpinner, { className: "SearchMessageTab__loader", onIntersection: loadMore })))));
    };
    const [isCalendarTooltipHidden, setCalendarTooltipHidden] = useStorageValue(storage, 'search-convo-calendar-tooltip-hidden', false);
    const hideCalendarTooltip = useCallback(() => {
        setCalendarTooltipHidden(() => true);
    }, [setCalendarTooltipHidden]);
    const calendarContainerRef = useRef(null);
    const contentProps = useMemo(() => ({
        className: 'ConvoSearch__scrollbar-content',
    }), []);
    return (React.createElement("div", { ref: contentRef, className: "ConvoSearch__container", style: {
            // Подразумевается, что у всех разделителей одинаковая высота.
            '--date_separator_height': `${firstDateSeparatorRef.current?.offsetHeight ?? 0}px`,
        }, 
        /**
         * Превентим ивент клика, чтобы инпут поиска не терял фокус
         * например при нажатии на саджесты из истории поиска.
         */
        onMouseDown: (event) => event.preventDefault() },
        React.createElement("h3", { className: "ConvoSearch__title" }, lang.use('me_chat_history_search_header')),
        React.createElement(RightPanelIconButton, { className: "ConvoSearch__closeButton", side: "right", onClick: onClose },
            React.createElement(Icon24CancelOutline, null)),
        React.createElement("div", { className: "ConvoSearch__search", role: "search" },
            React.createElement(Search, { className: "ConvoSearch__searchInput", placeholder: lang.use('me_peer_search'), autoComplete: "off", spellCheck: "false", value: query, onChange: onChange, onKeyDown: onKeyDown, onMouseDown: (e) => {
                    e.stopPropagation();
                }, onFocus: onFocus, onBlur: onBlur, getRef: $input }),
            React.createElement("div", { className: "ConvoSearch__searchDateContainer", ref: calendarContainerRef },
                React.createElement(Calendar, { locale: lang.locale, onChange: setDate, value: date, dropdownContentClassname: "ConvoSearch__searchDateDropdown", variant: "auto" }),
                React.createElement(OnboardingTooltip, { isOpen: Boolean(queryToRequest && !isCalendarTooltipHidden), onClose: hideCalendarTooltip, closeOnHoverTarget: calendarContainerRef, text: React.createElement("div", { className: "ConvoSearch__searchDateOnboardingText" }, lang.use('me_chat_history_search_calendar_tooltip')), targetClassName: "ConvoSearch__searchDateOnboardingTooltipTarget", align: "right", position: "bottom" }))),
        React.createElement("div", { className: "ConvoSearch__content" },
            React.createElement(ScrollbarProvider, { style: { height: '100%' }, contentProps: contentProps, overflowX: "hidden" }, getContent()))));
});
function mapDateIntoDDMMYYYY(date) {
    const [DD, MM, YYYY] = new Intl.DateTimeFormat('ru-RU', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    })
        .format(date)
        .split('.');
    return Number(`${DD}${MM}${YYYY}`);
}
//# sourceMappingURL=ConvoSearch.js.map