import { useBrowserEnv, useChannels, useDispatch, useFeatureFlags, useViewer, useStoreState, useOnChange, useChannel, useUrlFromBaseUrl, } from '../../hooks/misc';
import '../../ui/SearchChannelsTab/SearchChannelsTab.css';
import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import cx from 'classnames';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import * as Channel from '../../../core/model/Channel';
import * as Viewer from '../../../core/model/Viewer';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { CHANNELS_TAB_ID, } from '../../ui/SearchTabs/SearchTabs';
import { NoResults } from '../../ui/NoResults/NoResults';
import { Icon56PensiveFace, IconIllustrationCatClosedWall78h, } from '@vkontakte-internal/icons-private';
import * as ChannelsConfig from '../../../core/model/ChannelsConfig';
import { useChannelsSearchData } from '../../hooks/useSearch';
import { ChannelTitle } from '../../ui/ChannelTitle/ChannelTitle';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { ChannelPostPreview } from '../../ui/ChannelPostPreview/ChannelPostPreview';
import { useSelectedChannelsFromSearch } from '../../hooks/useSelectedChannelsFromSearch';
import { useTabListNavigation } from '../../hooks/useKeyboardNavigation';
import { useRouter } from '../../ui/Router/Router';
import { Avatar, SimpleCell } from '@vkontakte-internal/vkcom-kit';
import { Header } from '@vkontakte/vkui';
import { Icon24AddSquareOutline, Icon24CheckCircleOutline, Icon24Done, } from '@vkontakte/icons';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useChannelsRecommendations } from '../../hooks/useChannelsRecommendations';
import { IMGoAnalytics } from '../../ui/Analytics/IMGoAnalytics';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { ChannelItemViewAnalytics } from '../../ui/Analytics/ChannelItemViewAnalytics';
const contentProps = {
    className: 'SearchChannelsTab__scrollbar-content',
};
const SearchChannelsTabOld = ({ query: queryProp, isActive, activeTabPanelProps, toggleSearchPanel, }) => {
    const { lang, stats } = useBrowserEnv();
    const channelsCache = useChannels();
    const dispatch = useDispatch();
    const channelsRecommendationsIds = useStoreState('channelsRecommendationsIds');
    const channelsConfigRecommendations = useStoreState('channelsConfig').recommendations;
    const { navigate } = useRouter();
    const query = useRef(queryProp);
    if (isActive) {
        // Не обновляем компонент и не делаем запросов на API, пока вкладка не активна.
        query.current = queryProp;
    }
    const { channels: recentSearchChannelIds, push: pushRecent, removeAll: removeAllRecent, } = useSelectedChannelsFromSearch();
    const recentChannels = useMemo(() => recentSearchChannelIds.reduce((acc, channelId) => {
        const channel = channelsCache.get(channelId);
        if (!channel || channel.kind === 'ChannelRestricted') {
            return acc;
        }
        acc.push(channel);
        return acc;
    }, []), [channelsCache, recentSearchChannelIds]);
    const { results, hasMore, isLoading, query: resultsQuery, loadMore, } = useChannelsSearchData({
        query: query.current,
    });
    const [subscribedChannels, globalChannels] = useMemo(() => results.reduce((acc, channel) => {
        if (channel.isMember) {
            acc[0].push(channel);
            return acc;
        }
        acc[1].push(channel);
        return acc;
    }, [[], []]), [results]);
    const { setTabsCount, setSelectHandler, resetIndexToSelect, onKeyDown, indexToSelect, forceScrollToLoader, } = useTabListNavigation({ hasMore });
    const recommendedChannels = useMemo(() => {
        const searchedChannels = new Set([
            ...recentSearchChannelIds,
            ...results.map((channel) => channel.id),
        ]);
        return channelsRecommendationsIds.reduce((acc, channelId) => {
            const channel = Channel.safeGet(channelsCache, channelId);
            if (channel.kind !== 'ChannelRestricted' &&
                !channel.isMember &&
                !searchedChannels.has(channelId)) {
                acc.push(channel);
            }
            return acc;
        }, []);
    }, [
        channelsCache,
        channelsRecommendationsIds,
        recentSearchChannelIds,
        results,
    ]);
    const isEmpty = !isLoading && !hasMore && results.length === 0;
    const isQueryEmpty = query.current.length === 0;
    const isChannelsRecommendationsVisible = ChannelsConfig.isRecommendationsVisible(channelsConfigRecommendations);
    const showRecent = isQueryEmpty && recentChannels.length !== 0;
    const showSubscribed = !isQueryEmpty && subscribedChannels.length !== 0;
    const showGlobal = !isQueryEmpty && globalChannels.length !== 0;
    const showRecommended = (!hasMore || isQueryEmpty) && recommendedChannels.length !== 0;
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const featureFlags = useFeatureFlags();
    /**
     * Дублирует логику отображения UI в getContent.
     * Формируем единый массив для удобства навигации
     */
    const [allResults, selectedChannelId] = useMemo(() => {
        if (isLoading || isEmpty) {
            return [[], undefined];
        }
        if (showRecent) {
            const allResults = [
                ...recentChannels,
                ...(showRecommended ? recommendedChannels : []),
            ];
            return [allResults, allResults[indexToSelect]?.id];
        }
        const allResults = [
            ...(showGlobal ? results : []),
            ...(showRecommended ? recommendedChannels : []),
        ];
        return [allResults, allResults[indexToSelect]?.id];
    }, [
        indexToSelect,
        isEmpty,
        isLoading,
        recentChannels,
        recommendedChannels,
        showGlobal,
        showRecent,
        showRecommended,
        results,
    ]);
    const { isTwoColumnLayout } = useLayoutData();
    const handleChannelClick = useCallback((channelId) => {
        const shouldPushToRecent = recommendedChannels.findIndex((channel) => channel.id === channelId) ===
            -1;
        if (shouldPushToRecent) {
            pushRecent(channelId);
        }
        const index = allResults.findIndex((channel) => channel.id === channelId);
        resetIndexToSelect(index);
        /**
         * В одноколоночном и мобильном виде мы не можем сохранить поиск если пользователь
         * решил "провалиться" в канал, так как в целях улучшения производительности список результатов будет размонтирован,
         * когда будет смонтирована история канала
         */
        if (!isTwoColumnLayout) {
            toggleSearchPanel(false);
        }
        navigate({
            kind: 'ChannelRoute',
            entrypoint: 'search',
            channelId,
        });
    }, [
        allResults,
        navigate,
        pushRecent,
        recommendedChannels,
        resetIndexToSelect,
        toggleSearchPanel,
        isTwoColumnLayout,
    ]);
    const handleRecommendedChannelClick = (channelId) => {
        stats.logEvent({
            type: 'type_navgo',
            type_navgo: {
                screen: 'im_channels_list',
                subtype: 'go',
                screen_to: 'im_channel',
                destination_item: {
                    type: 'messenger_recommendation',
                    id: channelId,
                },
            },
        });
        stats.logEvent({
            type: 'type_click',
            screen: 'im_channels_list',
            type_click: {
                type: 'type_groups_event_item',
                item: {
                    type: 'click_item',
                },
                type_groups_event_item: {
                    group_id: channelId,
                    type: 'open_community',
                    source: 'messenger_recommendation',
                },
            },
        });
        handleChannelClick(channelId);
    };
    const handleRecommendedVisibilityToggle = useCallback(() => {
        dispatch({
            type: 'UserChangedCollapsedVersion',
            version: isChannelsRecommendationsVisible
                ? channelsConfigRecommendations.version
                : 0,
        });
        if (isChannelsRecommendationsVisible) {
            resetIndexToSelect(0);
        }
    }, [
        channelsConfigRecommendations.version,
        dispatch,
        isChannelsRecommendationsVisible,
        resetIndexToSelect,
    ]);
    const getContent = () => {
        if (isLoading && query.current !== resultsQuery) {
            return React.createElement(OptimizedSpinner, { className: "SearchChannelsTab__contentSpinner" });
        }
        if (isEmpty) {
            return (React.createElement(NoResults, { icon: React.createElement(Icon56PensiveFace, null) }, lang.use('me_channels_search_no_results')));
        }
        return (React.createElement(React.Fragment, null,
            showRecent && (React.createElement(SearchChannelsTabSection, { title: lang.use('me_channels_search_recent_title'), channels: recentChannels, btnTitle: lang.use('me_channels_search_recent_btn'), onChannelClick: handleChannelClick, onBtnClick: removeAllRecent, selectedChannelId: selectedChannelId })),
            (showSubscribed || showGlobal) && (React.createElement(React.Fragment, null,
                showSubscribed && (React.createElement(SearchChannelsTabSection, { channels: subscribedChannels, onChannelClick: handleChannelClick, selectedChannelId: selectedChannelId })),
                showGlobal && (React.createElement(SearchChannelsTabSection, { title: lang.use('me_channels_search_global_title'), channels: globalChannels, onChannelClick: handleChannelClick, selectedChannelId: selectedChannelId })),
                hasMore && (React.createElement(OptimizedSpinner, { className: "SearchChannelsTab__loader", onIntersection: loadMore })))),
            showRecommended && (React.createElement(SearchChannelsTabSection, { title: !isEdu && featureFlags.vkm_channel_name_to_community
                    ? lang.use('me_recommended_channels_community_title')
                    : lang.use('me_recommended_channels_title'), channels: isChannelsRecommendationsVisible ? recommendedChannels : undefined, btnTitle: isChannelsRecommendationsVisible
                    ? lang.use('me_channels_hide_recommendations')
                    : lang.use('me_channels_show_recommendations'), selectedChannelId: selectedChannelId, onChannelClick: handleRecommendedChannelClick, onBtnClick: handleRecommendedVisibilityToggle }))));
    };
    useEffect(() => {
        setTabsCount(allResults.length);
    }, [allResults, setTabsCount]);
    useEffect(() => {
        setSelectHandler((index) => {
            const channel = allResults[index];
            if (!channel || isLoading) {
                return;
            }
            resetIndexToSelect(index);
            handleChannelClick(channel.id);
        });
    }, [
        allResults,
        handleChannelClick,
        isLoading,
        navigate,
        resetIndexToSelect,
        setSelectHandler,
    ]);
    useEffect(() => {
        activeTabPanelProps?.setNavigationParams({
            resetIndexToSelect,
            onKeyDown,
        });
    }, [activeTabPanelProps, resetIndexToSelect, onKeyDown]);
    useLayoutEffect(() => {
        activeTabPanelProps?.tabPanelRef.current
            ?.querySelector('[aria-selected="true"]')
            ?.scrollIntoView({
            block: query.current.length === 0 && indexToSelect === 0
                ? 'center'
                : 'nearest',
        });
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
                ?.querySelector('.SearchChannelsTab__loader')
                ?.scrollIntoView({ block: 'nearest' });
        }
        // Не включаем activeTabPanelProps в зависимости, поскольку не хотим вызывать скролл
        // к выбранному элементу, когда вкладка становится активной.
        // Если пользователь скроллил список и потом ушел в другой tab,
        // то вернувшись сюда он проскроллится к выбранному элементу,
        // который скорее всего в самом начале списка.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceScrollToLoader]);
    return (React.createElement("div", { className: cx('SearchChannelsTab', {
            'SearchChannelsTab--hidden': !isActive,
        }), ref: activeTabPanelProps ? activeTabPanelProps.tabPanelRef : undefined, role: "menu", id: CHANNELS_TAB_ID, "aria-hidden": !isActive },
        React.createElement(ScrollbarProvider, { overflowX: "hidden", role: "presentation", scrollableProps: {
                role: 'presentation',
            }, contentProps: {
                ...contentProps,
                role: 'presentation',
            } }, getContent())));
};
const SearchChannelsTabSection = React.memo(function SearchChannelsTabSection({ channels, title, btnTitle, selectedChannelId, onChannelClick, onBtnClick, }) {
    return (React.createElement(React.Fragment, null,
        title && (React.createElement("div", { className: "SearchChannelsTabSection__header" },
            React.createElement("span", { className: "SearchChannelsTabSection__title" }, title),
            btnTitle && onBtnClick && (React.createElement("button", { className: "SearchChannelsTabSection__button", "aria-label": btnTitle, onClick: onBtnClick, onMouseDown: (event) => {
                    event.preventDefault(); // Необходимо чтобы поиск не терял фокус
                } }, btnTitle)))),
        channels &&
            channels.map((channel) => (React.createElement(SearchChannelsTabItem, { key: channel.id, channel: channel, isSelected: channel.id === selectedChannelId, onClick: () => onChannelClick(channel.id) })))));
});
const SearchChannelsTabItem = React.memo(function SearchChannelsTabItem({ channel, isSelected, onClick }) {
    const { lang } = useBrowserEnv();
    const showCounter = channel.isMember;
    const getTextInfo = () => {
        if (channel.isMember) {
            return (React.createElement(ChannelPostPreview, { post: Channel.lastPost({
                    channel,
                    withPending: true,
                }), isDeleted: false }));
        }
        return lang.use('me_channel_subscribers_count', {
            num: channel.membersCount,
            formatted: 'short',
        });
    };
    return (React.createElement("div", { className: cx('SearchChannelsTabItem', {
            'SearchChannelsTabItem--selected': isSelected,
        }), role: "menuitem", tabIndex: isSelected ? 0 : -1, onClick: onClick, "data-testid": "search_channel_cell" },
        React.createElement(ChannelAvatar, { className: "SearchChannelsTabItem__avatar", photo: channel.photo, name: channel.name, size: 46 }),
        React.createElement(ChannelTitle, { className: "SearchChannelsTabItem__header", channel: channel, hideMutedIcon: true }),
        React.createElement("span", { className: "SearchChannelsTabItem__info" }, getTextInfo()),
        showCounter && (React.createElement("div", { className: "SearchChannelsTabItem__icons" }, Channel.isUnread(channel) && (React.createElement(UnreadCounter, { size: 18, count: channel.unreadCount, isMuted: channel.isMuted }))))));
});
const SearchChannelCell = React.memo(forwardRef(function SearchChannelCell({ channel, onClick, isFocused, isActive, type }, ref) {
    const [isJoinChannelAvailable, setIsJoinChannelAvailable] = useState(!channel.isMember);
    /**
     * При подписке/отписке нужно синхронизироваться (кнопку "плюсик/галочка") со стором.
     * Всё из-за того, что подписка/отписка могут быть сделаны не только по нажатию на "плюсик/галочку",
     * а из разных мест приложения (в том числе из других клиентов).
     */
    const cachedChannel = useChannel(channel.id);
    const isMember = cachedChannel?.kind === 'Channel' && cachedChannel.isMember;
    useOnChange(() => {
        setIsJoinChannelAvailable(!isMember);
    }, [isMember], false);
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const { lang } = useBrowserEnv();
    const channelPhoto = useUrlFromBaseUrl(channel.photo, 50, 50);
    // кнопка подписаться/отписаться видна только для каналов из поисковой выдачи (те, на которые мы ещё не подписаны) и для рекомендованных
    const showAction = type === 'global_search' || type === 'recomm';
    const handleJoinChannelClick = () => {
        let source = 'search_plus';
        switch (type) {
            case 'global_search':
                source = 'search_plus';
                break;
            case 'recomm':
                source = 'search_recomm_plus';
                break;
            // канал, на который мы уже подписаны. Подписываться/отписываться здесь на него нельзя
            case 'local_search':
                return;
            default:
                exhaustivenessCheck(type);
        }
        setIsJoinChannelAvailable(false);
        dispatch({
            type: 'UserChangedChannel',
            userAction: 'join',
            source,
            channelId: channel.id,
            onComplete: () => {
                snackbar({
                    mode: 'dark',
                    message: lang.use('me_you_subscribed', {
                        values: { name: channel.name },
                    }),
                    before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                });
            },
            onFail: () => setIsJoinChannelAvailable(true),
        });
    };
    const handleLeaveChannelClick = () => {
        setIsJoinChannelAvailable(true);
        dispatch({
            type: 'UserChangedChannel',
            channelId: channel.id,
            userAction: 'leave',
            onComplete: () => {
                snackbar({
                    mode: 'dark',
                    message: lang.use('me_you_left_channel', {
                        values: { name: channel.name },
                    }),
                });
            },
            onFail: () => setIsJoinChannelAvailable(false),
        });
    };
    const handleActionClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isJoinChannelAvailable) {
            handleJoinChannelClick();
        }
        else {
            handleLeaveChannelClick();
        }
    };
    const tooltip = isJoinChannelAvailable
        ? lang.use('me_community_channel_action_join')
        : lang.use('me_community_channel_action_leave');
    const actionButton = showAction && (React.createElement(Tooltip, { position: "top", align: "center", content: tooltip, delay: 500 },
        React.createElement("button", { className: cx('SearchChannelCell__actionButton', !isJoinChannelAvailable && 'SearchChannelCell__actionButton--leave'), onClick: handleActionClick }, isJoinChannelAvailable ? React.createElement(Icon24AddSquareOutline, null) : React.createElement(Icon24Done, null))));
    return (React.createElement(SimpleCell, { getRootRef: ref, className: "SearchChannelCell", hovered: isFocused, activated: isActive, "data-testid": "search_channel_cell", before: React.createElement(Avatar, { size: 40, src: channelPhoto }), after: actionButton, onClick: () => onClick(channel.id, channel.searchTrackCode) },
        React.createElement(ChannelTitle, { hideMutedIcon: true, channel: channel })));
}));
const ChannelsGroup = React.memo(function ChannelsGroup({ channels, title, type, className, focusedChannelId, activeChannelId, headerButton, entrypoint, onChannelClick, }) {
    return (React.createElement("div", { className: cx('SearchChannelsGroup', className) },
        React.createElement(Header, { className: "SearchChannelsGroup__header", size: "s", after: headerButton }, title),
        channels.map((channel) => (React.createElement(ChannelItemViewAnalytics, { screen: "im_channels_search", source: entrypoint, trackCode: channel.searchTrackCode, key: channel.id }, (ref) => (React.createElement(SearchChannelCell, { ref: ref, key: channel.id, channel: channel, isFocused: channel.id === focusedChannelId || undefined, isActive: channel.id === activeChannelId, onClick: onChannelClick, type: type })))))));
});
const SearchResult = React.memo(function SearchResult({ searchChannelsAmongSubscriptions, searchChannelsAmongAllChannels, focusedChannelId, activeChannelId, hasMore, isEmpty, onChannelClick, loadMore, }) {
    const { lang } = useBrowserEnv();
    if (isEmpty) {
        return (React.createElement(React.Fragment, null,
            React.createElement(NoResults, { icon: React.createElement(IconIllustrationCatClosedWall78h, null) }, lang.use('me_channel_search_empty_result'))));
    }
    const handleChannelClick = (channelId, trackCode) => {
        onChannelClick(channelId, 'search', trackCode);
    };
    return (React.createElement(React.Fragment, null,
        !!searchChannelsAmongSubscriptions.length && (React.createElement(ChannelsGroup, { title: lang.use('me_channel_search_results_among_subscriptions'), channels: searchChannelsAmongSubscriptions, onChannelClick: handleChannelClick, focusedChannelId: focusedChannelId, activeChannelId: activeChannelId, type: "local_search", entrypoint: "search" })),
        !!searchChannelsAmongAllChannels.length && (React.createElement(ChannelsGroup, { title: lang.use('me_channel_search_results_global'), channels: searchChannelsAmongAllChannels, onChannelClick: handleChannelClick, type: "global_search", focusedChannelId: focusedChannelId, activeChannelId: activeChannelId, entrypoint: "search" })),
        hasMore && (React.createElement(OptimizedSpinner, { className: "SearchChannelsTab__loader", onIntersection: loadMore }))));
});
const ChannelsRecommendations = React.memo(function ChannelsRecommendations({ channels, focusedChannelId, activeChannelId, hasMore, loadMore, onChannelClick, }) {
    const { lang } = useBrowserEnv();
    const { vkm_channels_search_recomm } = useFeatureFlags();
    const $prevLocalChannelsCache = useRef(channels);
    /**
     * Фильтр рекомендованных каналов "живой", поэтому при подписке рекомендованный канал исчезает из фильтра рекомендованных
     * и попадает в фильтр all, как любой канал, на который подписан пользователь.
     * Но здесь, в поиске, мы хотим, чтобы канал не исчезал из списка рекомендованных (пока пользователь не закроет таб),
     * а у него просто вместо кнопки подписаться (сейчас это кнопка с "плюсиком")
     * появлялась кнопка "отписаться" (кнопка с "галочкой").
     * Поэтому мы дополнительно копируем каналы в localChannelsCache, чтобы не "выкидывать" из списка те рекомендованные каналы,
     * на которые пользователь только что подписался и просто конкатенировать дозагружаемые рекомендации в конец списка (newDownloadedDiff).
     */
    const localChannelsCache = useMemo(() => {
        // айдишники, которые мы сейчас показываем в списке в ui
        const currentShownRecommendedIds = new Set($prevLocalChannelsCache.current.map((channel) => channel.id));
        // сопоставляем те реки которые показаны в ui и те что в сторе, чтобы найти дифф - те что подгрузились пагинацией
        const newDownloadedDiff = channels.filter((channel) => !currentShownRecommendedIds.has(channel.id));
        return [...$prevLocalChannelsCache.current, ...newDownloadedDiff];
    }, [channels]);
    $prevLocalChannelsCache.current = localChannelsCache;
    if (!vkm_channels_search_recomm) {
        return null;
    }
    const handleChannelClick = (channelId, trackCode) => {
        onChannelClick(channelId, 'search_recomm', trackCode);
    };
    return (React.createElement(React.Fragment, null,
        !!channels.length && (React.createElement(ChannelsGroup, { title: lang.use('me_channels_recommendations'), channels: localChannelsCache, onChannelClick: handleChannelClick, focusedChannelId: focusedChannelId, activeChannelId: activeChannelId, className: "SearchChannelsTab__channelsRecommendations", type: "recomm", entrypoint: "search_recomm" })),
        hasMore && (React.createElement(OptimizedSpinner
        // Для очень высоких экранов после загрузки очередной страницы тригернём спиннер ещё раз,
        // чтобы убедиться что он действительно пропал из поля видимости
        , { 
            // Для очень высоких экранов после загрузки очередной страницы тригернём спиннер ещё раз,
            // чтобы убедиться что он действительно пропал из поля видимости
            key: channels.length, className: "SearchChannelsTab__loader", onIntersection: loadMore }))));
});
const SearchChannelsTabNew = ({ query, activeTabPanelProps, toggleSearchPanel, }) => {
    const { channelsRecommendations, loadMore: loadMoreRecommendations, hasMore: hasMoreRecommendations, } = useChannelsRecommendations();
    const { stats } = useBrowserEnv();
    const { navigate, screenRoute } = useRouter();
    const currentOpenedChannelId = screenRoute.kind === 'ChannelRoute' ? screenRoute.channelId : undefined;
    const { results, hasMore, isLoading, query: resultsQuery, loadMore, } = useChannelsSearchData({
        query,
    });
    const subscribedChannels = useMemo(() => results.filter((channel) => channel.isMember), [results]);
    const globalChannels = useMemo(() => results.filter((channel) => !channel.isMember), [results]);
    // КЛАВИАТУРНАЯ НАВИГАЦИЯ
    const { setTabsCount, setSelectHandler, resetIndexToSelect, onKeyDown, indexToSelect, forceScrollToLoader, } = useTabListNavigation({ hasMore });
    const isEmpty = !isLoading && !hasMore && results.length === 0;
    const isQueryEmpty = query.length === 0;
    /**
     * Дублирует логику отображения UI в getContent.
     * Формируем единый массив для удобства навигации
     */
    // КЛАВИАТУРНАЯ НАВИГАЦИЯ
    const [allResults, selectedChannelId] = useMemo(() => {
        if (isLoading) {
            return [[], undefined];
        }
        if (isEmpty || isQueryEmpty) {
            return [
                channelsRecommendations,
                channelsRecommendations[indexToSelect]?.id,
            ];
        }
        return [results, results[indexToSelect]?.id];
    }, [
        isQueryEmpty,
        channelsRecommendations,
        indexToSelect,
        isEmpty,
        isLoading,
        results,
    ]);
    const { isTwoColumnLayout } = useLayoutData();
    const handleChannelClick = useCallback((channelId, entrypoint, trackCode) => {
        const index = allResults.findIndex((channel) => channel.id === channelId);
        resetIndexToSelect(index);
        /**
         * В одноколоночном и мобильном виде мы не можем сохранить поиск если пользователь
         * решил "провалиться" в канал, так как в целях улучшения производительности список результатов будет размонтирован,
         * когда будет смонтирована история канала
         */
        if (!isTwoColumnLayout) {
            toggleSearchPanel(false);
        }
        stats.logEvent({
            type: 'type_click',
            screen: 'im_channels_search',
            type_click: {
                type: 'type_channel_item',
                item: {
                    type: 'click_item',
                    track_code: trackCode,
                },
                type_channel_item: {
                    source: entrypoint,
                },
            },
        });
        navigate({
            kind: 'ChannelRoute',
            entrypoint,
            channelId,
            searchTrackCode: trackCode,
        });
    }, [
        allResults,
        resetIndexToSelect,
        isTwoColumnLayout,
        stats,
        navigate,
        toggleSearchPanel,
    ]);
    // КЛАВИАТУРНАЯ НАВИГАЦИЯ
    useEffect(() => {
        activeTabPanelProps?.setNavigationParams({
            resetIndexToSelect,
            onKeyDown,
        });
    }, [activeTabPanelProps, resetIndexToSelect, onKeyDown]);
    // КЛАВИАТУРНАЯ НАВИГАЦИЯ
    useEffect(() => {
        setTabsCount(allResults.length);
    }, [allResults, setTabsCount]);
    // КЛАВИАТУРНАЯ НАВИГАЦИЯ
    useEffect(() => {
        setSelectHandler((index) => {
            const channel = allResults[index];
            if (!channel || isLoading) {
                return;
            }
            resetIndexToSelect(index);
            handleChannelClick(channel.id, 'search');
        });
    }, [
        allResults,
        handleChannelClick,
        isLoading,
        navigate,
        resetIndexToSelect,
        setSelectHandler,
    ]);
    // КЛАВИАТУРНАЯ НАВИГАЦИЯ
    useLayoutEffect(() => {
        if (forceScrollToLoader) {
            activeTabPanelProps?.tabPanelRef.current
                ?.querySelector('.SearchChannelsTab__loader')
                ?.scrollIntoView({ block: 'nearest' });
        }
        // Не включаем activeTabPanelProps в зависимости, поскольку не хотим вызывать скролл
        // к выбранному элементу, когда вкладка становится активной.
        // Если пользователь скроллил список и потом ушел в другой tab,
        // то вернувшись сюда он проскроллится к выбранному элементу,
        // который скорее всего в самом начале списка.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceScrollToLoader]);
    if (isLoading && query !== resultsQuery) {
        return React.createElement(OptimizedSpinner, { className: "SearchChannelsTab__contentSpinner" });
    }
    if (isQueryEmpty) {
        return (React.createElement(ChannelsRecommendations, { channels: channelsRecommendations, onChannelClick: handleChannelClick, focusedChannelId: selectedChannelId, activeChannelId: currentOpenedChannelId, hasMore: hasMoreRecommendations, loadMore: loadMoreRecommendations }));
    }
    return (React.createElement(SearchResult, { searchChannelsAmongSubscriptions: subscribedChannels, searchChannelsAmongAllChannels: globalChannels, onChannelClick: handleChannelClick, focusedChannelId: selectedChannelId, activeChannelId: currentOpenedChannelId, hasMore: hasMore, isEmpty: isEmpty, loadMore: loadMore }));
};
export const SearchChannelsTab = (props) => {
    const { withNewChannels, stats } = useBrowserEnv();
    return withNewChannels ? (React.createElement("div", { className: cx('SearchChannelsTab', {
            'SearchChannelsTab--hidden': !props.isActive,
        }), ref: props.activeTabPanelProps
            ? props.activeTabPanelProps.tabPanelRef
            : undefined, role: "menu", id: CHANNELS_TAB_ID, "aria-hidden": !props.isActive },
        React.createElement(ScrollbarProvider, { overflowX: "hidden", role: "presentation", scrollableProps: {
                role: 'presentation',
            }, contentProps: {
                ...contentProps,
                role: 'presentation',
            } }, props.isActive && (React.createElement(IMGoAnalytics, { type: "im_channels_search", onEvent: stats.logEvent, id: "ChannelsSearch" },
            React.createElement(SearchChannelsTabNew, { ...props })))))) : (React.createElement(SearchChannelsTabOld, { ...props }));
};
//# sourceMappingURL=SearchChannelsTab.js.map