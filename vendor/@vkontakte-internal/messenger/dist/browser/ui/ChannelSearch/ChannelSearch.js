import '../../ui/ChannelSearch/ChannelSearch.css';
import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, } from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Channel from '../../../core/model/Channel';
import * as TextChunk from '../../../core/model/TextChunk';
import { useModal } from '../../hooks/useModal';
import { useRouter } from '../../ui/Router/Router';
import { usePostsSearchData, useSearchHandlers, } from '../../hooks/useSearch';
import { SEARCH_DEBOUNCE_MS } from '../../../core/config/config';
import { useBrowserEnv, useChannels, useDebounced, useDidUpdate, usePeer, } from '../../hooks/misc';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { useStorageValue } from '../../hooks/useStorageValue';
import { SearchRequest, useSearchHistory, } from '../../ui/SearchMessagesTab/SearchMessageTab';
import { useTabListNavigation } from '../../hooks/useKeyboardNavigation';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { NoResults } from '../../ui/NoResults/NoResults';
import { Icon24CancelOutline, Icon56SearchOutline } from '@vkontakte/icons';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { Icon56PensiveFace } from '@vkontakte-internal/icons-private';
import { isSameDate, isSameYear } from '../../../core/utils/misc';
import { Search } from '@vkontakte/vkui';
import { RightPanelIconButton } from '../../ui/RightPanel/RightPanelIconButton';
import { getAttachmentPreview } from '../../ui/ChannelPostPreview/ChannelPostPreview';
import cx from 'classnames';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { applyCombinedFuzzyAndExactSearch, applyPreviewMode, getMatchesCount, } from '../../ui/Highlighter/search';
import { Highlighter, HighlighterRenderer, } from '../../ui/Highlighter/Highlighter';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { FormattedDate } from '../../ui/Time/Time';
import { useNow } from '../../hooks/useNow';
const DEFAULT_LIST_ITEM_HEIGHT = 66;
export const ChannelSearch = ({ onPostClick, }) => {
    const panel = useModal(undefined, 'rightPanel');
    const { navigate, replace, screenRoute: route } = useRouter();
    const isSearching = route.kind === 'ChannelRoute' && route.search !== undefined;
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
    useEffect(() => {
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
        if (isSearching &&
            panel.isActive &&
            route.search !== undefined &&
            route.search !== query) {
            setQuery(route.search);
        }
        if (!isSearching && query.length > 0) {
            setQuery('');
        }
    }, 
    // Не должен срабатывать при обновлении setQuery и query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [panel.isActive, isSearching, route]);
    const onClose = useCallback(() => {
        if (isSearching) {
            navigate({ ...route, search: undefined, postCmid: undefined });
        }
    }, [isSearching, navigate, route]);
    return (React.createElement(RightPanel, { isActive: panel.isActive, indexInStack: panel.indexInStack, onEscape: onClose },
        React.createElement(ChannelSearchContent, { ...(isSearching
                ? {
                    queryToRequest: route.search ?? '',
                    channelId: route.channelId,
                }
                : { queryToRequest: undefined, channelId: undefined }), onClose: onClose, setNavigationParams: setNavigationParams, query: query, onPostClick: onPostClick, forcedSetQuery: forcedSetQuery, onBlur: onBlur, onChange: onChange, onFocus: onFocus, onKeyDown: onKeyDown })));
};
const ChannelSearchContent = ({ channelId, queryToRequest = '', onClose, setNavigationParams, query, forcedSetQuery, onPostClick, onBlur, onChange, onFocus, onKeyDown, }) => {
    const { lang, storage } = useBrowserEnv();
    const now = useNow();
    const { results, isLoading, hasMore, loadMore } = usePostsSearchData({
        channelId,
        query: queryToRequest,
    });
    const channels = useChannels();
    const [requestsHistory, setRequestsHistory] = useStorageValue(storage, 'search-channel-posts-requests', []);
    const searchHistory = useSearchHistory(setRequestsHistory, queryToRequest);
    const { setTabsCount, setSelectHandler, indexToSelect, onKeyDown: onTabsNavigationKeyDown, resetIndexToSelect, forceScrollToLoader, } = useTabListNavigation({ hasMore });
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
    const isQueryEmpty = query.length === 0;
    const showLoader = (results !== 'empty' && results.length === 0 && isLoading) ||
        queryToRequest !== query;
    useEffect(() => {
        setTabsCount(isQueryEmpty
            ? (requestsHistory ?? []).length
            : results === 'empty'
                ? 0
                : results.length);
    }, [setTabsCount, results, requestsHistory, isQueryEmpty]);
    const handlePostClick = useCallback((post) => {
        const index = results === 'empty' ? -1 : results.indexOf(post);
        resetIndexToSelect(index);
        onPostClick(post);
    }, [onPostClick, resetIndexToSelect, results]);
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
            handlePostClick(selected);
        });
    }, [
        results,
        showLoader,
        setSelectHandler,
        requestsHistory,
        forcedSetQuery,
        isQueryEmpty,
        handlePostClick,
    ]);
    useLayoutEffect(() => {
        contentRef.current
            ?.querySelector('[aria-selected="true"]')
            ?.scrollIntoView({ block: 'nearest' });
    }, [indexToSelect]);
    useLayoutEffect(() => {
        if (forceScrollToLoader) {
            contentRef.current
                ?.querySelector('.ChannelSearch__loader')
                ?.scrollIntoView({ block: 'nearest' });
        }
    }, [forceScrollToLoader]);
    const getContent = () => {
        if (isQueryEmpty) {
            if (requestsHistory === undefined || requestsHistory.length === 0) {
                return (React.createElement(NoResults, { icon: React.createElement(Icon56SearchOutline, null) }, lang.use('me_channel_search_post_empty_query')));
            }
            return (React.createElement(React.Fragment, null,
                React.createElement("h3", { className: "ChannelSearch__sectionHeader" },
                    React.createElement("span", { className: "ChannelSearch__sectionHeaderText" }, lang.use('me_recent_search_queries')),
                    React.createElement("button", { onClick: searchHistory.removeAll, "aria-label": lang.use('me_recent_search_queries_clear_label'), className: "ChannelSearch__recentSelectedClear" }, lang.use('me_recent_search_queries_clear'))),
                React.createElement("div", { className: "ChannelSearch__resultsContainer" }, requestsHistory.map((request, index) => (React.createElement(SearchRequest, { request: request, onSelect: forcedSetQuery, isSelected: index === indexToSelect, onRemove: searchHistory.remove, key: request }))))));
        }
        if (showLoader) {
            return React.createElement(OptimizedSpinner, { className: "ChannelSearch__contentSpinner" });
        }
        if (results === 'empty') {
            return (React.createElement(NoResults, { icon: React.createElement(Icon56PensiveFace, null) }, lang.use('me_channel_search_post_no_results')));
        }
        return (React.createElement("div", { className: "ChannelSearch__resultsContainer" },
            results.map((post, index) => {
                const isFirst = index === 0;
                const prev = results[index - 1];
                const addSplitDate = isFirst || (prev && !isSameDate(prev.sentAt, post.sentAt));
                const channel = Channel.safeGet(channels, post.channelId);
                if (channel.kind === 'ChannelRestricted') {
                    throw Error('Поиск по забанненому каналу');
                }
                return (React.createElement(Fragment, { key: post.cmid },
                    addSplitDate && (React.createElement("div", { className: "ChannelSearch__separatorDate", ref: isFirst ? firstDateSeparatorRef : undefined }, isSameYear(now, post.sentAt)
                        ? lang.use('me_convo_list_search_messages_date', {
                            now,
                            date: post.sentAt,
                        })
                        : lang.use('global_date', {
                            now,
                            date: post.sentAt,
                        }))),
                    React.createElement(SearchPostResult, { post: post, isSelected: index === indexToSelect, searchQuery: query, channelName: channel.name, channelPhoto: channel.photo, onClick: handlePostClick, className: "ChannelSearch__SearchPostResult" })));
            }),
            hasMore && (React.createElement("div", { style: { height: `${DEFAULT_LIST_ITEM_HEIGHT}px` } },
                React.createElement(OptimizedSpinner, { className: "ChannelSearch__loader", onIntersection: loadMore })))));
    };
    return (React.createElement("div", { ref: contentRef, className: "ChannelSearch__container", style: {
            // Подразумевается, что у всех разделителей одинаковая высота.
            '--date_separator_height': `${firstDateSeparatorRef.current?.offsetHeight ?? 0}px`,
        }, 
        /**
         * Превентим ивент клика, чтобы инпут поиска не терял фокус
         * например при нажатии на саджесты из истории поиска.
         */
        onMouseDown: (event) => event.preventDefault() },
        React.createElement("h3", { className: "ChannelSearch__title" }, lang.use('me_channel_search')),
        React.createElement(RightPanelIconButton, { className: "ChannelSearch__closeButton", side: "right", onClick: onClose, "aria-label": lang.use('me_close') },
            React.createElement(Icon24CancelOutline, null)),
        React.createElement("div", { className: "ChannelSearch__search", role: "search" },
            React.createElement(Search, { className: "ChannelSearch__searchInput", placeholder: lang.use('me_channel_history_search'), autoComplete: "off", spellCheck: "false", value: query, onChange: onChange, onKeyDown: onKeyDown, onMouseDown: (e) => {
                    e.stopPropagation();
                }, onFocus: onFocus, onBlur: onBlur, autoFocus: true })),
        React.createElement("div", { className: "ChannelSearch__content" },
            React.createElement(ScrollbarProvider, { style: { height: '100%' }, contentProps: {
                    className: 'ChannelSearch__scrollbarContent',
                }, overflowX: "hidden" }, getContent()))));
};
const SearchPostResult = ({ post, searchQuery, isSelected, className, onClick, channelName, channelPhoto, }) => {
    const onKeyDownHandler = (keyCombo, event) => {
        if (keyCombo === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            onClick(post);
        }
    };
    return (React.createElement("article", { className: cx('SearchPostResult', className, {
            'SearchPostResult--selected': isSelected,
        }), role: "button", tabIndex: isSelected ? 0 : -1, onClick: () => onClick(post), onKeyDown: onElementKeyDownFactory(onKeyDownHandler) },
        React.createElement("div", { className: "SearchPostResult__avatar" },
            React.createElement(ChannelAvatar, { size: 36, name: channelName, photo: channelPhoto })),
        React.createElement("header", { className: "SearchPostResult__header" },
            React.createElement("div", { className: "SearchPostResult__titleWithIcon" },
                React.createElement("div", { className: "SearchPostResult__title" },
                    React.createElement(Highlighter, { search: searchQuery, text: channelName, strategy: "fuzzy" }))),
            React.createElement(FormattedDate, { timestamp: post.sentAt, variant: "time", className: "SearchPostResult__date" })),
        React.createElement("div", { className: "SearchPostResult__message" },
            React.createElement(ChannelMessagePreview, { post: post, searchQuery: searchQuery }))));
};
const ChannelMessagePreview = ({ post, searchQuery }) => {
    const { lang } = useBrowserEnv();
    let searchResult = null;
    const postsChunksToSearch = [
        {
            type: 'normal',
            chunks: post.chunks,
        },
    ];
    if (post.attaches.wall?.chunks) {
        postsChunksToSearch.push({
            type: 'forwarded',
            chunks: post.attaches.wall.chunks,
        });
    }
    let defaultPreviewText = '';
    for (const postToSearch of postsChunksToSearch) {
        const text = TextChunk.toPlainText(postToSearch.chunks, {
            multiline: false,
        });
        defaultPreviewText = text;
        const result = applyCombinedFuzzyAndExactSearch(text, searchQuery);
        const matchesCount = getMatchesCount(result);
        if (matchesCount > 0) {
            const previewOffsets = matchesCount > 1
                ? // Константы ниже выведены эмпирическим путем
                    {
                        left: 20,
                        right: 20,
                    }
                : { left: 40, right: Infinity };
            searchResult = {
                result: applyPreviewMode(result, previewOffsets.left, previewOffsets.right),
                type: postToSearch.type,
            };
            break;
        }
    }
    const firstPhotoUrl = post.attaches.photos?.[0].sizes.get('s')?.url;
    const attachmentPreview = getAttachmentPreview(post, lang);
    const attachOrDefaultText = defaultPreviewText ? (React.createElement("span", { className: "SearchPostResult__normalPreview" }, defaultPreviewText)) : (attachmentPreview && (React.createElement("span", { className: "SearchPostResult__attachPreview" }, attachmentPreview)));
    const forwardAuthor = usePeer(post.attaches.wall?.authorId, true);
    if (searchResult) {
        const isForward = searchResult.type === 'forwarded';
        const isAttachPreviewAfterText = !isForward || defaultPreviewText;
        return (React.createElement(React.Fragment, null,
            forwardAuthor && isForward && (React.createElement("div", { className: "SearchPostResult__preview" },
                React.createElement(SearchPostResultText, { author: forwardAuthor, withLine: true },
                    React.createElement("span", { className: "SearchPostResult__forwardedPreview" },
                        React.createElement(HighlighterRenderer, { searchResult: searchResult.result }))))),
            React.createElement("div", { className: "SearchPostResult__preview" },
                React.createElement("div", null,
                    React.createElement(SearchPostResultText, null,
                        React.createElement("span", { className: "SearchPostResult__normalPreview" },
                            isForward && attachOrDefaultText,
                            !isForward && (React.createElement(HighlighterRenderer, { searchResult: searchResult.result })))),
                    isAttachPreviewAfterText && attachmentPreview && (React.createElement("div", { className: "SearchPostResult__attachPreview" }, attachmentPreview))),
                firstPhotoUrl && (React.createElement("div", { className: "SearchPostResult__picture" },
                    React.createElement("img", { className: "SearchPostResult__pictureImg", alt: "", src: firstPhotoUrl }))))));
    }
    return (React.createElement("div", { className: "SearchPostResult__preview" },
        React.createElement("div", null,
            React.createElement(SearchPostResultText, null, attachOrDefaultText),
            defaultPreviewText && attachmentPreview && (React.createElement("div", { className: "SearchPostResult__attachPreview" }, attachmentPreview))),
        firstPhotoUrl && (React.createElement("div", { className: "SearchPostResult__picture" },
            React.createElement("img", { className: "SearchPostResult__pictureImg", alt: "", src: firstPhotoUrl })))));
};
function SearchPostResultText({ author, children, withLine, }) {
    const { lang } = useBrowserEnv();
    return (React.createElement("span", { className: cx('SearchPostResult__text', {
            SearchPostResult__textWithLine: withLine,
        }) },
        author !== undefined && (React.createElement("span", { className: "SearchPostResult__author" },
            lang.use('me_convo_list_author_name', {
                values: { name: Peer.shortName(author, 'nom', false) },
            }),
            ' ')),
        children));
}
//# sourceMappingURL=ChannelSearch.js.map