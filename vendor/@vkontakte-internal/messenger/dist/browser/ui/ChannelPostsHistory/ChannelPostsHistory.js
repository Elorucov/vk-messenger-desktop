import '../../ui/ChannelPostsHistory/ChannelPostsHistory.css';
import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import { isDepsShallowEqual, useBrowserEnv, useCallbackWithCustomCompare, useDidUpdate, useDispatch, useFeatureFlags, useMemoWithCustomCompare, usePrevious, useViewer, } from '../../hooks/misc';
import * as Channel from '../../../core/model/Channel';
import * as Post from '../../../core/model/Post';
import * as History from '../../../core/model/History';
import * as Viewer from '../../../core/model/Viewer';
import { StickyDateSeparator } from '../../ui/DateSeparator/DateSeparator';
import { ChannelPostMarkedDeleted, ChannelPostPending, } from '../../ui/ChannelPost/ChannelPost';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { ChannelHistoryHeader } from '../../ui/ChannelHeader/ChannelHeader';
import { ChannelFooter } from '../../ui/ChannelFooter/ChannelFooter';
import { COMMENTS_REFRESH_INTERVAL, POSTS_PER_PAGE } from '../../../core/config/config';
import { exhaustivenessCheck, getDateDayStart } from '../../../core/utils/misc';
import { HopNavigationButton } from '../../ui/HopNavigationButton/HopNavigationButton';
import { Icon20Dropdown, Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { useScrollIndent } from '../../hooks/useScrollIndent';
import { useStickyDates, } from '../../hooks/useStickyDates';
import { VirtualScrollList } from '../../ui/VirtualScroll/VirtualScrollList';
import { VirtualizerCore, } from '../../ui/VirtualScroll/VirtualizerCore';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { useVirtualScroll, } from '../../ui/VirtualScroll/useVirtualScroll';
import { DropAreaProvider } from '../../ui/DropArea/DropArea';
import { ChannelEmptyOnboarding } from '../../ui/ChannelEmptyOnboarding/ChannelEmptyOnboarding';
import { ChannelMenu } from '../../ui/ChannelMenu/ChannelMenu';
import { useDropAreaState } from '../../ui/DropArea/useDropAreaState';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ChannelPostSecondary } from '../../ui/ChannelPostSecondary/ChannelPostSecondary';
import { ChannelPostDeletedSecondary } from '../../ui/ChannelPostDeletedSecondary/ChannelPostDeletedSecondary';
import { ChannelPostPrimary } from '../../ui/ChannelPostPrimary/ChannelPostPrimary';
import { Footnote, Separator } from '@vkontakte/vkui';
import { ChannelPostPendingSecondary } from '../../ui/ChannelPostPendingSecondary/ChannelPostPendingSecondary';
import { useRouter } from '../../ui/Router/Router';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { useCollectChannelOpenEvent } from '../../hooks/usePerfStats';
import { BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import { useActiveConvoTopPlayerType } from '../../ui/ConvoTopPlayer/ConvoTopPlayer';
import { ChannelTopPlayer } from '../../ui/ChannelTopPlayer/ChannelTopPlayer';
import { ChannelAudiosPlaylistProvider } from '../../ui/Playlists/ConvoAudiosPlaylistContext';
import { useSeenHistoryItems, } from '../../hooks/useSeenHistoryItems';
import { IPerfStats } from '../../../data/env/IPerfStats';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { ChannelEmpty } from '../../ui/ChannelEmpty/ChannelEmpty';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useApiFetch } from '../../hooks/useApiFetch';
import { ChannelClosed } from '../../ui/ChannelClosed/ChannelClosed';
import { MediascopeTracker } from '../../ui/Analytics/MediascopeTracker';
const POSTS_LIST_CONFIG = {
    sliceCount: 10,
    preloadCount: 0,
    throttleDelay: 100,
    sliceCountIncrement: POSTS_PER_PAGE / 2,
    sliceByViewAreaRatio: 2.5,
};
const PIN_BOTTOM_OFFSET = 100;
export const CHANNEL_POST_HISTORY_HORIZONTAL_PADDING = 16;
export const CHANNEL_POST_HISTORY_HORIZONTAL_PADDING_LARGE = 32;
const CHANNEL_POST_MEDIA_PADDING = 2;
export const ChannelPostsHistory = memo(({ className, channel, scrollCache, routeCmid, postReactions, hidePlayerOnMusicPlayback, onClose, onPostForward, onPinChannel, onAdultBadgeClick, }) => {
    const ref = useRef(null);
    const { dropAreaState, handleDragEnter, hideDropArea } = useDropAreaState();
    const { screenRoute } = useRouter();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const topPlayerType = useActiveConvoTopPlayerType();
    const hideAudioPlayer = hidePlayerOnMusicPlayback && topPlayerType === 'audio';
    const { isThemed, themeAppearance, themeBackground } = useCurrentThemeStyle({});
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    let channelPostHorizontalPadding = CHANNEL_POST_HISTORY_HORIZONTAL_PADDING;
    const { isMobileLayout } = useLayoutData();
    if (!isMobileLayout && isWithoutBubblesTheme) {
        channelPostHorizontalPadding =
            CHANNEL_POST_HISTORY_HORIZONTAL_PADDING_LARGE;
    }
    return (React.createElement("div", { className: cx(className, 'ChannelPostsHistory'), style: {
            '--channelPostsHistoryContentHorizontalPadding': channelPostHorizontalPadding + 'px',
            '--channelPostsMediaPadding': CHANNEL_POST_MEDIA_PADDING + 'px',
            ...themeAppearanceStyles,
        } },
        React.createElement(ChannelHistoryHeader, { onPinChannel: onPinChannel, onAdultBadgeClick: onAdultBadgeClick, className: "ChannelPostsHistory__header", channel: channel, closeChannel: onClose }),
        React.createElement("div", { className: "ChannelPostsHistory__themeWrapper" },
            themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
            React.createElement("div", { className: "ChannelPostsHistory__banners" }, topPlayerType === 'audio' && !hideAudioPlayer && (React.createElement(BannerPanel, { mode: "custom", isVisible: true, noBottomBorder: true },
                React.createElement(ChannelTopPlayer, { type: topPlayerType })))),
            React.createElement("div", { ref: ref, onDragEnter: handleDragEnter, className: "ChannelPostsHistory__dropArea" },
                React.createElement(DropAreaProvider, { ...dropAreaState, onHide: hideDropArea, containerRef: ref },
                    React.createElement(ChannelAudiosPlaylistProvider, { channel: channel },
                        React.createElement(PostsHistory, { channel: channel, postReactions: postReactions, scrollCache: scrollCache, routeCmid: routeCmid, onPostForward: onPostForward, isThemed: isThemed })),
                    screenRoute.kind === 'ChannelRoute' &&
                        !(Channel.isPrivate(channel) && !channel.isParentGroupMember) &&
                        !screenRoute.postponed && (React.createElement(ChannelFooter, { className: "ChannelPostsHistory__footer", channelId: channel.id, parentId: channel.parentId, isArchived: channel.isArchived, isMember: channel.isMember, isCommentsRestricted: Channel.isCommentsRestricted(channel), isCommunityChannel: Channel.isCommunityChannel(channel), adminLevel: channel.adminLevel, canSendDonut: channel.rights.canSendDonut, actionButton: channel.actionButton, menu: channel.menu ? (React.createElement(ChannelMenu, { items: channel.menu })) : undefined, onClose: onClose, banInfo: channel.banInfo, isMuted: channel.isMuted })))))));
});
ChannelPostsHistory.displayName = 'ChannelPostsHistory';
export const PostsHistory = memo(({ channel, scrollCache, routeCmid, onPostForward, postReactions, isThemed, }) => {
    const dispatch = useDispatch();
    const { lang, idle, perfStats, stats } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const { replace, screenRoute } = useRouter();
    const featureFlags = useFeatureFlags();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const snackbar = useSnackbar();
    const [virtualizerCore] = useState(() => new VirtualizerCore(POSTS_LIST_CONFIG));
    /**
     * Запоминаем изначальную границу прочитанности канала,
     * чтобы сепаратор непрочитанных оставался на одном месте,
     * вне зависимости от ререндеров.
     */
    const [initialInReadCmid, setInitialInReadCmid] = useState(channel.inReadCmid);
    const isRepostsDisabled = channel.isRepostsDisabled ||
        (featureFlags.vkm_channels_repost_restrictio &&
            Channel.isRepostsDisabledWithAdditionalRules(channel));
    const $channel = useRef(channel);
    $channel.current = channel;
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const $viewArea = useRef(undefined);
    const prevRouteCmid = usePrevious(routeCmid);
    const [wrapper, setWrapper] = useState(null);
    const [content, setContent] = useState(null);
    const $wasScrolledToInitialPosition = useRef(false);
    const [isUnreadIndentCrossed, setUnreadIndentCrossed] = useState(true);
    const [isBottomPinned, setBottomPinned] = useState(true);
    const { setTrigger: setPinnedBottomTrigger, checkIndent: checkPinnedBottom, } = useScrollIndent({
        wrapper,
        margin: PIN_BOTTOM_OFFSET,
        onTriggerCross: useCallback((isCrossed) => {
            setBottomPinned(isCrossed);
            virtualizerCore.onPinBottomChanged(isCrossed);
            if (content) {
                setUnreadIndentCrossed(isCrossed);
            }
            else {
                // Не хотим рисовать кнопку проскролла внизу, пока content не определен.
                setUnreadIndentCrossed(true);
            }
        }, [content, virtualizerCore]),
    });
    const $wasPinnedBottomBeforeIdle = useRef();
    const [isIdle, setIsIdle] = useState(() => idle.isIdle());
    useEffect(() => idle.subscribe(() => {
        const isIdle = idle.isIdle();
        setIsIdle(isIdle);
        if (isIdle) {
            $wasPinnedBottomBeforeIdle.current = isBottomPinned;
            setBottomPinned(false);
        }
        else {
            $wasPinnedBottomBeforeIdle.current = undefined;
            checkPinnedBottom();
        }
    }), [idle, checkPinnedBottom, isBottomPinned]);
    const $prevUnreadCount = useRef(channel.unreadCount);
    useDidUpdate(() => {
        if (isIdle) {
            if ($wasPinnedBottomBeforeIdle.current) {
                setInitialInReadCmid(channel.inReadCmid);
                setFocusItem(channel.id, { kind: 'unread-separator' });
            }
            $prevUnreadCount.current = channel.unreadCount;
            return;
        }
        if (isBottomPinned &&
            $prevUnreadCount.current === 0 &&
            channel.unreadCount === 1) {
            setFocusItem(channel.id, { kind: 'bottom' });
        }
        $prevUnreadCount.current = channel.unreadCount;
    }, [channel.unreadCount]);
    useDidUpdate(() => {
        // это эффект служит для того, чтобы после разбана открывать последний пост в истории
        if (!channel.banInfo) {
            setInitialInReadCmid(channel.inReadCmid);
            setFocusItem(channel.id, { kind: 'bottom' });
        }
    }, [channel.banInfo]);
    const { changeActiveDate, registerStickyDate } = useStickyDates({
        container: wrapper,
    });
    const lastPost = useMemo(() => Channel.lastPost({ channel, withPending: true }), [channel]);
    const prevLastPost = usePrevious(lastPost);
    const { setFocusItem, getFocusItem: getCachedFocusItem } = scrollCache;
    const getFocusItem = () => {
        if (!$wasScrolledToInitialPosition.current &&
            routeCmid &&
            routeCmid !== prevRouteCmid) {
            return {
                kind: 'Normal',
                align: 'upper',
                cmid: routeCmid,
                margin: 0,
                highlight: true,
            };
        }
        const cachedFocusItem = getCachedFocusItem(channel.id);
        if (cachedFocusItem !== undefined) {
            return cachedFocusItem;
        }
        if (channel.unreadCount !== 0 &&
            !$wasScrolledToInitialPosition.current) {
            return {
                kind: 'unread-separator',
            };
        }
        return {
            kind: 'bottom',
        };
    };
    const focusItem = getFocusItem();
    setFocusItem(channel.id, focusItem, false);
    const lastCmid = History.lastCmid(channel.history);
    const apiRequestCmid = useMemo(() => {
        switch (focusItem.kind) {
            case 'unread-separator': {
                return initialInReadCmid;
            }
            case 'Normal': {
                return focusItem.cmid;
            }
            case 'Pending':
            case 'bottom': {
                return lastCmid ?? initialInReadCmid;
            }
            default:
                exhaustivenessCheck(focusItem);
        }
        // Пересчитываем только на изменение focusItem, поскольку только focusItem
        // отвечает за видимую часть истории.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusItem]);
    const historySlice = Channel.historyAround(channel, focusItem.kind === 'unread-separator'
        ? /**
           * Делаем +1, поскольку нас интересует следующий пост за последним
           * прочитанным. Пост с таким cmid'ом не гарантированно есть в истории,
           * он может быть удален, например. Но метод historyAround все равно в
           * этом случае сможет вернуть слайс.
           */
            Post.resolveCmid(apiRequestCmid + 1)
        : apiRequestCmid);
    const nodes = historySlice?.nodes || [];
    const pendingNodes = historySlice?.pendingNodes || [];
    const allNodes = [...nodes, ...pendingNodes];
    const itemsCount = allNodes.length;
    const hasMoreUpper = !!historySlice && !!historySlice.topGap;
    const hasMoreBottom = !!historySlice && !!historySlice.bottomGap;
    useCollectChannelOpenEvent(historySlice);
    const loadMore = useCallback((direction) => {
        const topGap = historySlice?.topGap;
        const bottomGap = historySlice?.bottomGap;
        if (direction === 'upper' && topGap) {
            return dispatch({
                type: 'UserScrolledChannelHistory',
                channelId: channel.id,
                direction: 'backward',
                startCmid: Post.resolveCmid(topGap.toCmid),
                possibleSkipped: topGap.toCmid - topGap.fromCmid + 1,
            });
        }
        if (direction === 'bottom' && bottomGap) {
            return dispatch({
                type: 'UserScrolledChannelHistory',
                channelId: channel.id,
                direction: 'forward',
                startCmid: Post.resolveCmid(bottomGap.fromCmid),
                possibleSkipped: bottomGap.toCmid - bottomGap.fromCmid + 1,
            });
        }
    }, [channel.id, dispatch, historySlice?.bottomGap, historySlice?.topGap]);
    const getNodeByIndex = useCallbackWithCustomCompare((index) => {
        return allNodes[index];
    }, [allNodes], isDepsShallowEqual);
    const getItemKeyForNode = useCallback((node) => {
        switch (node.kind) {
            case 'Node':
            case 'DeletedNode': {
                return History.nodeCmid(node).toString();
            }
            case 'PendingNode': {
                return node.item.randomId.toString();
            }
            default:
                exhaustivenessCheck(node);
        }
    }, []);
    const itemsKeys = useMemoWithCustomCompare(() => allNodes.map(getItemKeyForNode), [getItemKeyForNode, allNodes], isDepsShallowEqual);
    const scrollPosition = useMemo(() => {
        switch (focusItem.kind) {
            case 'unread-separator': {
                const getUnreadItemCmid = () => {
                    const closestNode = historySlice &&
                        History.findClosestNodeInSlice(historySlice, 
                        // Делаем +1, чтобы открыться на следующем непрочитанном посте
                        Post.resolveCmid(initialInReadCmid + 1), true);
                    if (!closestNode) {
                        return;
                    }
                    return History.nodeCmid(closestNode);
                };
                return {
                    kind: 'Item',
                    options: {
                        align: 'upper',
                        itemKey: (getUnreadItemCmid() ?? initialInReadCmid).toString(),
                        // Покрывает высоту даты.
                        margin: 40,
                    },
                };
            }
            case 'bottom': {
                return { kind: 'Bottom' };
            }
            case 'Normal':
            case 'Pending': {
                const { align, margin, offset, highlight } = focusItem;
                return {
                    kind: 'Item',
                    options: {
                        itemKey: focusItem.kind === 'Normal'
                            ? focusItem.cmid.toString()
                            : focusItem.randomId.toString(),
                        align,
                        margin,
                        offset,
                        highlight,
                    },
                };
            }
            default:
                exhaustivenessCheck(focusItem);
        }
        // Скроллим историю через пересчет scrollPosition только при изменении focusItem, а также
        // при загрузке истории, так как после изменения focusItem история может быть не загружена,
        // а мы можем высчитать itemKey только с загруженной историей.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusItem, !!historySlice]);
    const handleLogSeenPostsStats = useCallback((items) => {
        items.forEach((item) => {
            stats.logEvent(getViewPostStatsEvent('im_channel', item.startTime, item.endTime, item.target.trackCode || ''));
            const wall = item.target.attaches.wall;
            if (wall) {
                stats.logEvent(getViewPostStatsEvent('im_channel', item.startTime, item.endTime, wall.trackCode || ''));
            }
        });
    }, [stats]);
    const { handleViewItemsChange } = useSeenHistoryItems({
        onSeenItemsReady: handleLogSeenPostsStats,
    });
    const handleSeenPosts = useCallback((viewArea) => {
        // Читаем посты
        const bottomVisibleNode = getNodeByIndex(viewArea.bottomIndex);
        if (bottomVisibleNode &&
            (bottomVisibleNode.kind === 'Node' ||
                bottomVisibleNode.kind === 'DeletedNode')) {
            const postCmid = History.nodeCmid(bottomVisibleNode);
            if (postCmid > channel.inReadCmid) {
                dispatch({
                    type: 'UserReadPost',
                    channelId: channel.id,
                    cmid: postCmid,
                });
            }
        }
        // Просматриваем посты
        const inViewPosts = [];
        for (let i = viewArea.upperIndex; i <= viewArea.bottomIndex; i++) {
            const node = getNodeByIndex(i);
            if (node?.kind === 'Node') {
                inViewPosts.push({
                    id: node.item.cmid,
                    target: node.item,
                });
            }
        }
        handleViewItemsChange(inViewPosts);
    }, [
        channel.id,
        channel.inReadCmid,
        dispatch,
        getNodeByIndex,
        handleViewItemsChange,
    ]);
    const handleAreaChange = useCallback((viewArea) => {
        if (!viewArea) {
            $viewArea.current = viewArea;
            return;
        }
        // Загружаем историю вверх
        if ((!$viewArea.current ||
            viewArea.upperIndex < $viewArea.current.upperIndex) &&
            viewArea.upperIndex <= POSTS_LIST_CONFIG.preloadCount &&
            hasMoreUpper) {
            loadMore('upper');
        }
        // Загружаем историю вниз
        if ((!$viewArea.current ||
            viewArea.bottomIndex > $viewArea.current.bottomIndex) &&
            viewArea.bottomIndex >=
                itemsCount - POSTS_LIST_CONFIG.preloadCount - 1 &&
            hasMoreBottom) {
            loadMore('bottom');
        }
        $viewArea.current = viewArea;
        // Переключаем запиненные даты
        const upperVisibleNode = getNodeByIndex(viewArea.upperIndex);
        if (upperVisibleNode) {
            const date = History.nodeSentAt(upperVisibleNode);
            changeActiveDate(getDateDayStart(date));
        }
        if (!isIdle) {
            handleSeenPosts(viewArea);
        }
    }, [
        changeActiveDate,
        getNodeByIndex,
        handleSeenPosts,
        hasMoreBottom,
        hasMoreUpper,
        isIdle,
        itemsCount,
        loadMore,
    ]);
    // Загружаем историю вниз, когда viewArea находится в самом низу и handleAreaChange не будет вызван
    // Этот кейс происходит при подписке на канал, когда пользователь находится на последнем посте
    useDidUpdate(() => {
        const isViewAreaOnLastPost = $viewArea.current &&
            $viewArea.current.bottomIndex >=
                itemsCount - POSTS_LIST_CONFIG.preloadCount - 1;
        if (hasMoreBottom && isViewAreaOnLastPost) {
            loadMore('bottom');
        }
    }, [hasMoreBottom]);
    useDidUpdate(() => {
        if (!isIdle && $viewArea.current) {
            handleSeenPosts($viewArea.current);
        }
    }, [isIdle]);
    const redirectIfPostponed = useCallback((res) => {
        const apiPost = res.items?.[0];
        if (!apiPost) {
            return;
        }
        const apiPostType = apiPost.attachments &&
            apiPost.attachments[0] &&
            apiPost.attachments[0].wall?.post_type;
        if (apiPostType === 'postpone' &&
            screenRoute.kind === 'ChannelRoute') {
            replace({
                ...screenRoute,
                postCmid: undefined,
                postponed: Post.resolveCmid(apiPost.cmid),
            });
            return true;
        }
        return false;
    }, [replace, screenRoute]);
    const virtualScrollOptions = {
        itemsKeys,
        scrollPosition,
        onViewAreaChange: handleAreaChange,
        // Сохранение позиции скролла по низу удобно при открытии истории внизу
        anchorAlign: focusItem.kind === 'bottom' ? 'bottom' : 'upper',
    };
    const loadHistoryAroundSliceCmid = useCallback(async () => {
        if (focusItem.kind === 'Normal') {
            const res = await apiFetch('channels.getMessagesById', {
                channel_id: channel.id,
                cmids: apiRequestCmid.toString(),
                extended: 0,
            });
            if (!res.items?.length) {
                return setFocusItem(channel.id, {
                    kind: 'Normal',
                    align: 'center',
                    cmid: initialInReadCmid,
                    margin: 0,
                });
            }
            if (redirectIfPostponed(res)) {
                return;
            }
            if (res.items?.[0]?.cm_payload?.is_deleted) {
                snackbar({
                    before: (React.createElement(Icon24ErrorCircleOutline, { fill: "var(--vkui--color_text_negative)" })),
                    message: lang.use('me_channels_post_not_found'),
                });
            }
        }
        dispatch({
            type: 'UserScrolledChannelHistory',
            direction: 'around',
            startCmid: apiRequestCmid,
            channelId: channel.id,
        });
    }, [
        snackbar,
        lang,
        focusItem.kind,
        dispatch,
        apiRequestCmid,
        channel.id,
        apiFetch,
        redirectIfPostponed,
        setFocusItem,
        initialInReadCmid,
    ]);
    const handleUnreadButtonClick = useCallback(() => {
        const bottomNode = $viewArea.current && getNodeByIndex($viewArea.current.bottomIndex);
        const shouldScrollToUnread = channel.unreadCount > 0 &&
            bottomNode &&
            bottomNode?.kind !== 'PendingNode' &&
            // Если нижнее видимое сообщение более раннее, чем непрочитанные,
            // то скроллим к непрочитанным.
            History.nodeCmid(bottomNode) < channel.inReadCmid;
        if (shouldScrollToUnread) {
            setInitialInReadCmid(channel.inReadCmid);
        }
        const focusItem = shouldScrollToUnread
            ? {
                kind: 'unread-separator',
            }
            : {
                kind: 'bottom',
            };
        setFocusItem(channel.id, focusItem);
    }, [channel, getNodeByIndex, setFocusItem]);
    useEffect(() => {
        if (lastPost?.kind !== 'Pending') {
            return;
        }
        if (!prevLastPost ||
            prevLastPost.kind === 'Normal' ||
            (prevLastPost.randomId !== lastPost.randomId &&
                lastPost.sentAt > prevLastPost.sentAt)) {
            setFocusItem(channel.id, {
                kind: 'bottom',
            });
        }
    }, [lastPost, prevLastPost, setFocusItem, channel.id]);
    useEffect(() => {
        if (routeCmid === undefined ||
            (focusItem.kind === 'Normal' &&
                focusItem.cmid === routeCmid &&
                lastCmid &&
                routeCmid < lastCmid)) {
            return;
        }
        ;
        (async () => {
            const res = await apiFetch('channels.getMessagesById', {
                channel_id: channel.id,
                cmids: routeCmid.toString(),
                extended: 0,
            });
            if (!res.items?.length) {
                snackbar({
                    before: (React.createElement(Icon24ErrorCircleOutline, { fill: "var(--vkui--color_text_negative)" })),
                    message: lang.use('me_channels_post_not_found'),
                });
                return;
            }
            if (redirectIfPostponed(res)) {
                return;
            }
            if (res.items?.[0]?.cm_payload?.is_deleted) {
                snackbar({
                    before: (React.createElement(Icon24ErrorCircleOutline, { fill: "var(--vkui--color_text_negative)" })),
                    message: lang.use('me_channels_post_not_found'),
                });
                return;
            }
            setFocusItem(channel.id, {
                kind: 'Normal',
                cmid: routeCmid,
                align: 'upper',
                margin: 0,
                highlight: true,
            });
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setFocusItem, channel.id, routeCmid]);
    useEffect(() => {
        const onVisibilityChange = () => {
            // Можем сдвинуть границы непрочитанности, если пользователь ушел со страницы.
            // Благодаря этому, ему проще будет заметить новые сообщение вернувшись на страницу.
            if (document.visibilityState === 'hidden') {
                setInitialInReadCmid($channel.current.inReadCmid);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);
    // Шорт-полл комментариев, реакций, каунтеров
    useEffect(() => {
        if (!featureFlags.vkm_channels_short_polling) {
            return;
        }
        if (isIdle) {
            return;
        }
        if (channel.isClosed && !channel.isMember) {
            return;
        }
        const refreshInterval = typeof featureFlags.vkm_channels_short_polling === 'number'
            ? featureFlags.vkm_channels_short_polling * 1000
            : COMMENTS_REFRESH_INTERVAL;
        const intervalId = setInterval(() => {
            if (!$viewArea.current) {
                return;
            }
            const upperNode = getNodeByIndex($viewArea.current.upperIndex);
            const bottomNode = getNodeByIndex($viewArea.current.bottomIndex);
            if (!upperNode || !bottomNode || upperNode.kind === 'PendingNode') {
                return;
            }
            const fromCmid = History.nodeCmid(upperNode);
            const toCmid = bottomNode.kind === 'PendingNode'
                ? undefined
                : History.nodeCmid(bottomNode);
            dispatch({
                type: 'PollChannelPosts',
                channelId: channel.id,
                fromCmid,
                toCmid,
            });
        }, refreshInterval);
        return () => clearInterval(intervalId);
    }, [
        isIdle,
        channel.id,
        channel.isClosed,
        channel.isMember,
        dispatch,
        getNodeByIndex,
        featureFlags.vkm_channels_short_polling,
    ]);
    useEffect(() => {
        if (!featureFlags.vkm_channel_stub_attach) {
            return;
        }
        const cmidsWithStubAttach = Channel.getPostsCmidsWithStubAttach(channel.history);
        if (!cmidsWithStubAttach.length) {
            return;
        }
        perfStats?.removeEvent(IPerfStats.EventType.channelStubAttachLoaded);
        perfStats?.addEvent(IPerfStats.EventType.channelStubAttachLoaded, {
            data: {
                loadStart: perfStats.getCurrentTime(),
            },
        });
        dispatch({
            type: 'LoadChannelPosts',
            channelId: channel.id,
            postCmids: cmidsWithStubAttach,
            onComplete: () => {
                perfStats?.addEventData(IPerfStats.EventType.channelStubAttachLoaded, {
                    loadEnd: perfStats.getCurrentTime(),
                });
                const event = perfStats?.getEvent(IPerfStats.EventType.channelStubAttachLoaded);
                if (event) {
                    perfStats?.logEvent(event);
                    perfStats?.removeEvent(IPerfStats.EventType.channelStubAttachLoaded);
                }
            },
        });
        // Нужно только изменение истории
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel.history]);
    const saveScrollPositionRef = useRef(() => { });
    saveScrollPositionRef.current = () => {
        const bottomVisibleNode = $viewArea.current && getNodeByIndex($viewArea.current.bottomIndex);
        if (bottomVisibleNode === undefined ||
            bottomVisibleNode?.kind === 'PendingNode' ||
            // Если видимая граница совпадает с границей прочитанности, значит
            // пользователь просто скроллился вниз по истории и позицию скролла сохранять
            // не нужно.
            History.nodeCmid(bottomVisibleNode) >= channel.inReadCmid ||
            isBottomPinned) {
            return setFocusItem(channel.id, null, false);
        }
        const sliceItem = virtualizerCore.getSliceItem();
        if (!sliceItem) {
            return setFocusItem(channel.id, null, false);
        }
        const { itemKey, margin, align } = sliceItem;
        const sliceItemNode = allNodes.find((node) => getItemKeyForNode(node) === itemKey);
        if (!sliceItemNode) {
            return setFocusItem(channel.id, null, false);
        }
        return setFocusItem(channel.id, {
            align,
            margin,
            ...(sliceItemNode.kind === 'PendingNode'
                ? {
                    kind: 'Pending',
                    randomId: sliceItemNode.item.randomId,
                }
                : {
                    kind: 'Normal',
                    cmid: History.nodeCmid(sliceItemNode),
                }),
        }, false);
    };
    // Сохраняем позицию скролла перед закрытием канала.
    // Нужен именно useLayoutEffect, потому что нужно делать вычисления в DOM.
    // Обязательно не должно быть зависимостей, так как используется ref на функцию.
    // При этом сохранять позицию мы хотим при каждом закрытии, это работает за счет
    // атрибута key с id канала у родительского компонента.
    // Если появятся зависимости, то сохранение не будет работать корректно,
    // так как в рефе будут значения от последнего рендера.
    useLayoutEffect(() => () => saveScrollPositionRef.current(), []);
    const { virtualizerState, triggerContentUpdate } = useVirtualScroll({
        wrapper,
        content,
        virtualizerCore,
        options: virtualScrollOptions,
    });
    const slice = virtualizerCore.getSliceArea();
    const renderContent = () => {
        // если endDate 0, то значит это пермабан
        // в таком случае посты не показываем
        if (channel.banInfo && !channel.banInfo.endDate) {
            return (React.createElement("span", { className: cx('PostsHistory__emptyPlaceholder', {
                    'PostsHistory__emptyPlaceholder--themed': isThemed,
                }) }, lang.use('me_channel_history_unavailable')));
        }
        if (isCommunityChannel &&
            channel.isClosed &&
            !channel.isParentGroupMember) {
            return (React.createElement("div", { className: "PostsHistory__emptyOnboarding" },
                React.createElement(ChannelClosed, { channel: channel, isPrivate: Channel.isPrivate(channel), isThemed: isThemed })));
        }
        if (Channel.isEmpty(channel)) {
            if (channel.adminLevel === 3 /* Peer.GroupAdminLevel.Admin */) {
                const showNewBanner = !isEdu && channel.channelType === 'community_channel';
                return (React.createElement("div", { className: "PostsHistory__emptyOnboarding" }, showNewBanner ? (React.createElement(ChannelEmpty, { isThemed: isThemed })) : (React.createElement(ChannelEmptyOnboarding, { isThemed: isThemed, channel: channel }))));
            }
            return (React.createElement("span", { className: cx('PostsHistory__emptyPlaceholder', {
                    'PostsHistory__emptyPlaceholder--themed': isThemed,
                }) }, lang.use('me_channel_history_placeholder')));
        }
        if (!historySlice) {
            return (React.createElement(OptimizedSpinner, { className: "PostsList__spinner", intersectionOptions: {
                    initialInView: true,
                }, size: "m", onIntersection: loadHistoryAroundSliceCmid }));
        }
        return (React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState },
            React.createElement(PostsListContent, { nodes: nodes, postReactions: postReactions, channelName: channel.name, channelPhoto: channel.photo, pendingNodes: pendingNodes, channelId: channel.id, initialInReadCmid: initialInReadCmid, setContent: setContent, isCommunityChannel: isCommunityChannel, isChannelArchived: channel.isArchived, isRepostsDisabled: isRepostsDisabled, focusItem: focusItem, hasMoreBottom: hasMoreBottom, hasMoreUpper: hasMoreUpper, canChangeCommentsPosting: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, canDelete: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, onPostForward: onPostForward, registerStickyDate: registerStickyDate, isThemed: isThemed, onContentUpdate: triggerContentUpdate }),
            !hasMoreBottom && slice && slice.bottomIndex >= itemsCount - 1 && (React.createElement("div", { key: "bottom-hop-nav-trigger", ref: setPinnedBottomTrigger }))));
    };
    $wasScrolledToInitialPosition.current = true;
    const scrollableProps = useMemo(() => ({
        ref: setWrapper,
    }), []);
    const contentProps = useMemo(() => ({
        className: 'PostsList__scrollbar-content',
    }), []);
    return (React.createElement("div", { className: "PostsHistory" },
        React.createElement(ScrollbarProvider, { scrollableProps: scrollableProps, contentProps: contentProps, className: cx('PostsList', {
                'PostsList--secondary': isWithoutBubblesTheme,
            }), overflowX: "hidden", forceVisible: "y" }, renderContent()),
        React.createElement(PostsHistoryHopNavigation, { unreadCount: channel.unreadCount, isUnreadIndentCrossed: isUnreadIndentCrossed, onUnreadClick: handleUnreadButtonClick })));
});
PostsHistory.displayName = 'PostsHistory';
const PostsListContent = ({ channelId, channelName, nodes, pendingNodes, setContent, initialInReadCmid, focusItem, isChannelArchived, isRepostsDisabled, isCommunityChannel, canDelete, hasMoreUpper, hasMoreBottom, canChangeCommentsPosting, registerStickyDate, onPostForward, channelPhoto, postReactions, isThemed, onContentUpdate, }) => {
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const router = useRouter();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const searchQueryToHighlight = (router.screenRoute.kind === 'ChannelRoute' && router.screenRoute.search) ||
        '';
    const dateGroups = (() => {
        const acc = [];
        let foundFirstUnread = false;
        let dateGroupStack = [];
        let currentDate = 0;
        const clearStack = (forceDateVisible = false) => {
            if (dateGroupStack.length === 0) {
                return;
            }
            acc.push(React.createElement("div", { key: currentDate, className: "PostsList__dateGroup" },
                React.createElement(StickyDateSeparator, { className: "PostsList__date", date: currentDate, registerStickyDate: registerStickyDate, forcedIsVisible: forceDateVisible, isThemed: isThemed }),
                dateGroupStack));
            dateGroupStack = [];
        };
        [...nodes, ...(pendingNodes || [])].forEach((node, postIndex, self) => {
            let itemElement;
            let itemKey;
            let postDayStart;
            let shouldPlaceUnreadSeparator = false;
            const isFocused = focusItem.kind === 'Normal' &&
                node.kind === 'Node' &&
                focusItem.cmid === node.item.cmid;
            const isHighlighted = ((focusItem.kind === 'Pending' &&
                node.kind === 'PendingNode' &&
                focusItem.randomId === node.item.randomId) ||
                isFocused) &&
                focusItem.highlight;
            switch (node.kind) {
                case 'Node':
                case 'DeletedNode': {
                    const postCmid = History.nodeCmid(node);
                    itemKey = postCmid;
                    const isAfterinitialInReadCmid = postCmid > initialInReadCmid;
                    postDayStart = getDateDayStart(History.nodeSentAt(node));
                    shouldPlaceUnreadSeparator =
                        isAfterinitialInReadCmid && !foundFirstUnread;
                    const signerId = node.kind === 'Node' ? node.item.signerId : undefined;
                    const post = node.kind === 'Node' ? node.item : undefined;
                    const isRepostDisabledWithAdditionalRules = Boolean(isRepostsDisabled || // репосты выключены вообще в соо или сработали проверки на правила каналов
                        !post || // или если удаленный пост
                        (featureFlags.vkm_channels_repost_restrictio &&
                            Post.isRepostsDisabledWithAdditionalRules(post, !!featureFlags.vkm_channel_donut_redesign)));
                    if (isWithoutBubblesTheme) {
                        itemElement =
                            node.kind === 'DeletedNode' ? (React.createElement(ChannelPostDeletedSecondary, { channelId: channelId, channelName: channelName, channelPhoto: channelPhoto, postCmid: postCmid, canRestore: canDelete, isHighlighted: isHighlighted })) : (React.createElement(MediascopeTracker, { urls: node.item.mediascopeResearchUrls, events: node.item.mediascopeResearchEvents, surface: "post" },
                                React.createElement(ChannelPostSecondary, { key: featureFlags.vkm_new_bubbles_width_calc
                                        ? node.item.updatedAt
                                        : undefined, channelName: channelName, channelPhoto: channelPhoto, channelId: channelId, post: node.item, canDelete: canDelete, isCommunityChannel: isCommunityChannel, canEdit: node.item.canEdit, signerId: signerId, isChannelArchived: isChannelArchived, postReactions: postReactions, isRepostsDisabled: isRepostDisabledWithAdditionalRules, canChangeCommentsPosting: canChangeCommentsPosting, isFocused: isFocused, isHighlighted: isHighlighted, searchQueryToHighlight: searchQueryToHighlight, onForward: onPostForward, onSizeChange: onContentUpdate })));
                    }
                    else {
                        itemElement =
                            node.kind === 'DeletedNode' ? (React.createElement(ChannelPostMarkedDeleted, { className: "PostsList__post", canRestore: canDelete, channelId: channelId, cmid: postCmid, isHighlighted: isHighlighted })) : (React.createElement(MediascopeTracker, { urls: node.item.mediascopeResearchUrls, events: node.item.mediascopeResearchEvents, surface: "post" },
                                React.createElement(ChannelPostPrimary, { key: featureFlags.vkm_new_bubbles_width_calc
                                        ? node.item.updatedAt
                                        : undefined, canDelete: canDelete, canEdit: node.item.canEdit, channelId: channelId, post: node.item, isCommunityChannel: isCommunityChannel, canChangeCommentsPosting: canChangeCommentsPosting, signerId: signerId, isChannelArchived: isChannelArchived, postReactions: postReactions, isRepostsDisabled: isRepostDisabledWithAdditionalRules, isFocused: isFocused, isHighlighted: isHighlighted, searchQueryToHighlight: searchQueryToHighlight, onForward: onPostForward, onSizeChange: onContentUpdate })));
                    }
                    break;
                }
                case 'PendingNode': {
                    const post = node.item;
                    itemKey = post.randomId;
                    postDayStart = getDateDayStart(post.sentAt);
                    itemElement = isWithoutBubblesTheme ? (React.createElement(ChannelPostPendingSecondary, { channelId: channelId, channelName: channelName, channelPhoto: channelPhoto, post: post, isCommunityChannel: isCommunityChannel, onSizeChange: onContentUpdate })) : (React.createElement(ChannelPostPending, { channelId: channelId, post: post, isCommunityChannel: isCommunityChannel, onSizeChange: onContentUpdate }));
                    break;
                }
                default:
                    exhaustivenessCheck(node);
            }
            if (postDayStart !== currentDate) {
                clearStack(postIndex === 0);
                currentDate = postDayStart;
            }
            dateGroupStack.push(React.createElement(VirtualScrollItem, { key: itemKey, className: "PostsList__item", itemKey: itemKey.toString() },
                shouldPlaceUnreadSeparator && (React.createElement("div", { className: cx('PostsList__unreadSeparator', {
                        'PostsList__unreadSeparator--themed': isThemed,
                    }) },
                    !isThemed && (React.createElement(Separator, { className: "PostsList__unreadSeparatorStroke" })),
                    React.createElement(Footnote, null, lang.use('me_channel_history_new_posts')),
                    !isThemed && (React.createElement(Separator, { className: "PostsList__unreadSeparatorStroke" })))),
                itemElement));
            if (shouldPlaceUnreadSeparator) {
                foundFirstUnread = true;
            }
            if (postIndex === self.length - 1) {
                clearStack(postIndex === 0);
            }
        });
        return acc;
    })();
    return (React.createElement("div", { className: "PostsList__content", ref: setContent },
        hasMoreUpper && (React.createElement(OptimizedSpinner, { key: "upper-loader-trigger", className: "PostsList__spinner" })),
        dateGroups,
        hasMoreBottom && (React.createElement(OptimizedSpinner, { key: "bottom-loader-trigger", className: "PostsList__spinner" }))));
};
PostsListContent.displayName = 'PostsListContent';
const PostsHistoryHopNavigation = memo(({ unreadCount, isUnreadIndentCrossed, onUnreadClick }) => {
    return (React.createElement("div", { className: "PostsHistory__hopNavigation" },
        React.createElement(HopNavigationButton, { count: unreadCount, isVisible: !isUnreadIndentCrossed, isCounterVisible: unreadCount !== 0, icon: React.createElement(Icon20Dropdown, null), onClick: onUnreadClick })));
});
PostsHistoryHopNavigation.displayName = 'PostsHistoryHopNavigation';
export function getViewPostStatsEvent(screen, startTime, endTime, trackCode) {
    return {
        type: 'type_view',
        screen,
        type_view: {
            position: 0,
            start_view: String(startTime * 1000),
            end_view: String(endTime * 1000),
            item: {
                type: 'post',
                track_code: trackCode,
            },
            type: 'type_feed_item',
            type_feed_item: {
                duration_async: 0,
                event_type: 'post',
                // @TODO: Добавить передачу размеров поста
                width: 1,
                height: 1,
            },
        },
    };
}
//# sourceMappingURL=ChannelPostsHistory.js.map