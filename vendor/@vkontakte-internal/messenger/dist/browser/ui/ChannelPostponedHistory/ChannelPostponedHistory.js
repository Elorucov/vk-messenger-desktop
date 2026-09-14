import '../../ui/ChannelPostsHistory/ChannelPostsHistory.css';
import '../../ui/ChannelPostponedHistory/ChannelPostponedHistory.css';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import { isDepsShallowEqual, useBrowserEnv, useCallbackWithCustomCompare, useDidUpdate, useDispatch, useFeatureFlags, useMemoWithCustomCompare, usePrevious, } from '../../hooks/misc';
import * as Channel from '../../../core/model/Channel';
import * as Post from '../../../core/model/Post';
import * as Attach from '../../../core/model/Attach';
import { StickyDateSeparator } from '../../ui/DateSeparator/DateSeparator';
import { ChannelPostMarkedDeleted } from '../../ui/ChannelPost/ChannelPost';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { ChannelFooter } from '../../ui/ChannelFooter/ChannelFooter';
import { POSTS_PER_PAGE } from '../../../core/config/config';
import { exhaustivenessCheck, getDateDayStart } from '../../../core/utils/misc';
import { Time } from '../../../core/utils/time';
import { HopNavigationButton } from '../../ui/HopNavigationButton/HopNavigationButton';
import { Icon20Dropdown, Icon24ChevronCompactLeft, Icon56MessageOutline, } from '@vkontakte/icons';
import { useScrollIndent } from '../../hooks/useScrollIndent';
import { useStickyDates, } from '../../hooks/useStickyDates';
import { VirtualScrollList } from '../../ui/VirtualScroll/VirtualScrollList';
import { VirtualizerCore, } from '../../ui/VirtualScroll/VirtualizerCore';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { DropAreaProvider } from '../../ui/DropArea/DropArea';
import { useVirtualScroll, } from '../../ui/VirtualScroll/useVirtualScroll';
import { ChannelMenu } from '../../ui/ChannelMenu/ChannelMenu';
import { useDropAreaState } from '../../ui/DropArea/useDropAreaState';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ChannelPostSecondary } from '../../ui/ChannelPostSecondary/ChannelPostSecondary';
import { ChannelPostDeletedSecondary } from '../../ui/ChannelPostDeletedSecondary/ChannelPostDeletedSecondary';
import { ChannelPostPrimary } from '../../ui/ChannelPostPrimary/ChannelPostPrimary';
import { useRouter } from '../../ui/Router/Router';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import { useActiveConvoTopPlayerType } from '../../ui/ConvoTopPlayer/ConvoTopPlayer';
import { ChannelTopPlayer } from '../../ui/ChannelTopPlayer/ChannelTopPlayer';
import { ChannelAudiosPlaylistProvider } from '../../ui/Playlists/ConvoAudiosPlaylistContext';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Placeholder } from '@vkontakte/vkui';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { CalendarModalNew } from '../../ui/CalendarModal/CalendarModalNew';
import { useModal } from '../../hooks/useModal';
import { useSnackbar } from '../../hooks/useSnackbar';
import { IApi } from '../../../data/env/IApi';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useApiFetch } from '../../hooks/useApiFetch';
import { nanoid } from 'nanoid';
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
export const CHANNEL_POST_MEDIA_PADDING = 2;
export const ChannelPostponedHistory = memo(({ className, channel, scrollCache, routeCmid, postReactions, hidePlayerOnMusicPlayback, onClose, }) => {
    const ref = useRef(null);
    const { dropAreaState, handleDragEnter, hideDropArea } = useDropAreaState();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const topPlayerType = useActiveConvoTopPlayerType();
    const dispatch = useDispatch();
    const { navigate, screenRoute } = useRouter();
    const hideAudioPlayer = hidePlayerOnMusicPlayback && topPlayerType === 'audio';
    const { isThemed, themeAppearance, themeBackground } = useCurrentThemeStyle({});
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    const { isMobileLayout } = useLayoutData();
    useEffect(() => {
        if (!channel.postponed.loaded) {
            dispatch({
                type: 'UserScrolledChannelPostponedHistory',
                direction: 'forward',
                channelId: channel.id,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, channel.id]);
    useEffect(() => {
        return () => {
            dispatch({
                type: 'UserClosedChannelPostponed',
                channelId: channel.id,
            });
        };
    }, [channel.id, dispatch]);
    let channelPostHorizontalPadding = CHANNEL_POST_HISTORY_HORIZONTAL_PADDING;
    if (!isMobileLayout && isWithoutBubblesTheme) {
        channelPostHorizontalPadding =
            CHANNEL_POST_HISTORY_HORIZONTAL_PADDING_LARGE;
    }
    const handleCommentsBackButtonClick = () => navigate({
        kind: 'ChannelRoute',
        channelId: channel.id,
        organiser: screenRoute.organiser,
        parentRoute: screenRoute.kind === 'ChannelRoute'
            ? screenRoute.parentRoute
            : undefined,
    });
    return (React.createElement("div", { className: cx(className, 'ChannelPostsHistory'), style: {
            '--channelPostsHistoryContentHorizontalPadding': channelPostHorizontalPadding + 'px',
            '--channelPostsMediaPadding': CHANNEL_POST_MEDIA_PADDING + 'px',
            ...themeAppearanceStyles,
        } },
        React.createElement(ChannelPostponedHeader, { className: "ChannelPostComments__header", onBackClick: handleCommentsBackButtonClick }),
        React.createElement("div", { className: "ChannelPostsHistory__themeWrapper" },
            themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
            React.createElement("div", { className: "ChannelPostsHistory__banners" }, topPlayerType === 'audio' && !hideAudioPlayer && (React.createElement(BannerPanel, { mode: "custom", isVisible: true, noBottomBorder: true },
                React.createElement(ChannelTopPlayer, { type: topPlayerType })))),
            React.createElement("div", { ref: ref, onDragEnter: handleDragEnter, className: "ChannelPostsHistory__dropArea" },
                React.createElement(DropAreaProvider, { ...dropAreaState, onHide: hideDropArea, containerRef: ref },
                    React.createElement(ChannelAudiosPlaylistProvider, { channel: channel }, channel.postponed.loaded ? (React.createElement(PostsHistory, { channel: channel, postReactions: postReactions, scrollCache: scrollCache, routeCmid: routeCmid, firstPostponedCmid: channel.postponed.history.segments[0]
                            ? Post.resolveCmid(channel.postponed.history.segments[0].elements[0]
                                .id)
                            : undefined, isThemed: isThemed })) : (React.createElement(ChannelPostponedHistoryLoader, null))),
                    React.createElement(ChannelFooter, { className: "ChannelPostsHistory__footer", channelId: channel.id, parentId: channel.parentId, isArchived: channel.isArchived, isMember: channel.isMember, isCommentsRestricted: Channel.isCommentsRestricted(channel), isCommunityChannel: Channel.isCommunityChannel(channel), adminLevel: channel.adminLevel, canSendDonut: channel.rights.canSendDonut, actionButton: channel.actionButton, menu: channel.menu ? (React.createElement(ChannelMenu, { items: channel.menu })) : undefined, onClose: onClose, isMuted: channel.isMuted }))))));
});
ChannelPostponedHistory.displayName = 'ChannelPostponedHistory';
const PostsHistory = memo(({ channel, scrollCache, routeCmid, firstPostponedCmid, postReactions, isThemed, }) => {
    const dispatch = useDispatch();
    const { lang, idle } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const snackbar = useSnackbar();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const [virtualizerCore] = useState(() => new VirtualizerCore(POSTS_LIST_CONFIG));
    /**
     * Запоминаем изначальную границу прочитанности канала,
     * чтобы сепаратор непрочитанных оставался на одном месте,
     * вне зависимости от ререндеров.
     */
    const [initialInReadCmid, setInitialInReadCmid] = useState(firstPostponedCmid || Post.resolveCmid(0));
    const $channel = useRef(channel);
    $channel.current = channel;
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
    const { changeActiveDate, registerStickyDate } = useStickyDates({
        container: wrapper,
    });
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
        if (!$wasScrolledToInitialPosition.current) {
            return {
                kind: 'unread-separator',
            };
        }
        return {
            kind: 'unread-separator',
        };
    };
    const focusItem = getFocusItem();
    setFocusItem(channel.id, focusItem, false);
    const apiRequestCmid = useMemo(() => {
        switch (focusItem.kind) {
            case 'unread-separator': {
                return firstPostponedCmid ?? initialInReadCmid;
            }
            case 'Normal': {
                return focusItem.cmid;
            }
            case 'Pending':
            case 'bottom': {
                return firstPostponedCmid ?? initialInReadCmid;
            }
            default:
                exhaustivenessCheck(focusItem);
        }
        // Пересчитываем только на изменение focusItem, поскольку только focusItem
        // отвечает за видимую часть истории.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusItem, firstPostponedCmid]);
    const { slice: historySlice, hasAfter, hasBefore, } = Channel.postponedHistoryAround(channel, focusItem.kind === 'unread-separator'
        ? firstPostponedCmid || Post.resolveCmid(0)
        : apiRequestCmid);
    const nodes = useMemo(() => historySlice?.elements || [], [historySlice?.elements]);
    const itemsCount = nodes.length;
    const hasMoreUpper = hasBefore;
    const hasMoreBottom = hasAfter;
    const loadMore = useCallback((direction) => {
        const topGap = historySlice?.elements[0];
        const bottomGap = historySlice?.elements[historySlice?.elements.length - 1];
        if (direction === 'upper' && topGap) {
            return dispatch({
                type: 'UserScrolledChannelPostponedHistory',
                channelId: channel.id,
                direction: 'backward',
                startCmid: topGap.content.cmid,
            });
        }
        if (direction === 'bottom' && bottomGap) {
            return dispatch({
                type: 'UserScrolledChannelPostponedHistory',
                channelId: channel.id,
                direction: 'forward',
                startCmid: bottomGap.content.cmid,
            });
        }
    }, [channel.id, dispatch, historySlice?.elements]);
    const getNodeByIndex = useCallbackWithCustomCompare((index) => {
        return nodes[index];
    }, [nodes], isDepsShallowEqual);
    const getItemKey = useCallback((index) => {
        const node = nodes[index];
        if (!node) {
            return '';
        }
        return String(node.id);
    }, [nodes]);
    const itemsKeys = useMemoWithCustomCompare(() => nodes.map((node) => String(node.id)), [getItemKey, nodes], isDepsShallowEqual);
    const scrollPosition = useMemo(() => {
        switch (focusItem.kind) {
            case 'unread-separator': {
                return {
                    kind: 'Item',
                    options: {
                        align: 'upper',
                        itemKey: initialInReadCmid.toString(),
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
            const date = upperVisibleNode.content.sentAt;
            changeActiveDate(getDateDayStart(date));
        }
    }, [
        changeActiveDate,
        getNodeByIndex,
        hasMoreBottom,
        hasMoreUpper,
        itemsCount,
        loadMore,
    ]);
    const handleSend = async (id) => {
        try {
            const response = await apiFetch('channels.sendMessage', {
                from_group: 1,
                post_id: id,
                channel_id: channel.id,
                guid: Channel.generateGuid(),
            });
            dispatch({
                type: 'UserHitPostponedPostPublish',
                channelId: channel.id,
                cmid: id,
                response,
            });
            setFocusItem(channel.id, {
                kind: 'unread-separator',
            });
        }
        catch {
            snackbar({
                message: lang.use('me_error_title'),
            });
        }
    };
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
            const post = res.items?.[0];
            if (!post) {
                return setFocusItem(channel.id, {
                    kind: 'Normal',
                    align: 'center',
                    cmid: initialInReadCmid,
                    margin: 0,
                });
            }
            /**
             * Если пост "опубликовался" или его удалили, то он будет помечен как удалённый
             * и искать его в истории отложек не нужно.
             */
            if (post.cm_payload?.is_deleted) {
                setFocusItem(channel.id, { kind: 'unread-separator' });
                return;
            }
        }
        dispatch({
            type: 'UserScrolledChannelPostponedHistory',
            direction: 'around',
            channelId: channel.id,
            startCmid: apiRequestCmid,
        });
    }, [
        focusItem.kind,
        apiRequestCmid,
        channel.id,
        dispatch,
        apiFetch,
        setFocusItem,
        initialInReadCmid,
    ]);
    const handleUnreadButtonClick = useCallback(() => {
        const focusItem = {
            kind: 'bottom',
        };
        setFocusItem(channel.id, focusItem);
    }, [channel, setFocusItem]);
    useEffect(() => {
        if (routeCmid === undefined ||
            (focusItem.kind === 'Normal' && focusItem.cmid === routeCmid)) {
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
    /**
     * Сбрасываем focusItem, если его намеренно удалили из routeCmid.
     * Это необходимо, в том числе, при удалении отложенного поста, чтобы не сломать историю,
     * так как отложенные посты удаляются полностью из истории и на них нет ссылки.
     */
    useEffect(() => {
        if (!routeCmid &&
            focusItem.kind === 'Normal' &&
            focusItem.cmid === prevRouteCmid) {
            setFocusItem(channel.id, null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeCmid]);
    // Сбрасываем focusItem при выходе из отложенных сообщений
    useEffect(() => () => {
        setFocusItem(channel.id, null);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    // Сохраняем позицию скролла перед закрытием канала.
    // Нужен именно useLayoutEffect, потому что нужно делать вычисления в DOM.
    // Обязательно не должно быть зависимостей, так как используется ref на функцию.
    // При этом сохранять позицию мы хотим при каждом закрытии, это работает за счет
    // атрибута key с id канала у родительского компонента.
    // Если появятся зависимости, то сохранение не будет работать корректно,
    // так как в рефе будут значения от последнего рендера.
    // useLayoutEffect(() => () => saveScrollPositionRef.current(), [])
    const { virtualizerState, triggerContentUpdate } = useVirtualScroll({
        wrapper,
        content,
        virtualizerCore,
        options: virtualScrollOptions,
    });
    const slice = virtualizerCore.getSliceArea();
    const calendarModal = useModal();
    const [postponedPost, setPostponedPost] = useState();
    const renderContent = () => {
        if (Channel.isPostponedEmpty(channel)) {
            return (React.createElement("div", { className: "PostsHistory__emptyOnboarding" },
                React.createElement(Placeholder, { className: cx('ChannelPostponedHistory__empty', {
                        'ChannelPostponedHistory__empty--themed': isThemed,
                    }), icon: React.createElement(Icon56MessageOutline, null), title: lang.use('me_channel_postponed_empty_header') }, lang.use('me_channel_postponed_empty_subtitle'))));
        }
        if (!historySlice) {
            return (React.createElement(OptimizedSpinner, { className: "PostsList__spinner", intersectionOptions: {
                    initialInView: true,
                    triggerOnce: true,
                }, size: "m", onIntersection: loadHistoryAroundSliceCmid }));
        }
        return (React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState },
            React.createElement(PostsListContent, { nodes: nodes, isCommunityChannel: isCommunityChannel, postReactions: postReactions, channelName: channel.name, channelPhotos: channel.photo, pendingNodes: [], onSend: handleSend, onEditSendTime: (post) => {
                    calendarModal.open();
                    setPostponedPost(post);
                }, channelId: channel.id, initialInReadCmid: initialInReadCmid, setContent: setContent, isChannelArchived: channel.isArchived, isRepostsDisabled: channel.isRepostsDisabled, focusItem: focusItem, hasMoreBottom: hasMoreBottom, hasMoreUpper: hasMoreUpper, canChangeCommentsPosting: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, canDelete: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, registerStickyDate: registerStickyDate, isThemed: isThemed, onContentUpdate: triggerContentUpdate }),
            !hasMoreBottom && slice && slice.bottomIndex >= itemsCount - 1 && (React.createElement("div", { key: "bottom-hop-nav-trigger", ref: setPinnedBottomTrigger }))));
    };
    $wasScrolledToInitialPosition.current = true;
    const scrollableProps = useMemo(() => ({
        ref: setWrapper,
    }), []);
    const contentProps = useMemo(() => ({
        className: 'PostsList__scrollbar-content',
    }), []);
    const renderCalendarModal = () => {
        const handleSave = async (date) => {
            if (postponedPost) {
                try {
                    const response = await apiFetch('channels.editMessage', {
                        channel_id: channel.id,
                        cmid: postponedPost.cmid,
                        publish_date: date
                            ? Math.floor(date.getTime() / 1000)
                            : Math.floor(Date.now() / 1000),
                        message: Post.toRawText(postponedPost),
                        attachments: Attach.ids(postponedPost.attaches).join(','),
                    });
                    dispatch({
                        type: 'UserHitPostponedPostEditTime',
                        channelId: channel.id,
                        cmid: postponedPost.cmid,
                        response,
                    });
                    calendarModal.close();
                }
                catch (err) {
                    if (err instanceof IApi.RequestError) {
                        snackbar({
                            message: String(err.apiError?.error_text || lang.use('me_error_title')),
                        });
                    }
                }
            }
        };
        const handleClose = () => {
            setPostponedPost(undefined);
            calendarModal.close();
        };
        return (React.createElement(CalendarModalNew, { className: "ChannelPostponedHistory__calendarWrapper", enableTime: true, disablePast: true, withoutTimeButton: true, calcInitialDate: (now) => postponedPost?.sentAt
                ? new Date(postponedPost?.sentAt)
                : new Date(now + Time.Hour), onSave: handleSave, onClose: handleClose }));
    };
    return (React.createElement("div", { className: "PostsHistory" },
        React.createElement(ScrollbarProvider, { scrollableProps: scrollableProps, contentProps: contentProps, className: cx('PostsList', {
                'PostsList--secondary': isWithoutBubblesTheme,
            }), overflowX: "hidden", forceVisible: "y" }, renderContent()),
        React.createElement(PostsHistoryHopNavigation, { unreadCount: 0, isUnreadIndentCrossed: isUnreadIndentCrossed, onUnreadClick: handleUnreadButtonClick }),
        calendarModal.isActive && renderCalendarModal()));
});
PostsHistory.displayName = 'PostsHistory';
const PostsListContent = ({ channelId, channelName, nodes, setContent, focusItem, isChannelArchived, isRepostsDisabled, canDelete, hasMoreUpper, hasMoreBottom, canChangeCommentsPosting, registerStickyDate, channelPhotos, postReactions, isThemed, isCommunityChannel, onContentUpdate, onSend, onEditSendTime, }) => {
    const router = useRouter();
    const slicedNodes = nodes;
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const searchQueryToHighlight = (router.screenRoute.kind === 'ChannelRoute' && router.screenRoute.search) ||
        '';
    const dateGroups = (() => {
        const acc = [];
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
        slicedNodes.forEach((node, postIndex, self) => {
            let itemElement;
            const isFocused = focusItem.kind === 'Normal' && focusItem.cmid === node.content.cmid;
            const isHighlighted = isFocused && focusItem.highlight;
            const postCmid = node.content.cmid;
            const itemKey = String(postCmid);
            const postDayStart = getDateDayStart(node.content.sentAt);
            if (isWithoutBubblesTheme) {
                itemElement = node.content.markDeleted ? (React.createElement(ChannelPostDeletedSecondary, { channelId: channelId, channelName: channelName, channelPhoto: channelPhotos, postCmid: postCmid, canRestore: canDelete, isPostponed: node.content.kind === 'Postponed', isHighlighted: isHighlighted })) : (React.createElement(ChannelPostponedPostKey, { attaches: node.content.attaches, render: (key) => {
                        return (React.createElement(ChannelPostSecondary, { key: key, channelName: channelName, channelPhoto: channelPhotos, channelId: channelId, post: node.content, canDelete: canDelete, canEdit: node.content.canEdit, signerId: node.content.signerId, onSend: () => onSend(node.content.cmid), onEditSendTime: () => onEditSendTime(node.content), isChannelArchived: isChannelArchived, isCommunityChannel: isCommunityChannel, postReactions: postReactions, isRepostsDisabled: isRepostsDisabled, canChangeCommentsPosting: canChangeCommentsPosting, isFocused: isFocused, isHighlighted: isHighlighted, searchQueryToHighlight: searchQueryToHighlight, onSizeChange: onContentUpdate }));
                    } }));
            }
            else {
                itemElement = node.content.markDeleted ? (React.createElement(ChannelPostMarkedDeleted, { className: "PostsList__post", canRestore: canDelete, channelId: channelId, cmid: postCmid, isPostponed: node.content.kind === 'Postponed', isHighlighted: isHighlighted })) : (React.createElement(ChannelPostponedPostKey, { attaches: node.content.attaches, render: (key) => {
                        return (React.createElement(ChannelPostPrimary, { key: key, canDelete: canDelete, canEdit: node.content.canEdit, channelId: channelId, post: node.content, onEditSendTime: () => onEditSendTime(node.content), onSend: () => onSend(node.content.cmid), canChangeCommentsPosting: canChangeCommentsPosting, signerId: node.content.signerId, isCommunityChannel: isCommunityChannel, isChannelArchived: isChannelArchived, postReactions: postReactions, isRepostsDisabled: isRepostsDisabled, isFocused: isFocused, isHighlighted: isHighlighted, searchQueryToHighlight: searchQueryToHighlight, onSizeChange: onContentUpdate }));
                    } }));
            }
            if (postDayStart !== currentDate) {
                clearStack(postIndex === 0);
                currentDate = postDayStart;
            }
            dateGroupStack.push(React.createElement(VirtualScrollItem, { key: itemKey, className: "PostsList__item", itemKey: itemKey.toString() }, itemElement));
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
const ChannelPostponedHistoryLoader = () => {
    return (React.createElement("div", { className: "PostsHistory" },
        React.createElement(OptimizedSpinner, { className: "PostsList__spinner", size: "m" })));
};
export const ChannelPostponedHeader = ({ className, onBackClick }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx(className, 'ChannelHeader') },
        React.createElement(Tooltip, { position: "bottom", align: "center", content: lang.use('me_route_back') },
            React.createElement("i", { role: "img", onClick: onBackClick, className: "ChannelHeader__buttonIcon" },
                React.createElement(Icon24ChevronCompactLeft, null))),
        React.createElement("div", { className: "ChannelHeader__info" },
            React.createElement("span", { className: "ChannelHeader__infoTitle" }, lang.use('me_channel_postponed_history')))));
};
function ChannelPostponedPostKey({ attaches, render, }) {
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const key = useMemo(() => {
        const _attaches = attaches;
        return nanoid();
    }, [attaches]);
    return render(vkm_new_bubbles_width_calc ? key : undefined);
}
//# sourceMappingURL=ChannelPostponedHistory.js.map