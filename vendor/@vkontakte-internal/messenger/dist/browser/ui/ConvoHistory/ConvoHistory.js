import '../../ui/ConvoHistory/ConvoHistory.css';
import '../../ui/ConvoHistory/ConvoHistoryWithoutBubblesTheme.css';
import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Message from '../../../core/model/Message';
import * as History from '../../../core/model/History';
import * as Channel from '../../../core/model/Channel';
import * as Viewer from '../../../core/model/Viewer';
import { ServiceMessage } from '../../ui/ServiceMessage/ServiceMessage';
import { ExpiredMessages } from '../../ui/ExpiredMessages/ExpiredMessages';
import { debounce, exhaustivenessCheck, getDateDayStart, isDev, noop, throttle, } from '../../../core/utils/misc';
import { ConvoStack } from '../../ui/ConvoStack/ConvoStack';
import { useBrowserEnv, useOwner, useFeatureFlags, useViewer, useDispatch, useOnChange, useCallbackWithCustomCompare, isDepsShallowEqual, useDidUpdate, useMemoWithCustomCompare, usePeer, useSelectConvo, } from '../../hooks/misc';
import { ConvoHistoryTyping } from '../../ui/ConvoHistoryTyping/ConvoHistoryTyping';
import { ConvoHistoryPlaceholder } from '../../ui/ConvoHistoryPlaceholder/ConvoHistoryPlaceholder';
import { ConvoAudiosPlaylistProvider } from '../../ui/Playlists/ConvoAudiosPlaylistContext';
import { ConvoVoicesPlaylistProvider } from '../../ui/Playlists/ConvoVoicesPlaylistContext';
import { ConvoVideoMessagesPlaylistProvider } from '../../ui/Playlists/ConvoVideoMessagesPlaylistContext';
import { isMessageCanBeSelected, } from '../../hooks/useSelectedMessages';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { StickyDateSeparator } from '../../ui/DateSeparator/DateSeparator';
import { MESSAGES_PER_PAGE, REACTIONS_REFRESH_INTERVAL, } from '../../../core/config/config';
import { MessageReactionAnimationProvider, useMessageReactionAnimation, } from '../../hooks/useMessageReactionAnimation';
import { ConvoHistoryMessageBlock } from '../../ui/ConvoHistoryMessageBlock/ConvoHistoryMessageBlock';
import { ConvoMessageDeleted } from '../../ui/ConvoMessageDeleted/ConvoMessageDeleted';
import { useCheckMessageIsAvailable } from '../../hooks/useCheckMessageIsAvailable';
import { useStickyDates, } from '../../hooks/useStickyDates';
import { VirtualizerCore, } from '../../ui/VirtualScroll/VirtualizerCore';
import { useVirtualScroll } from '../../ui/VirtualScroll/useVirtualScroll';
import { VirtualScrollList } from '../../ui/VirtualScroll/VirtualScrollList';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { useScrollIndent } from '../../hooks/useScrollIndent';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { useRouter } from '../../ui/Router/Router';
import { ConvoHistoryVacationMark } from '../../ui/ConvoHistoryVacationMark/ConvoHistoryVacationMark';
import { useCollectChatOpenEvent } from '../../hooks/usePerfStats';
import { ConvoHistoryAntispamCard } from '../../ui/ConvoHistoryAntispamCard/ConvoHistoryAntispamCard';
import { useSeenHistoryItems, } from '../../hooks/useSeenHistoryItems';
import { getViewPostStatsEvent } from '../../ui/ChannelPostsHistory/ChannelPostsHistory';
import { useVirtualScrollKeyboardFocusNavigation, composeVirtualScrollFirstFocusableSelector, ITEM_KEY_ATTRIBUTE, } from '../../hooks/useVirtualScrollKeyboardFocusNavigation';
import { ConvoHistoryHeaderContent } from '../../ui/ConvoHistoryHeaderContent/ConvoHistoryHeaderContent';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { useComposerDraft } from '../../hooks/useComposerDraft';
import { COMPOSER_AUTOFOCUS_DISABLED } from '../../ui/ComposerInput/ComposerEditor';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { browser } from '../../utils/misc';
const PIN_BOTTOM_OFFSET = 100;
export const COMPACT_HISTORY_WIDTH = 545;
const PRELOAD_MESSAGES_COUNT = MESSAGES_PER_PAGE / 10;
const getVirtualizerConfig = (featureFlags, isMobileLayout) => ({
    sliceCount: isMobileLayout ? 3 : 10,
    preloadCount: PRELOAD_MESSAGES_COUNT,
    throttleDelay: featureFlags.vkm_mark_read_without_throttle ? 0 : 100,
    trailingThrottleDelay: featureFlags.vkm_virt_scroll_trail_throttle,
    /**
     * Повышаем количество рендеримых сообщений для ios,
     * чтобы инерционный скролл реже останавливался из-за
     * изменений высоты контейнера сообщений, вызываемых
     * измененением рендеримого слайса.
     */
    sliceCountIncrement: browser.ios ? 30 : 3,
    sliceByViewAreaRatio: browser.ios ? 3.5 : 2.5,
});
export const ConvoHistory = React.memo(function ConvoHistory({ convo, history, selected, entrypoint, isPostponed, onSelectMessage, onSeenMessages, isCompactView = false, placeholder, normalMessageActions, onKeyboardSend, onCallbackButtonClick, onMessageForward, onScrollToMessage, onOpenMessageInModal, onCloseMessageInModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, onVisibleNodesChange, onBottomIndentCross, onUnknownReactionClick, onOpenReport, toggleAntispamBanner, scrollCache, messageReactions, withScrollSaveOnClose, isThemed, isContrastTheme, controlHandleRef, isNavigating, onNavigationEnd, openClipCoOwnersModal, }) {
    const { lang, idle, stats } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const dispatch = useDispatch();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const owner = useOwner();
    const peer = usePeer(convo.peerId);
    const { isMobileLayout } = useLayoutData();
    /**
     * Храним скроллящийся контейнер и в стейте для виртуалайзера,
     * и в рефе для корретной работы управлением фокуса.
     */
    const [wrapper, setWrapper] = useState(null);
    const $wrapper = useRef(null);
    const [content, setContent] = useState(null);
    const { isChanging: isMainPanelChanging } = useCollapsibleContainer();
    const [virtualizerCore] = useState(() => new VirtualizerCore(getVirtualizerConfig(featureFlags, isMobileLayout)));
    /**
     * Нам важно зафиксировать границы непрочитанности в момент открытия беседы.
     * От этого зависит где мы будем рисовать сепаратор, и как мы будем делить
     * сообщения по стекам.
     */
    const [initialInReadBy, setInitialInReadBy] = useState(convo.inReadBy);
    const $viewArea = useRef();
    const { changeActiveDate, registerStickyDate } = useStickyDates({
        container: wrapper,
    });
    const { setFocusItem: setCachedFocusItem, getFocusItem: getCachedFocusItem } = scrollCache ?? {};
    /**
     * Фокусный элемент.
     * Используется для открытия истории в нужном месте и для проскролла истории куда-либо.
     * Для получения данных истории из модели, ниже конвертируем его в
     * sliceCmid, так как модель умеет доставать историю только по cmid.
     */
    const [focusItem, setFocusItem] = useState(() => {
        const cached = getCachedFocusItem?.(convo.peerId);
        if (cached !== undefined) {
            return cached;
        }
        if (convo.unreadCount > 0) {
            return {
                kind: 'unread-separator',
            };
        }
        return {
            kind: 'bottom',
        };
    });
    useOnChange(() => {
        const cached = getCachedFocusItem?.(convo.peerId);
        if (cached === undefined) {
            return;
        }
        if (cached.kind === 'unread-separator') {
            setInitialInReadBy(convo.inReadBy);
        }
        setFocusItem(cached);
    }, [getCachedFocusItem], false);
    const [activeAnimations, setActiveAnimations] = useState([]);
    const setActiveAnimationsDebounced = useMemo(() => debounce(setActiveAnimations, 50, true), []);
    useEffect(() => {
        return setActiveAnimationsDebounced.cancel;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [isPinnedBottomCrossed, setPinnedBottomCrossed] = useState(false);
    const { setTrigger: setPinnedBottomTrigger, checkIndent: checkPinnedBottom } = useScrollIndent({
        wrapper,
        margin: PIN_BOTTOM_OFFSET,
        onTriggerCross: useCallback((isCrossed) => {
            setPinnedBottomCrossed(isCrossed);
            virtualizerCore.onPinBottomChanged(isCrossed);
            if (content) {
                onBottomIndentCross?.(isCrossed);
            }
            else {
                // Не хотим рисовать кнопку проскролла внизу, пока content не определен.
                onBottomIndentCross?.(true);
            }
        }, [onBottomIndentCross, content, virtualizerCore]),
    });
    const $wasPinnedBottomBeforeIdle = useRef();
    const [isIdle, setIsIdle] = useState(() => idle.isIdle());
    useEffect(() => idle.subscribe(() => {
        const isIdle = idle.isIdle();
        setIsIdle(isIdle);
        if (isIdle) {
            $wasPinnedBottomBeforeIdle.current = isPinnedBottomCrossed;
            setPinnedBottomCrossed(false);
        }
        else {
            $wasPinnedBottomBeforeIdle.current = undefined;
            checkPinnedBottom();
        }
    }), [idle, checkPinnedBottom, convo, isPinnedBottomCrossed]);
    const lastCmid = History.lastCmid(history);
    const apiRequestCmid = (() => {
        switch (focusItem.kind) {
            case 'unread-separator': {
                return initialInReadBy;
            }
            case 'Normal': {
                return focusItem.cmid;
            }
            case 'Pending':
            case 'bottom': {
                return lastCmid ?? initialInReadBy;
            }
            default:
                exhaustivenessCheck(focusItem);
        }
    })();
    useEffect(() => {
        const onVisibilityChange = () => {
            // Можем сдвинуть границы непрочитанности и не закреплять историю книзу,
            // если пользователь ушел со страницы.
            // Благодаря этому, ему проще будет заметить новые сообщение вернувшись на страницу.
            if (document.visibilityState === 'hidden') {
                setInitialInReadBy(convo.inReadBy);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [convo.inReadBy]);
    const shouldShortPollReactions = Convo.shouldShortPollReactions(convo);
    const historySlice = History.around(history, focusItem.kind === 'unread-separator'
        ? /**
           * Делаем +1, поскольку нас интересует следующее сообщение за последним
           * прочитанным. Сообщение с таким cmid'ом не гарантированно есть в истории,
           * оно может быть удалено, например. Но метод historyAround все равно в
           * этом случае сможет вернуть слайс.
           */
            Message.resolveCmid(apiRequestCmid + 1)
        : apiRequestCmid);
    const isHistoryReady = historySlice !== undefined;
    const { topGap, bottomGap, nodes = [], pendingNodes = [], } = historySlice ?? {};
    const allNodes = useMemoWithCustomCompare(() => [...nodes, ...pendingNodes], [nodes, pendingNodes], isDepsShallowEqual);
    const itemsCount = allNodes.length;
    const allNodesFlow = useMemo(() => Convo.flowHistory(allNodes, initialInReadBy, 
    /**
     * Отображаем табличку: "новые сообщения" перед первым рендеримым сообщением,
     * только в случае, если оно идет сразу после последнего прочитанного.
     */
    topGap?.toCmid === initialInReadBy, isWithoutBubblesTheme), [allNodes, initialInReadBy, isWithoutBubblesTheme, topGap?.toCmid]);
    const $prevUnreadCount = useRef(convo.unreadCount);
    useDidUpdate(function scrollOnReceiveNewMessages() {
        if (isIdle) {
            // Если перешли в idle, но до этого были запиннены книзу, то
            // при появлении новых сообщений будем скроллиться к границе непрочитанных.
            if ($wasPinnedBottomBeforeIdle.current) {
                setInitialInReadBy(convo.inReadBy);
                setFocusItem({ kind: 'unread-separator' });
            }
            $prevUnreadCount.current = convo.unreadCount;
            return;
        }
        if (isPinnedBottomCrossed &&
            $prevUnreadCount.current === 0 &&
            convo.unreadCount > 0) {
            // При запиннености книзу у нас должен быть выбран слайс истории,
            // содержащий последние сообщения.
            const firstUnreadNode = historySlice?.nodes[historySlice.nodes.length - convo.unreadCount];
            if (firstUnreadNode) {
                setFocusItem({
                    kind: 'Normal',
                    cmid: History.nodeCmid(firstUnreadNode),
                    align: 'upper',
                    // Отступ под дату, на случай, если она будет
                    margin: 40,
                });
            }
        }
        $prevUnreadCount.current = convo.unreadCount;
    }, [convo.unreadCount]);
    useCollectChatOpenEvent(historySlice);
    const updateReactions = () => {
        if (!$viewArea.current) {
            return;
        }
        const { upperIndex, bottomIndex } = $viewArea.current;
        const fromNode = allNodes[upperIndex];
        const toNode = allNodes[bottomIndex];
        if (fromNode === undefined || toNode === undefined) {
            return;
        }
        // Все сообщения во viewArea являются pending - некого опрашивать.
        if (fromNode.kind === 'PendingNode') {
            return;
        }
        const fromCmid = History.nodeCmid(fromNode);
        const toCmid = toNode.kind === 'PendingNode' ? lastCmid : History.nodeCmid(toNode);
        if (toCmid === undefined) {
            return;
        }
        dispatch({
            type: 'PollConvoReactions',
            peerId: convo.peerId,
            fromCmid,
            toCmid,
        });
    };
    const $updateReactions = useRef(updateReactions);
    $updateReactions.current = updateReactions;
    // Шорт-полл реакций
    useEffect(() => {
        if (!featureFlags.vkm_reactions) {
            return;
        }
        if (!shouldShortPollReactions) {
            return;
        }
        if (isIdle) {
            return;
        }
        const refreshInterval = typeof featureFlags.vkm_reactions === 'number'
            ? featureFlags.vkm_reactions * 1000
            : REACTIONS_REFRESH_INTERVAL;
        const intervalId = setInterval(
        //  Если просто передать $updateReactions.current, то будет неактуальная функция
        () => $updateReactions.current(), refreshInterval);
        return () => clearInterval(intervalId);
    }, [
        convo.peerId,
        dispatch,
        featureFlags.vkm_reactions,
        isIdle,
        shouldShortPollReactions,
    ]);
    const getNodeByIndex = useCallbackWithCustomCompare((index) => {
        if (index < 0) {
            return;
        }
        const node = allNodes[index];
        if (node === undefined) {
            if (isDev) {
                throw new Error('Convo history node by index not found');
            }
        }
        return node;
    }, [allNodes], isDepsShallowEqual);
    /**
     * На логику определения ключей node'ов завязана логика в
     * функции getFocusItem.
     * @TODO ME-46068 избавиться от связи и сделать randomId ключом для тех
     * сообщений, у которых он есть.
     */
    const getItemKeyForNode = useCallback((node) => {
        switch (node.kind) {
            case 'Node': {
                const message = node.item;
                return message.cmid.toString();
            }
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
                const getUnreadItemKey = () => {
                    const firstUnreadNodeIndex = allNodesFlow.findIndex((nodeFlow) => nodeFlow.kind === 'split' && nodeFlow.atUnread);
                    const firstUnreadNode = allNodes[firstUnreadNodeIndex];
                    if (firstUnreadNode === undefined) {
                        return;
                    }
                    return getItemKeyForNode(firstUnreadNode);
                };
                return {
                    kind: 'Item',
                    options: {
                        align: 'upper',
                        itemKey: getUnreadItemKey() ?? initialInReadBy.toString(),
                        // Покрывает высоту разделителя непрочитанных и даты.
                        margin: 70,
                    },
                };
            }
            case 'bottom': {
                return {
                    kind: 'Bottom',
                };
            }
            case 'Normal':
            case 'Pending': {
                const { align, margin, offset } = focusItem;
                let itemKey;
                if (focusItem.kind === 'Normal') {
                    const { node } = Convo.findHistoryNodeByCmid(convo, focusItem.cmid);
                    itemKey =
                        node !== undefined && node.kind !== 'GapNode'
                            ? getItemKeyForNode(node)
                            : initialInReadBy.toString();
                }
                else {
                    itemKey = focusItem.randomId.toString();
                }
                return {
                    kind: 'Item',
                    options: {
                        itemKey,
                        align,
                        margin,
                        offset,
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
    }, [focusItem, isHistoryReady]);
    const moveFocusToMessage = () => {
        if (scrollPosition.kind === 'Item') {
            return controlHandleRef?.current?.focusByKey([ITEM_KEY_ATTRIBUTE, scrollPosition.options.itemKey], { preventScroll: true });
        }
        if (scrollPosition.kind === 'Bottom') {
            return controlHandleRef?.current?.focusLast(undefined, {
                preventScroll: true,
            });
        }
    };
    const $once = useRef(true);
    useEffect(function moveFocusOnce() {
        const shouldFocusComposer = !COMPOSER_AUTOFOCUS_DISABLED && convo.canWrite.allowed;
        if (shouldFocusComposer || !isHistoryReady) {
            return;
        }
        if (!$once.current) {
            return;
        }
        $once.current = false;
        moveFocusToMessage();
    }, 
    // Вызываем еффект только на первую прогрузку
    // истории при открытии чата.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHistoryReady]);
    useDidUpdate(function moveFocusOnGoToMessage() {
        if (!focusItem.shouldMoveFocus || !isHistoryReady) {
            return;
        }
        moveFocusToMessage();
    }, [focusItem, isHistoryReady]);
    const loadMoreIfNeeded = useCallback((viewArea) => {
        if (viewArea.upperIndex <= PRELOAD_MESSAGES_COUNT && topGap) {
            dispatch({
                type: 'UserScrolledConvoHistory',
                isPostponed,
                peerId: convo.peerId,
                direction: 'backward',
                startCmid: Message.resolveCmid(topGap.toCmid),
                possibleSkipped: topGap.toCmid - topGap.fromCmid + 1,
            });
        }
        if (viewArea.bottomIndex >= itemsCount - PRELOAD_MESSAGES_COUNT - 1 &&
            bottomGap) {
            dispatch({
                type: 'UserScrolledConvoHistory',
                isPostponed,
                peerId: convo.peerId,
                direction: 'forward',
                startCmid: Message.resolveCmid(bottomGap.fromCmid),
                possibleSkipped: bottomGap.toCmid - bottomGap.fromCmid + 1,
            });
        }
    }, [topGap, itemsCount, bottomGap, dispatch, convo.peerId, isPostponed]);
    const animationsContextValue = useMemo(() => ({
        activeAnimations,
        setActiveAnimations: setActiveAnimationsDebounced,
    }), [activeAnimations, setActiveAnimationsDebounced]);
    const checkMessageIsAvailable = useCheckMessageIsAvailable();
    const loadInitialHistory = async () => {
        if (focusItem.kind === 'Normal') {
            if (!(await checkMessageIsAvailable(convo.peerId, focusItem.cmid))) {
                setFocusItem(convo.unreadCount > 0
                    ? { kind: 'unread-separator' }
                    : { kind: 'bottom' });
                return;
            }
        }
        dispatch({
            type: 'UserScrolledConvoHistory',
            isPostponed,
            peerId: convo.peerId,
            direction: 'around',
            startCmid: apiRequestCmid,
        });
    };
    const $handleSeenMessages = useRef(() => { });
    $handleSeenMessages.current = (viewArea) => {
        if (!$viewArea.current) {
            return;
        }
        const { upperIndex, bottomIndex } = viewArea;
        const fromNode = allNodes[upperIndex];
        const toNode = allNodes[bottomIndex];
        if (fromNode === undefined || toNode === undefined) {
            return;
        }
        // Все сообщения во viewArea являются pending
        if (fromNode.kind === 'PendingNode') {
            return;
        }
        const fromCmid = History.nodeCmid(fromNode);
        const toCmid = toNode.kind === 'PendingNode' ? lastCmid : History.nodeCmid(toNode);
        if (toCmid === undefined) {
            return;
        }
        onSeenMessages(fromCmid, toCmid);
    };
    const handleSeenMessages = useMemo(() => featureFlags.vkm_mark_read_without_throttle
        ? (viewArea) => $handleSeenMessages.current(viewArea)
        : throttle((viewArea) => $handleSeenMessages.current(viewArea), 300, true), [featureFlags.vkm_mark_read_without_throttle]);
    const handleLogSeenWallsStats = useCallback((items) => {
        items.forEach((item) => {
            stats.logEvent(getViewPostStatsEvent('im_chat', item.startTime, item.endTime, item.target.trackCode || ''));
            const wall = item.target.attaches.wall;
            if (wall) {
                stats.logEvent(getViewPostStatsEvent('im_chat', item.startTime, item.endTime, wall.trackCode || ''));
            }
        });
    }, [stats]);
    const { handleViewItemsChange } = useSeenHistoryItems({
        onSeenItemsReady: handleLogSeenWallsStats,
    });
    const handleSeenPosts = (viewArea) => {
        // Ищем посты в аттачах
        const inViewWalls = [];
        for (let i = viewArea.upperIndex; i <= viewArea.bottomIndex; i++) {
            const node = getNodeByIndex(i);
            if (node?.kind !== 'Node' || node.item.kind !== 'Normal') {
                continue;
            }
            const wall = node.item.attaches.wall;
            if (!wall || !wall.ownerId || !Channel.isChannelId(wall.ownerId)) {
                continue;
            }
            inViewWalls.push({
                id: `${wall.ownerId}_${wall.id}`,
                target: wall,
            });
        }
        handleViewItemsChange(inViewWalls);
    };
    const handleAreaChange = (viewArea) => {
        const viewAreaItemsCount = viewArea
            ? viewArea.bottomIndex - viewArea.upperIndex
            : 0;
        virtualizerCore.updateConfig({
            ...getVirtualizerConfig(featureFlags, isMobileLayout),
            preloadCount: Math.max(Math.round(viewAreaItemsCount / 2), 1),
        });
        if (!viewArea) {
            $viewArea.current = viewArea;
            return;
        }
        loadMoreIfNeeded(viewArea);
        if (!isIdle) {
            handleSeenMessages(viewArea);
            if (featureFlags.vkm_convo_posts_stats_collect) {
                handleSeenPosts(viewArea);
            }
        }
        $viewArea.current = viewArea;
        // Переключаем запиненные даты
        const upperVisibleNode = getNodeByIndex(viewArea.upperIndex);
        const bottomVisibleNode = getNodeByIndex(viewArea.bottomIndex);
        if (upperVisibleNode) {
            const date = History.nodeSentAt(upperVisibleNode);
            changeActiveDate(getDateDayStart(date));
            if (bottomVisibleNode) {
                onVisibleNodesChange?.({
                    upper: upperVisibleNode,
                    bottom: bottomVisibleNode,
                });
            }
        }
    };
    // Если нужно - загружаем историю чата, в случае если появились гэпы.
    // См. https://jira.mvk.com/browse/ME-47988 .
    useDidUpdate(() => $viewArea.current && loadMoreIfNeeded($viewArea.current), [!!historySlice?.bottomGap, !!historySlice?.topGap]);
    useDidUpdate(() => {
        if (!isIdle && $viewArea.current) {
            handleSeenMessages($viewArea.current);
        }
    }, [convo.unreadReactions, isIdle, allNodes]);
    const getFocusItem = () => {
        const sliceItem = virtualizerCore.getSliceItem();
        if (!sliceItem) {
            return;
        }
        const { itemKey, margin, align } = sliceItem;
        const sliceItemNode = allNodes.find((node) => getItemKeyForNode(node) === itemKey);
        if (!sliceItemNode) {
            return;
        }
        return {
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
        };
    };
    const saveScrollPositionRef = useRef(() => { });
    saveScrollPositionRef.current = () => {
        if (!withScrollSaveOnClose) {
            return;
        }
        const bottomVisibleNode = $viewArea.current && getNodeByIndex($viewArea.current.bottomIndex);
        // Если видимая граница совпадает с границей прочитанности, значит
        // пользователь просто скроллился вниз по истории и позицию скролла сохранять
        // не нужно.
        if (bottomVisibleNode === undefined ||
            bottomVisibleNode?.kind === 'PendingNode' ||
            /**
             * Cmid bottomVisibleNode может быть больше inReadBy если закрыть чат
             * сразу после отправки в него сообщения.
             */
            History.nodeCmid(bottomVisibleNode) >= convo.inReadBy ||
            isPinnedBottomCrossed) {
            setCachedFocusItem?.(convo.peerId, null, false);
            return;
        }
        const focusItem = getFocusItem();
        setCachedFocusItem?.(convo.peerId, focusItem ?? null, false);
    };
    // Нужен именно useLayoutEffect, потому что нужно делать вычисления в DOM
    // в virtualizerCore.getSliceItem.
    // Обязательно не должно быть зависимостей, так как используется ref на функцию.
    // При этом сохранять позицию мы хотим при каждом закрытии чата, это работает за счет
    // атрибута key с id чата у родительского компонента.
    // Если появятся зависимости, то сохранение не будет работать корректно,
    // так как в рефе будут значения от последнего рендера.
    useLayoutEffect(() => () => saveScrollPositionRef.current(), []);
    const { virtualizerState, triggerContentUpdate: updateVirtualizerContent } = useVirtualScroll({
        virtualizerCore,
        wrapper,
        content,
        options: {
            itemsKeys,
            scrollPosition,
            onViewAreaChange: handleAreaChange,
            // Сохранение позиции скролла по низу удобно при открытии истории внизу,
            // в остальных сценариях лучше сохранять позицию сверху.
            anchorAlign: focusItem.kind === 'bottom' ? 'bottom' : 'upper',
            debugLog: window.chatVirtualScrollDebugLog,
        },
    });
    const slice = virtualizerCore.getSliceArea();
    const scrollableProps = useMemo(() => ({
        ref: (el) => {
            setWrapper(el);
            $wrapper.current = el;
        },
    }), []);
    const contentProps = useMemo(() => ({
        className: 'ConvoHistory__scrollbar-content',
    }), []);
    const { ref: contentRef, onFocus, onKeyDown, } = useConvoHistoryKeyboardFocusNavigation({
        bottomGap,
        controlHandleRef,
        isHistoryReady,
        isNavigating,
        topGap,
        wrapperRef: $wrapper,
        onNavigationEnd,
    });
    if (convo.kind === 'GroupConvo' && convo.peerId === owner.id) {
        return null;
    }
    if (History.isEmpty(history)) {
        return (placeholder || (React.createElement(ConvoHistoryPlaceholder, { convo: convo, isThemed: isThemed, text: lang.use('me_convo_history_placeholder'), isCompactView: isCompactView })));
    }
    if (!isHistoryReady) {
        return (React.createElement(OptimizedSpinner, { className: cx('ConvoHistory__loader'), spinnerClassName: cx('ConvoHistory__spinnerInner', {
                'ConvoHistory__spinnerInner--themed': isThemed,
            }), key: apiRequestCmid, intersectionOptions: {
                initialInView: true,
            }, size: "m", onIntersection: loadInitialHistory }));
    }
    const withAntispamCard = convo.convoBanner &&
        convo.convoBanner.cardInfo &&
        featureFlags.vkm_convo_antispam_card;
    return (React.createElement("div", { className: cx('ConvoHistory', {
            'ConvoHistory--compact': isCompactView,
        }) },
        React.createElement(ConvoAudiosPlaylistProvider, { convo: convo },
            React.createElement(ConvoVoicesPlaylistProvider, { convo: convo },
                React.createElement(ConvoVideoMessagesPlaylistProvider, { convo: convo },
                    React.createElement(MessageReactionAnimationProvider, { value: animationsContextValue },
                        React.createElement(ScrollbarProvider, { scrollableProps: scrollableProps, contentProps: contentProps, className: "ConvoHistory__wrapper", overflowX: "hidden" },
                            React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState },
                                React.createElement("div", { className: "ConvoHistory__content", ref: setContent },
                                    isPostponed ? (React.createElement(React.Fragment, null,
                                        React.createElement(HistoryHeader, { hasMore: false }),
                                        React.createElement(HistoryContent, { key: Number(isMainPanelChanging), peer: peer, normalMessageActions: normalMessageActions, nodes: allNodes, entrypoint: entrypoint, nodesFlow: allNodesFlow, getItemKeyForNode: getItemKeyForNode, selected: selected, isCompactView: isCompactView, onSelectMessage: onSelectMessage, onCallbackButtonClick: onCallbackButtonClick, onKeyboardSend: onKeyboardSend, onMessageForward: onMessageForward, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: onOpenMessageInModal, onCloseMessageInModal: onCloseMessageInModal, onOpenForwardedMessageModal: onOpenForwardedMessageModal, onCloseForwardedMessageModal: onCloseForwardedMessageModal, messageReactions: messageReactions, onUnknownReactionClick: onUnknownReactionClick, onOpenReport: onOpenReport, registerStickyDate: registerStickyDate, isWithoutBubblesTheme: isWithoutBubblesTheme, focusItem: focusItem, onMessageSizeChange: updateVirtualizerContent, isThemed: isThemed, isContrastTheme: isContrastTheme, virtualizerSlice: slice, isNavigating: isNavigating, ref: contentRef, onFocus: onFocus, onKeyDown: onKeyDown, openClipCoOwnersModal: openClipCoOwnersModal }))) : (React.createElement(React.Fragment, null,
                                        React.createElement(HistoryHeader, { hasMore: !!topGap },
                                            React.createElement(ConvoHistoryHeaderContent, { convo: convo, peer: peer })),
                                        !topGap &&
                                            withAntispamCard &&
                                            (convo.kind === 'UserConvo' ||
                                                convo.kind === 'MessageRequestUserConvo') && (React.createElement(ConvoHistoryAntispamCard, { className: "ConvoHistory__antispamCard", convo: convo, onInViewChange: toggleAntispamBanner })),
                                        React.createElement(HistoryContent, { key: Number(isMainPanelChanging), peer: peer, normalMessageActions: normalMessageActions, nodes: allNodes, entrypoint: entrypoint, nodesFlow: allNodesFlow, getItemKeyForNode: getItemKeyForNode, selected: selected, isCompactView: isCompactView, onSelectMessage: onSelectMessage, onCallbackButtonClick: onCallbackButtonClick, onKeyboardSend: onKeyboardSend, onMessageForward: onMessageForward, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: onOpenMessageInModal, onCloseMessageInModal: onCloseMessageInModal, onOpenForwardedMessageModal: onOpenForwardedMessageModal, onCloseForwardedMessageModal: onCloseForwardedMessageModal, messageReactions: messageReactions, onUnknownReactionClick: onUnknownReactionClick, onOpenReport: onOpenReport, registerStickyDate: registerStickyDate, isWithoutBubblesTheme: isWithoutBubblesTheme, focusItem: focusItem, onMessageSizeChange: updateVirtualizerContent, isThemed: isThemed, isContrastTheme: isContrastTheme, virtualizerSlice: slice, isNavigating: isNavigating, ref: contentRef, onFocus: onFocus, onKeyDown: onKeyDown, openClipCoOwnersModal: openClipCoOwnersModal }),
                                        React.createElement(HistoryFooter, { isCompactView: isCompactView, convo: convo, isThemed: isThemed, hasMore: !!bottomGap, className: "ConvoHistory__contentFooter" }))),
                                    !bottomGap &&
                                        slice &&
                                        slice.bottomIndex >= itemsCount - 1 && (React.createElement("div", { key: "pinned-bottom-trigger", ref: setPinnedBottomTrigger })))))))))));
});
const HistoryContent = React.memo(forwardRef(function HistoryContent({ peer, selected, normalMessageActions, nodes, nodesFlow, getItemKeyForNode, onSelectMessage, isCompactView, onCallbackButtonClick, onKeyboardSend, onMessageForward, onScrollToMessage, onOpenMessageInModal, onCloseMessageInModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, messageReactions, isWithoutBubblesTheme, onUnknownReactionClick, onOpenReport, entrypoint, registerStickyDate, focusItem, onMessageSizeChange, isThemed, isContrastTheme, virtualizerSlice, isNavigating, onFocus, onKeyDown, openClipCoOwnersModal, }, ref) {
    const owner = useOwner();
    const featureFlags = useFeatureFlags();
    const hasVacationMark = peer?.kind === 'User' &&
        peer.employeeWorkingState &&
        !Peer.isFavorites(peer.id, owner.id);
    const { lang } = useBrowserEnv();
    const history = useHistory({
        ownerId: owner.id,
        nodes,
        nodesFlow,
        getItemKeyForNode,
        selected,
        peer,
        isCompactView,
        onSelectMessage,
        onCallbackButtonClick,
        onKeyboardSend,
        featureFlags,
        isWithoutBubblesTheme,
        onMessageForward,
        registerStickyDate,
        onScrollToMessage,
        onOpenMessageInModal,
        onCloseMessageInModal,
        onOpenForwardedMessageModal,
        onCloseForwardedMessageModal,
        messageReactions,
        onUnknownReactionClick,
        onOpenReport,
        entrypoint,
        normalMessageActions,
        focusItem,
        onMessageSizeChange,
        isThemed,
        isContrastTheme,
        virtualizerSlice,
        isNavigating,
        openClipCoOwnersModal,
    });
    return (React.createElement("div", { ref: ref, role: "list", "aria-label": lang.use('me_aria_messages_list_label'), tabIndex: -1, className: cx('ConvoHistory__flow', {
            'ConvoHistory__flow--withVacationMark': hasVacationMark,
        }), onFocus: onFocus, onKeyDown: onKeyDown }, history));
}));
function useHistory({ nodes, nodesFlow, getItemKeyForNode, ownerId, peer, selected, isCompactView, normalMessageActions, onKeyboardSend, onCallbackButtonClick, onSelectMessage, featureFlags, onMessageForward, registerStickyDate, messageReactions, onScrollToMessage, onOpenMessageInModal, onCloseMessageInModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, isWithoutBubblesTheme, onUnknownReactionClick, onOpenReport, entrypoint, focusItem, onMessageSizeChange, isThemed, isContrastTheme, virtualizerSlice, isNavigating, openClipCoOwnersModal, }) {
    const { lang, analyticsAppName } = useBrowserEnv();
    const { screenRoute: route } = useRouter();
    const { settings, profileType } = useViewer();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const peerId = peer.id;
    const draft = useComposerDraft(peerId);
    const { convoKind } = useSelectConvo(peerId, useCallback((convo) => ({ convoKind: convo.kind }), []));
    const isEdu = Viewer.isEdu(profileType);
    const { animate } = useMessageReactionAnimation();
    const setReaction = useCallback((reactionId, message, source) => {
        if (message.kind !== 'Normal') {
            return;
        }
        if (message.reactionId === reactionId) {
            dispatch({
                type: 'UserUnsetMessageReaction',
                cmid: message.cmid,
                peerId,
            });
        }
        else {
            dispatch({
                type: 'UserSetMessageReaction',
                cmid: message.cmid,
                peerId,
                reactionId,
                analyticsAppName,
                source,
                onFail: () => {
                    snackbar({
                        message: lang.use('me_max_message_reactions_count_error'),
                        autoClose: true,
                        duration: 4000,
                        mode: 'dark',
                    });
                },
            });
            animate(message.cmid, reactionId, true);
        }
    }, [peerId, dispatch, animate, snackbar, lang, analyticsAppName]);
    // Хак для повторного выделения элемента
    const shouldHighlight = useMemo(() => ({
        value: true,
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusItem]);
    /**
     * Возвращаем пустой список, если мы не можем отобразить текущую историю
     */
    const history = [];
    let dateStack = [];
    let stack = [];
    let hasRenderedMessages = false;
    let expiredMemoItems = [];
    for (let index = nodes.length - 1; index >= 0; index--) {
        const node = nodes[index];
        const prevNode = nodes[index - 1];
        const flow = nodesFlow[index];
        if (node === undefined || flow === undefined) {
            continue;
        }
        const hideScrollItemContent = !virtualizerSlice ||
            index < virtualizerSlice.upperIndex ||
            index > virtualizerSlice.bottomIndex;
        hasRenderedMessages = hasRenderedMessages || !hideScrollItemContent;
        const isMessageDeleted = node.kind === 'DeletedNode';
        const message = isMessageDeleted ? node.restorable : node.item;
        const prevMessage = prevNode?.kind === 'Node' ? prevNode.item : undefined;
        const itemKey = getItemKeyForNode(node);
        switch (message.kind) {
            case 'Normal':
            case 'Queued': {
                if (isMessageDeleted) {
                    stack.unshift(React.createElement(VirtualScrollItem, { key: itemKey, itemKey: itemKey, className: "ConvoHistory__item" },
                        React.createElement(ConvoMessageDeleted, { historyNode: node, peerId: peerId, isThemed: isThemed, isNavigating: isNavigating })));
                    break;
                }
                const resendMessageAvailable = message.kind === 'Queued' && message.randomId && message.hasFailed;
                const isSelected = message.kind !== 'Queued' &&
                    !!selected.find(({ cmid }) => cmid === message.cmid);
                const isLinkedWithPrevious = message.kind === 'Normal' &&
                    !!message.linkedCmid &&
                    message.linkedCmid === prevMessage?.cmid;
                const canBeSelected = Message.isMessageNormal(message) &&
                    isMessageCanBeSelected(message, featureFlags);
                const highlighted = ((focusItem.kind === 'Pending' &&
                    message.kind === 'Queued' &&
                    focusItem.randomId === message.randomId) ||
                    (focusItem.kind === 'Normal' &&
                        message.kind === 'Normal' &&
                        focusItem.cmid === message.cmid)) &&
                    focusItem.highlight;
                const searchHighlight = !isMessageDeleted &&
                    message.kind === 'Normal' &&
                    route.kind === 'ConvoRoute' &&
                    route.cmid === message.cmid
                    ? route.search ?? route.highlightQuery
                    : undefined;
                stack.unshift(React.createElement(VirtualScrollItem, { key: itemKey, itemKey: itemKey },
                    React.createElement(ConvoHistoryMessageBlock, { message: message, normalMessageActions: normalMessageActions, entrypoint: entrypoint, selectionExists: !!selected.length, canBeSelected: canBeSelected, peerId: peerId, isDraftHasEditing: !!draft.editing, isHead: flow.kind !== 'continue', isSelected: isSelected, withMessageActions: (featureFlags.me_fc_message_actions &&
                            message.kind === 'Normal') ||
                            resendMessageAvailable, onCallbackButtonClick: onCallbackButtonClick, onKeyboardSend: onKeyboardSend, isCompactView: isCompactView, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: onOpenMessageInModal, onCloseMessageInModal: onCloseMessageInModal, onOpenForwardedMessageModal: onOpenForwardedMessageModal, onCloseForwardedMessageModal: onCloseForwardedMessageModal, onSelectMessage: onSelectMessage, messageReactions: messageReactions, onUnknownReactionClick: onUnknownReactionClick, onOpenReport: onOpenReport, isWithoutBubblesTheme: isWithoutBubblesTheme, onMessageForward: onMessageForward, disableReactionAnimations: !settings.messageReactionAnimation, shouldHighlight: highlighted ? shouldHighlight : undefined, highlightSearchQuery: searchHighlight, onMessageSizeChange: onMessageSizeChange, isThemed: isThemed, isContrastTheme: isContrastTheme, setReaction: setReaction, isNavigating: isNavigating, isLinkedWithPrevious: isLinkedWithPrevious, openClipCoOwnersModal: openClipCoOwnersModal })));
                break;
            }
            case 'Service': {
                if (isMessageDeleted) {
                    break;
                }
                stack.unshift(React.createElement(VirtualScrollItem, { key: itemKey, itemKey: itemKey, className: "ConvoHistory__item" },
                    React.createElement(ServiceMessage, { message: message, isCompact: isCompactView, withBubble: !isWithoutBubblesTheme, isNavigating: isNavigating, onScrollToMessage: onScrollToMessage })));
                break;
            }
            case 'Expired': {
                expiredMemoItems.push(itemKey);
                break;
            }
            default:
                exhaustivenessCheck(message);
        }
        if (flow.kind !== 'continue' || !prevNode) {
            if (expiredMemoItems.length > 0) {
                stack = [
                    React.createElement("div", { key: `expired_${itemKey}`, role: "presentation", "data-stackkey": itemKey, className: cx('ConvoHistory__item', 'ConvoHistory__expiredMessageContainer') },
                        React.createElement(ExpiredMessages, { count: expiredMemoItems.length, isThemed: isThemed, isNavigating: isNavigating }),
                        expiredMemoItems.map((itemKey) => (React.createElement(VirtualScrollItem, { key: itemKey, itemKey: itemKey, className: "ConvoHistory__expiredMessageVirtualItem" })))),
                ];
                expiredMemoItems = [];
            }
            dateStack.unshift(hasRenderedMessages ? (React.createElement(ConvoStack, { key: `stack_${itemKey}`, peerId: message.authorId, withBirthday: isEdu && convoKind === 'ChatConvo', isOut: ownerId === message.authorId, isCentered: message.kind === 'Service' || message.kind === 'Expired', selected: selected, isOneToOneConvo: isOneToOneConvo(convoKind), className: "ConvoHistory__flowStack", isWithoutBubblesTheme: isWithoutBubblesTheme, "aria-setsize": -1 }, stack)) : (React.createElement(React.Fragment, { key: `stack_${itemKey}` }, stack)));
            stack = [];
            hasRenderedMessages = false;
        }
        if ((flow.kind === 'split' && flow.atDate) || !prevNode) {
            const date = getDateDayStart(message.sentAt);
            /**
             1. Так как мы сохраняем зафейленные сообщения между сеансами, то может возникать ситуация, когда есть confirmed
             сообщения "вчера", потом confirmed сообщения "сегодня" и failed сообщения "вчера" (чтобы реакт не сходил с ума
             из-за двух "вчера" разделим их по message.kind)
             2. Если мы на экране отложенных отредачим сообщение, то у него обновится cmid, поэтому key, завязанный на kind
             отломает нам отображение - у нас задублируются сообщения в истории
             */
            const stackKey = message.kind === 'Normal' && message.isPostponed
                ? `${date}-${message.cmid}`
                : `${date}-${message.kind}`;
            history.unshift(React.createElement("div", { key: `dateStackWrapper-${stackKey}`, className: "ConvoHistory__dateStack" },
                React.createElement(StickyDateSeparator, { date: date, registerStickyDate: registerStickyDate, forcedIsVisible: !prevNode, isThemed: isThemed }),
                dateStack));
            dateStack = [];
        }
        if (flow.kind === 'split' && flow.atUnread && peerId !== ownerId) {
            ;
            (prevNode ? dateStack : history).unshift(React.createElement("div", { key: 'unread-separator', role: "heading", "aria-label": lang.use('me_convo_history_new_messages'), "aria-level": 3, className: cx('ConvoHistory__unreadSeparator', {
                    'ConvoHistory__unreadSeparator--themed': isThemed,
                }) }, lang.use('me_convo_history_new_messages')));
        }
    }
    return history;
}
export const HistoryHeader = ({ hasMore, children }) => {
    return (React.createElement("div", { className: "ConvoHistory__contentHeader" },
        children,
        hasMore && (React.createElement("div", { className: "ConvoHistory__spinnerWrapper" },
            React.createElement(OptimizedSpinner, { size: "s", className: cx('ConvoHistory__spinner') })))));
};
const HistoryFooter = ({ convo, hasMore, isCompactView, isThemed, className }) => {
    return (React.createElement("div", { className: cx(className) },
        Peer.isUserPeerId(convo.peerId) && (React.createElement(ConvoHistoryVacationMark, { userId: convo.peerId })),
        hasMore && (React.createElement("div", { className: "ConvoHistory__spinnerWrapper" },
            React.createElement(OptimizedSpinner, { size: "s", className: cx('ConvoHistory__spinner'), spinnerClassName: cx('ConvoHistory__spinnerInner', {
                    'ConvoHistory__spinnerInner--themed': isThemed,
                }) }))),
        React.createElement(ConvoHistoryTyping, { peerId: convo.peerId, isCompactView: isCompactView, isThemed: isThemed, showNames: convo.kind === 'ChatConvo' })));
};
export function isOneToOneConvo(convoKind) {
    switch (convoKind) {
        case 'ContactConvo':
        case 'GroupConvo':
        case 'UserConvo': {
            return true;
        }
        case 'ChatConvo':
        case 'BusinessNotify':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo': {
            return false;
        }
        default:
            exhaustivenessCheck(convoKind);
    }
}
function useConvoHistoryKeyboardFocusNavigation({ bottomGap, controlHandleRef, isHistoryReady, isNavigating, topGap, wrapperRef, onNavigationEnd, }) {
    const disabled = !isHistoryReady || !isNavigating;
    /**
     * Позволяет использовать только сами верхнеуровневые элементы (бабблы) для
     * навигации.
     */
    const getFocusableElements = useCallback((container, key) => {
        const selector = composeVirtualScrollFirstFocusableSelector({
            tabIndex: -1,
            key: key,
        });
        return container.querySelectorAll(selector);
    }, []);
    const getViewport = useCallback(() => wrapperRef.current, [wrapperRef]);
    const onEndEdgeHit = useCallback(() => {
        if (bottomGap)
            return;
        onNavigationEnd?.();
    }, [bottomGap, onNavigationEnd]);
    /**
     * В случае быстрой навигации (например, если кнопка "вверх" зажата), может
     * возникнуть ситуация, когда история не успевает быстро подгрузиться, что
     * может вызвать рефлоу элементов, а это сбрасывает фокус. Для сохранения
     * целостности навигации возвращаем фокус последнему элементу.
     */
    const onUpdate = useCallback((control, container, { findLastFocusElement, moveFocusToElement }) => {
        if (disabled || !controlHandleRef?.current?.isFocused?.())
            return;
        control.autoFocus().catch(noop);
        const element = findLastFocusElement();
        if (!element)
            return;
        moveFocusToElement(element);
    }, [disabled, controlHandleRef]);
    return useVirtualScrollKeyboardFocusNavigation({
        controlHandleRef,
        cycle: false,
        disabled,
        kind: 'list',
        restoreLastFocusOn: 'focusLast',
        viewportAreaOffset: 48,
        getFocusableElements,
        getViewport,
        onEndEdgeHit,
        onUpdate,
    }, [bottomGap, topGap]);
}
//# sourceMappingURL=ConvoHistory.js.map