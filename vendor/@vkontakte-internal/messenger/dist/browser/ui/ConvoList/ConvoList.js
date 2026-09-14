import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, isValidElement, } from 'react';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import * as Convo from '../../../core/model/Convo';
import * as Filters from '../../../core/model/Filters';
import * as Peer from '../../../core/model/Peer';
import * as Organisers from '../../../core/model/Organisers';
import * as Tag from '../../../core/model/Tag';
import * as Viewer from '../../../core/model/Viewer';
import cx from 'classnames';
import { isDepsShallowEqual, useBrowserEnv, useCombinedRefs, useCommunityMessagingWithToggle, useConvo, useDispatch, useFeatureFlags, useHelpHints, useLastSeen, useMemoWithCustomCompare, useOrganisers, useOwner, usePeers, useViewer, } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { EmptyConvoList } from '../../ui/EmptyConvoList/EmptyConvoList';
import { ConvoListItem } from '../../ui/ConvoListItem/ConvoListItem';
import { Icon12Mention, Icon16DropdownFlippedOutline, Icon16DropdownOutline, Icon16Education, Icon20MessageUnreadTopOutline, Icon24ArchiveOutline, Icon24Back, Icon24PhoneAddOutline, Icon24WriteOutline, Icon20UsersOutline, Icon20Users3Outline, Icon20PhoneOutline, } from '@vkontakte/icons';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { useSearchHandlers } from '../../hooks/useSearch';
import { subscribeCharKeysHandler, useGlobalKeyBoardHandlers, useModuleKeyBoardHandlers, } from '../../hooks/useKeyBoardHandlers';
import { useSyncPoppers } from '../../hooks/useSyncPoppers';
import { SearchResultsTab, SearchTabs } from '../../ui/SearchTabs/SearchTabs';
import { ConvoListFilter } from '../../ui/ConvoListFilter/ConvoListFilter';
import './ConvoList.css';
import '../../ui/ChannelsList/ChannelsList.css';
import { ContactList } from '../../ui/ContactList/ContactList';
import { CallMenuAlternative } from '../../ui/CallMenuAlternative/CallMenuAlternative';
import { useConvoClear } from '../../hooks/useConvoClear';
import { useConvoLeave } from '../../hooks/useConvoLeave';
import { useConvoDelete } from '../../hooks/useConvoDelete';
import { ArchiveTopTabs, } from '../../ui/ArchiveTopTabs/ArchiveTopTabs';
import { useRouter } from '../../ui/Router/Router';
import { HorizontalTagList, OrganiserViewHorizontal, } from '../../ui/OrganiserViewHorizontal/OrganiserViewHorizontal';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { CSSTransition } from 'react-transition-group';
import { Search, Badge, Button, Switch, Div } from '@vkontakte/vkui';
import { useConvoDisableBusinessNotify } from '../../hooks/useConvoDisableBusinessNotify';
import { useTagManager } from '../../hooks/useTagManager';
import { ListHeader } from '../../ui/ListHeader/ListHeader';
import { ConvoListLogo } from '../../ui/ConvoListLogo/ConvoListLogo';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { useModal } from '../../hooks/useModal';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { ConnectionIndicator } from '../../ui/ConnectionIndicator/ConnectionIndicator';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { AccountSwitchBanner } from '../../ui/AccountSwitchBanner/AccountSwitchBanner';
import { ChannelsList, useChannelsListItems, } from '../../ui/ChannelsList/ChannelsList';
import { ConversationsBar } from '../../ui/ConversationsBar/ConversationsBar';
import { VirtualizerCore, } from '../../ui/VirtualScroll/VirtualizerCore';
import { ANDROID_STORE_URL, CONVOS_PER_PAGE, EDU_INTEGRATION_BANNER_LIMIT, HUAWEI_STORE_URL, GOTO_APP_STORAGE_KEY, } from '../../../core/config/config';
import { useVirtualScroll } from '../../ui/VirtualScroll/useVirtualScroll';
import { VirtualScrollList } from '../../ui/VirtualScroll/VirtualScrollList';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { OnboardingTooltip } from '../../ui/OnboardingTooltip/OnboardingTooltip';
import { EduIntegrationBanner } from '../../ui/EduIntegrationBanner/EduIntegrationBanner';
import { Avatar } from '../../ui/Avatar/Avatar';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { FormattedPhoneNumber } from '../../ui/FormattedPhoneNumber/FormattedPhoneNumber';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { ManagedGroupsList } from '../../ui/MangedGroupsList/ManagedGroupsList';
import { useVirtualScrollKeyboardFocusNavigation, } from '../../hooks/useVirtualScrollKeyboardFocusNavigation';
import { getKeyCombo } from '../../utils/keyBoardCombos';
import { Icon56LogoVkMeColor, Icon180IllustrationNotificationsSferum, } from '@vkontakte-internal/icons-private';
import { EduContactList } from '../../ui/EduContactList/EduContactList';
import { browser } from '../../utils/misc';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { useUnavailableSchedule } from '../../ui/SettingsSchedule/useUnavailableSchedule';
import { ConvoListTopHint, getTopHintProps, } from '../../ui/ConvoListTopHint/ConvoListTopHint';
import { ChannelsOnboardingBanner } from '../../ui/ChannelsOnboardingBanner/ChannelsOnboardingBanner';
import { IMChannelsList } from '../../ui/Analytics/IMChannelsList';
import { IMBusinessListStats } from '../../ui/Analytics/IMBusinessList';
import { ConvoListFoldersDropdown } from '../../ui/ConvoListFoldersDropdown/ConvoListFoldersDropdown';
import { FeaturesDisabledBanner } from '../../ui/FeaturesDisabledBanner/FeaturesDisabledBanner';
import { Checkbox, EllipsisText, Flex, Link, RichAvatar, } from '@vkontakte-internal/vkcom-kit';
import { OnboardingWrapper } from '../../ui/OnboardingWrapper/OnboardingWrapper';
import { SferumConvoOffboardingBanner } from '../../ui/SferumConvoOffboardingBanner/SferumConvoOffboardingBanner';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
export const CHAT_CREATION_BUTTON_ID = 'chat-creation-menu-trigger';
export const SEPARATOR_MARGIN = 8;
export const INTEGRATION_SEPARATOR_MARGIN = 4;
export const SEPARATOR_HEIGHT = 1;
const PRELOAD_COUNT = CONVOS_PER_PAGE / 10;
const getVirtualizerConfig = (isMobileLayout, featureFlags) => ({
    sliceCount: isMobileLayout ? CONVOS_PER_PAGE * 0.2 : CONVOS_PER_PAGE * 0.4,
    preloadCount: PRELOAD_COUNT,
    throttleDelay: 100,
    trailingThrottleDelay: featureFlags.vkm_virt_scroll_trail_throttle,
    sliceCountIncrement: CONVOS_PER_PAGE / 4,
    sliceByViewAreaRatio: 1.7,
});
const getConvoKey = (peerId) => {
    return `convo_${peerId}`;
};
const getPrecreatedConvoKey = (peerId) => {
    return `precreated_convo_${peerId}`;
};
export const ConvoList = memo(function ConvoList({ dispatch, selectedConvoId, organisers, onboardingTriggers, className, conversationsBar, selectedOrganiser, menu, hasChannelsOnboarding, showChannelsOnboarding, onSelect, toggleContactList, onOrganiserSelect, setHiddenFilterTooltipText, onRejectMR, convoOrganiserToggles, handleFoldersSettingsClick, onOpenChatCreation, onOpenChannelCreation, isOpenContacts, foldersView, canPinMoreConvos, logoVariant, setAccount, managedGroupsCache, setConvoScrollFocusItem, onOpenPhoneJoinModal, convoListSearchInputRef, availableOnboardingTooltips, eduIntegrationBanner, precreatedConvos, isSearching, toggleSearchPanel, controlHandleRef, canPinMoreChannels, closeConvo, organiserOnboardingRenderer, scrollPosition, setScrollPosition, }) {
    const { screenRoute, router, navigate } = useRouter();
    const { vkIntegration, storage, lang, stats, vkcom_me } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { isTwoColumnLayout, isMobileLayout } = useLayoutData();
    const { profileType, settings, viewer, accounts } = useViewer();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const isEdu = Viewer.isEdu(profileType);
    const owner = useOwner();
    const unavailableScheduleData = useUnavailableSchedule(viewer);
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const { onOpen: handleOpenTagManager, tagManagerModal } = useTagManager();
    const { ConvoClearConfirmModal, handleConvoClearAction } = useConvoClear();
    const { ConvoLeaveConfirmModal, handleConvoLeaveAction } = useConvoLeave();
    const { ConvoDeleteConfirmModal, handleConvoDeleteAction } = useConvoDelete();
    const { ConvoDisableBusinessNotifyModal, handleConvoDisableBusinessNotifyAction, } = useConvoDisableBusinessNotify();
    const [virtualizerCore] = useState(() => new VirtualizerCore(getVirtualizerConfig(isMobileLayout, featureFlags)));
    /**
     * Нужен и реф и стейт, содержащие этот элемент.
     * Стейт нужен для виртуалайзера, чтоб обзервер подписывался при его изменении.
     * Реф нужен для манипуляций в эффекте при изменении органайзера, потому что
     * стейт на момент вызова этого эффекта еще не успеет обновиться.
     */
    const scrollableNodeRef = useRef(null);
    const convoListContainerRef = useRef(null);
    const [scrollableNode, setScrollableNode] = useState(null);
    const isChannelsFolderExists = Boolean(organisers.folders.find((folder) => folder.type === 'channels'));
    const isChannelsOrganizer = selectedOrganiser.kind === 'channels';
    const isCommonChatListOpen = !isChannelsOrganizer &&
        selectedOrganiser.item.filter === 'all' &&
        selectedOrganiser.item.kind !== 'folders';
    const isFeaturesDisabledBannerVisible = !!settings.featuresDisabledConvoBannerContent && isMainPanelOpen;
    const [content, setContent] = useState(null);
    const isPrecreatedConvosVisible = isEdu && isCommonChatListOpen && !selectedOrganiser.hasMore;
    const channelsItems = useChannelsListItems({
        isDisabled: !isChannelsOrganizer,
        channelIds: isChannelsOrganizer ? selectedOrganiser.channelIds : [],
        hasMore: selectedOrganiser.hasMore,
        shouldAddInboundRequests: isChannelsOrganizer &&
            !isEdu &&
            featureFlags.vkm_channels_inbound_requests
            ? selectedOrganiser.item.filter === 'all'
            : false,
    });
    /**
     * Вынесли в отдельные переменные, чтобы мемоизация itemsKeys была надежнее.
     */
    const peerIds = isChannelsOrganizer ? [] : selectedOrganiser.peerIds;
    const precreatedPeerIds = isPrecreatedConvosVisible
        ? [...precreatedConvos.peerIds.values()]
        : [];
    const itemsKeys = useMemoWithCustomCompare(() => isChannelsOrganizer
        ? channelsItems.keys
        : [
            /**
             * Важно, чтобы порядок отображения был такой же, как в
             * ConvoListItems .
             */
            ...peerIds.map(getConvoKey),
            ...precreatedPeerIds.map(getPrecreatedConvoKey),
        ], [isChannelsOrganizer, channelsItems.keys, peerIds, precreatedPeerIds], isDepsShallowEqual);
    const $saveScrollPosition = useRef(() => { });
    $saveScrollPosition.current = () => {
        const sliceItem = virtualizerCore.getSliceItem();
        if (sliceItem) {
            setScrollPosition({ kind: 'Item', options: sliceItem });
        }
    };
    // Нужен именно useLayoutEffect, потому что нужно делать вычисления в DOM
    // в virtualizerCore.getSliceItem.
    // Обязательно не должно быть зависимостей, поэтому используется ref на функцию.
    // Если появятся зависимости, то сохранение не будет работать корректно,
    // так как в рефе будут значения от последнего рендера.
    useLayoutEffect(() => () => $saveScrollPosition.current(), []);
    const [isNavigationActive, setIsNavigationActive] = useState(false);
    const sectionRef = useRef(null);
    const getFocusableElements = useCallback(() => {
        return (sectionRef?.current?.querySelectorAll(`[role="listitem"]`) || []);
    }, []);
    const getViewport = useCallback(() => scrollableNode, [scrollableNode]);
    const { ref: navigationRef, onFocus: handleFocus, onKeyDown: menuKeyDown, } = useVirtualScrollKeyboardFocusNavigation({
        controlHandleRef,
        cycle: false,
        kind: 'list',
        restoreLastFocusOn: 'focusFirst',
        skipAutofocusOnEdges: true,
        viewportAreaOffset: 20,
        getFocusableElements,
        getViewport,
    });
    const menuContainerRef = useCombinedRefs(sectionRef, navigationRef);
    const handleKeyDown = (event) => {
        const keyCombo = getKeyCombo(event);
        if (!keyCombo)
            return;
        const { code } = keyCombo;
        if (code === 'Escape') {
            setIsNavigationActive(false);
        }
        if (code === 'Tab' && !isNavigationActive) {
            setIsNavigationActive(true);
        }
        menuKeyDown(event);
    };
    // TODO: выпилить, когда в ConvoListItem будет использоваться один компонент actionButton
    useEffect(() => {
        const disableNavigation = () => setIsNavigationActive(false);
        if (isNavigationActive) {
            document.addEventListener('mousemove', disableNavigation);
        }
        else {
            document.removeEventListener('mousemove', disableNavigation);
        }
        return () => {
            document.removeEventListener('mousemove', disableNavigation);
        };
    }, [isNavigationActive]);
    const handleAreaChange = (viewArea) => {
        if (viewArea &&
            viewArea.bottomIndex >= itemsKeys.length - PRELOAD_COUNT - 1 &&
            selectedOrganiser.hasMore) {
            if (isChannelsOrganizer) {
                return dispatch({
                    type: 'MoreChannelsNeeded',
                    organiser: selectedOrganiser.item,
                });
            }
            dispatch({
                type: 'MoreConvosNeeded',
                organiser: selectedOrganiser.item,
            });
        }
    };
    const { virtualizerState } = useVirtualScroll({
        virtualizerCore,
        wrapper: scrollableNode,
        content,
        options: {
            scrollPosition,
            itemsKeys,
            onViewAreaChange: handleAreaChange,
            anchorAlign: 'scrollTop',
        },
    });
    const activeMode = getActiveMode(isSearching, isOpenContacts);
    const isOrganizerWithControls = getIsOrganizerWithControls(activeMode, selectedOrganiser);
    const hasUnreadFolder = Boolean(organisers.folders.find((folder) => folder.type === 'unread'));
    const withFolders = hasFolders(owner, organisers.folders) &&
        isOrganizerWithControls &&
        (!isVerticalFoldersView(settings, isTwoColumnLayout, foldersView) ||
            featureFlags.vkm_prds);
    const filterKind = activeMode === 'organizer' &&
        (selectedOrganiser.item.kind === 'filters' ||
            selectedOrganiser.item.kind === 'channelFilters');
    const isMessageRequestFilter = filterKind && selectedOrganiser.item.filter === 'messageRequest';
    const isAllUnreadFilter = filterKind && selectedOrganiser.item.filter === 'unread';
    const isArchiveFilter = filterKind && selectedOrganiser.item.filter === 'archive';
    const isBusinessNotifyFilter = filterKind && selectedOrganiser.item.filter === 'businessNotify';
    const isAdTagFilter = filterKind && selectedOrganiser.item.filter === 'adTag';
    const isImportantFilter = filterKind && selectedOrganiser.item.filter === 'important';
    const isUnansweredFilter = filterKind && selectedOrganiser.item.filter === 'unanswered';
    const isBusinessFolder = selectedOrganiser.item.kind === 'folders' &&
        selectedOrganiser.item.type === 'business';
    const isTopFilterVisible = Filters.isVisible(organisers.filters.messageRequest) ||
        Filters.isVisible(organisers.filters.businessNotify);
    const eduBannerConvosCount = isChannelsOrganizer
        ? 0
        : selectedOrganiser.peerIds.length + precreatedConvos.peerIds.size;
    const [gotoAppLCValue, setGotoAppLCValue] = useState(storage.get(GOTO_APP_STORAGE_KEY));
    const needToShowGotoApp = !gotoAppLCValue && browser.android && featureFlags.vkm_mobile_app_banner;
    const setGotoAppFalsy = () => {
        setGotoAppLCValue('true');
        storage.set(GOTO_APP_STORAGE_KEY, 'true');
        stats.logEvent({
            type: 'hide_backend',
            banner_name: 'web_to_app',
        });
    };
    const setGotoAppIntent = () => {
        const link = document.createElement('a');
        link.href = `intent://open/#Intent;scheme=vkme://;S.browser_fallback_url=${/huawei/i.test(navigator.userAgent) ? HUAWEI_STORE_URL : ANDROID_STORE_URL};end`;
        link.onerror = function () {
            // Если приложения нет, то сюда попадаем
            if (/huawei/i.test(navigator.userAgent)) {
                window.location.href = HUAWEI_STORE_URL;
            }
            if (/Android/i.test(navigator.userAgent)) {
                window.location.href = ANDROID_STORE_URL;
            }
        };
        document.body.appendChild(link);
        setGotoAppLCValue('true');
        storage.set(GOTO_APP_STORAGE_KEY, 'true');
        link.click();
    };
    const { query, onChange, onKeyDown, onFocus, onBlur, reset, setNavigationParams, setQuery, } = useSearchHandlers(convoListSearchInputRef);
    const handleTagsOrganiserSelect = useCallback((item) => {
        if (item.kind === 'tags') {
            setQuery('');
        }
        onOrganiserSelect(item);
    }, [onOrganiserSelect, setQuery]);
    const { subscribeGlobalKeyDown } = useGlobalKeyBoardHandlers();
    const focusSearchInput = useCallback(() => {
        convoListSearchInputRef.current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const toggleSearchPanelWithSearchReset = useCallback((value) => {
        if (!value) {
            reset();
        }
        toggleSearchPanel(value);
    }, [toggleSearchPanel, reset]);
    /**
     * При нажатии скроллящих клавиш, если фокус ушел со скроллящегося контента
     * списка чатов, то возвращаем его туда для корректной работы этих клавиш.
     * Для стрелочной навигации делаем оптимистичную обработку, для дефолтных
     * браузерных клавиш возвращаем фокус и дальше браузер делает свою
     * работу сам.
     */
    const handleScrollKeyCombos = useCallback((keyCombo) => {
        if (!keyCombo || controlHandleRef?.current?.isFocused?.()) {
            return;
        }
        const defaultScrollingKeyCombos = [
            'PageUp',
            'Mod+ArrowUp',
            'PageDown',
            'Mod+ArrowDown',
        ];
        if (keyCombo === 'ArrowUp') {
            controlHandleRef?.current?.focusPrev();
            return;
        }
        if (keyCombo === 'ArrowDown') {
            controlHandleRef?.current?.focusNext();
            return;
        }
        if (defaultScrollingKeyCombos.includes(keyCombo)) {
            controlHandleRef?.current?.autoFocus({ preventScroll: true });
        }
    }, [controlHandleRef]);
    const onKeyDownHandler = useCallback((keyCombo, event) => {
        if (keyCombo === 'Escape') {
            toggleSearchPanelWithSearchReset(false);
            if (!isSearching) {
                closeConvo();
            }
        }
        onKeyDown(event);
        handleScrollKeyCombos(keyCombo, event);
    }, [
        onKeyDown,
        handleScrollKeyCombos,
        toggleSearchPanelWithSearchReset,
        isSearching,
        closeConvo,
    ]);
    const { subscribeKeyDown } = useModuleKeyBoardHandlers({
        moduleName: 'ConvoList',
        handlerElementRef: convoListContainerRef,
    });
    useEffect(() => subscribeKeyDown(onKeyDownHandler), [onKeyDownHandler, subscribeKeyDown]);
    useEffect(() => {
        return subscribeGlobalKeyDown('Mod+Shift+F', {
            handler: focusSearchInput,
        });
    }, [subscribeGlobalKeyDown, focusSearchInput]);
    useEffect(() => {
        /**
         * Если открыта история чата или канал, то скорее всего на странице есть композер,
         * и он подписан на subscribeCharKeysHandler
         */
        if (screenRoute.kind === 'ConvoRoute' ||
            screenRoute.kind === 'ChannelRoute') {
            return;
        }
        return subscribeCharKeysHandler((event) => {
            event.stopPropagation();
            event.preventDefault();
            focusSearchInput();
            setQuery(query + event.key);
        });
    }, [focusSearchInput, query, screenRoute, setQuery]);
    useEffect(() => {
        if (query) {
            toggleSearchPanelWithSearchReset(true);
        }
    }, [query, toggleSearchPanelWithSearchReset]);
    useEffect(() => {
        const isFolders = selectedOrganiser.item.kind === 'folders'; // Любые папки помимо "Все"
        const isAllReadOrUnread = selectedOrganiser.item.kind === 'filters' &&
            (selectedOrganiser.item.filter === 'all' ||
                selectedOrganiser.item.filter === 'unread'); // Папки "Все" (прочитанные/непрочитанные)
        if (isFolders || isAllReadOrUnread) {
            toggleSearchPanelWithSearchReset(false);
        }
    }, [selectedOrganiser.item, toggleSearchPanelWithSearchReset]);
    useEffect(() => {
        if (needToShowGotoApp) {
            stats.logEvent({
                type: 'view',
                banner_name: 'web_to_app',
            });
        }
    }, [needToShowGotoApp, stats]);
    const handleConvoClick = useCallback((peerId, openInNewTab) => {
        if (isChannelsOrganizer) {
            return;
        }
        let entrypoint;
        switch (selectedOrganiser.item.kind) {
            case 'filters':
                switch (selectedOrganiser.item.filter) {
                    case 'all':
                        entrypoint = 'list_all';
                        break;
                    case 'unread':
                        entrypoint = 'list_unread';
                        break;
                    case 'archive':
                        entrypoint = 'list_archive';
                        break;
                    case 'messageRequest':
                        entrypoint = 'list_mr';
                        break;
                    case 'businessNotify':
                        entrypoint = 'list_business_notify';
                        break;
                    case 'chats':
                        entrypoint = 'convo_invite';
                        break;
                    case 'adTag':
                        entrypoint = 'list_ad_tag';
                        break;
                    case 'important':
                        entrypoint = 'list_important';
                        break;
                    case 'unanswered':
                        entrypoint = 'list_unrespond';
                        break;
                    default:
                        exhaustivenessCheck(selectedOrganiser.item);
                }
                break;
            case 'folders':
                entrypoint = 'list_folder';
                if (isBusinessFolder) {
                    entrypoint = 'business_chats';
                }
                break;
            case 'tags':
                entrypoint = 'custom_tag';
                break;
            default:
                exhaustivenessCheck(selectedOrganiser.item);
        }
        if (openInNewTab) {
            const url = router.toUrl({
                kind: 'ConvoRoute',
                peerId: peerId,
                entrypoint,
            });
            window.open(url);
        }
        else {
            onSelect({ peerId, entrypoint });
        }
    }, [
        isChannelsOrganizer,
        selectedOrganiser.item,
        isBusinessFolder,
        router,
        onSelect,
    ]);
    const pinDialogErrorModal = useModal();
    const handlePinConvo = useCallback((peerId) => {
        if (canPinMoreConvos) {
            dispatch({
                type: 'UserChangedConvo',
                peerId,
                userAction: 'pin',
            });
        }
        else {
            pinDialogErrorModal.open();
        }
    }, [canPinMoreConvos, dispatch, pinDialogErrorModal]);
    const scrollableProps = useMemo(() => ({
        ref: (node) => {
            scrollableNodeRef.current = node;
            setScrollableNode(node);
        },
        className: 'ConvoList__itemsWrapper',
        tabIndex: -1,
    }), []);
    const contentProps = useMemo(() => ({
        ref: setContent,
        className: 'ConvoList__scrollbar-content',
    }), []);
    const renderTopFilters = () => {
        return (React.createElement("nav", { className: "ConvoList__topFiltersWrap" },
            React.createElement(ConvoListTopFilters, { selectedFilterKind: selectedOrganiser.item.filter, onSelect: (filter) => onOrganiserSelect({ kind: 'filters', filter }), convoOrganisers: organisers, onFilterHideMap: onFilterHideMap })));
    };
    /**
     * Функция, которая собирает список чатов для отображения в левой колонке приложения
     *
     * На данный момент ожидаемое продуктовое поведение:
     * 1. Показываем список основных чатов
     * 2. Показываем список автоматически созданных чатов из других чатов (см. https://jira.mvk.com/browse/ME-54309)
     *
     * Оба списка должны обновляться в режиме реального времени, и могут быть очень большие, поэтому нужна
     * виртуализация обоих списков, но поскольку нормально совместить два виртуальных списка нельзя (ограничения
     * связанные с разметкой и навигацией по левой колонке), то наполняем один виртуальный список разделяя типы
     * строк для отображения.
     */
    const renderListContent = () => {
        if (isChannelsOrganizer) {
            return (React.createElement(IMChannelsList, { onEvent: stats.logEvent },
                React.createElement(ChannelsList, { ...channelsItems, hasMore: selectedOrganiser.hasMore, selectedOrganiser: selectedOrganiser.item, canPinMoreChannels: canPinMoreChannels })));
        }
        if (selectedOrganiser.item.kind === 'folders' &&
            selectedOrganiser.item.type === 'managed_groups') {
            return (React.createElement(ManagedGroupsList, { selectedOrganiser: selectedOrganiser.item, managedGroupsCache: managedGroupsCache, onOrganiserChange: onOrganiserSelect }));
        }
        const convoItems = (React.createElement(ConvoListItems, { peerIds: peerIds, precreatedPeerIds: precreatedPeerIds, isEdu: isEdu, isCommonChatListOpen: isCommonChatListOpen, eduBannerConvosCount: eduBannerConvosCount, eduIntegrationBanner: eduIntegrationBanner, setConvoScrollFocusItem: setConvoScrollFocusItem, selectedOrganiser: selectedOrganiser, hasMorePrecreatedConvos: precreatedConvos.hasMore, isMainPanelOpen: isMainPanelOpen, organisers: organisers, selectedConvoId: selectedConvoId, isPrecreatedConvosVisible: isPrecreatedConvosVisible, isNavigationActive: isNavigationActive, onOpenChatCreation: onOpenChatCreation, onOrganiserSelect: onOrganiserSelect, handleConvoClick: handleConvoClick, handleContextMenuAction: handleContextMenuAction, handleRejectMRAction: onRejectMR }));
        if (isBusinessFolder) {
            return React.createElement(IMBusinessListStats, null, convoItems);
        }
        return convoItems;
    };
    const showBusinessNotifyOnHideTooltip = () => {
        const shown = storage.get('business-notify-on-hide-tooltip-show');
        if (shown) {
            return;
        }
        setHiddenFilterTooltipText(lang.use('me_business_notify_location_on_hide'));
        storage.set('business-notify-on-hide-tooltip-show', true);
    };
    const onFilterHideMap = {
        businessNotify: showBusinessNotifyOnHideTooltip,
    };
    const renderBeforeTitleElement = () => {
        let onBack = null;
        if (activeMode === 'contacts') {
            onBack = () => {
                toggleContactList(false);
            };
        }
        if (activeMode === 'search') {
            onBack = () => {
                toggleSearchPanelWithSearchReset(false);
                focusSearchInput();
            };
        }
        if (isArchiveFilter || isBusinessNotifyFilter || isMessageRequestFilter) {
            onBack = () => {
                onOrganiserSelect({
                    kind: 'filters',
                    filter: 'all',
                });
            };
        }
        if (onBack) {
            return (React.createElement("button", { className: "vkmListHeader__button", onClick: onBack, "aria-label": lang.use('me_back') },
                React.createElement(Icon24Back, null)));
        }
        if (vkcom_me?.hideBurgerForGim && isCommunityMessaging)
            return;
        return featureFlags.vkm_prds && owner.kind !== 'Group' ? null : (React.createElement("div", { className: "ConvoList__burger" }, menu));
    };
    const renderTitle = () => {
        if (activeMode === 'contacts') {
            return React.createElement("h1", null, lang.use('me_contacts_title'));
        }
        if (activeMode === 'search') {
            return (React.createElement("div", { className: "ConvoList__searchHeader" },
                isCommunityMessaging && !isEdu && (React.createElement(RichAvatar, { src: owner.photo?.photo50, size: 24 })),
                isCommunityMessaging && !isEdu ? (React.createElement("div", null,
                    React.createElement("h1", null, lang.use('me_search_community')),
                    React.createElement(ConnectionIndicator, null))) : (React.createElement("h1", null, lang.use('me_search')))));
        }
        if (isArchiveFilter) {
            return React.createElement("h1", null, lang.use('me_aside_toolbar_archive_title'));
        }
        if (isBusinessNotifyFilter) {
            return React.createElement("h1", null, lang.use('me_aside_toolbar_business_notify_title'));
        }
        if (!isCommunityMessaging &&
            (isAllUnreadFilter ||
                (activeMode === 'organizer' &&
                    selectedOrganiser.item.kind === 'folders' &&
                    selectedOrganiser.item.filter === 'unread'))) {
            return React.createElement("h1", null, lang.use('me_unread_convos_title'));
        }
        if (isMessageRequestFilter) {
            return React.createElement("h1", null, lang.use('me_convo_list_folder_message_request'));
        }
        // Форсированно условие kind==='Group' для типизации Peer.Group, чтобы обратиться к свойству name
        if (isCommunityMessaging && owner.kind === 'Group' && !isEdu) {
            return (React.createElement("h1", { className: "ConvoList__headerGroup" },
                React.createElement(RichAvatar, { src: owner.photo?.photo50, size: 24 }),
                React.createElement("div", { className: "ConvoList__headerGroupName" },
                    vkcom_me?.hideBurgerForGim ? (React.createElement(Link, { noUnderline: true, mode: "primary", href: `/club${Peer.toRealId(owner.id)}` }, owner.name)) : (React.createElement("h1", null, owner.name)),
                    React.createElement(ConnectionIndicator, null))));
        }
        if (isAdTagFilter) {
            return React.createElement("h1", null, lang.use('me_convo_list_folder_ad_tag'));
        }
        if (isImportantFilter) {
            return React.createElement("h1", null, lang.use('me_convo_list_folder_important'));
        }
        if (isUnansweredFilter) {
            return React.createElement("h1", null, lang.use('me_convo_list_folder_unanswered'));
        }
        switch (logoVariant) {
            case 'vkme':
                return Viewer.isEdu(profileType) ? (React.createElement("div", { className: "ConvoList__headerSferumLogo" },
                    React.createElement(SferumLogo, null),
                    viewer.isVerified && (React.createElement(Icon16Education, { className: "ConvoList__headerSferumLogoIcon" })))) : (React.createElement(ConvoListLogo, null));
            default:
                return React.createElement("h1", null, lang.use('me_convo_list_title'));
        }
    };
    const topMenuArchive = useMemo(() => ({
        hasMentions: organisers.filters.archive.hasMentions,
        showOnboarding: onboardingTriggers.userArchivedChat,
        onClick: () => {
            onOrganiserSelect({
                kind: isChannelsOrganizer ? 'channelFilters' : 'filters',
                filter: 'archive',
            });
        },
    }), [
        onOrganiserSelect,
        onboardingTriggers.userArchivedChat,
        organisers.filters.archive.hasMentions,
        isChannelsOrganizer,
    ]);
    const renderAfterTitleElement = () => {
        if (activeMode === 'search' ||
            activeMode === 'contacts' ||
            isMessageRequestFilter ||
            isArchiveFilter ||
            isBusinessNotifyFilter ||
            owner.kind === 'Group') {
            return null;
        }
        return (React.createElement(ConvoListTopMenu, { archive: topMenuArchive, openChatCreationPanel: onOpenChatCreation, openChannelCreationPanel: onOpenChannelCreation, openPhoneJoinModal: onOpenPhoneJoinModal, availableOnboardingTooltips: availableOnboardingTooltips }));
    };
    const renderHeader = () => {
        // если аккаунт учебный, если мы имеем хоть одну роль (учитель, сотрудник, администратор) и включен режим недоступности
        const isEduScheduleEnabled = isEdu &&
            owner.kind === 'User' &&
            Peer.hasEduOrganizationalRoles(viewer) &&
            unavailableScheduleData.enable;
        const openScheduleSettings = () => {
            stats.logEvent({
                type: 'type_navgo',
                type_navgo: {
                    subtype: 'go',
                    screen: 'im',
                    screen_to: 'im_settings_do_not_disturb',
                },
            });
            navigate({
                kind: 'SettingsRoute',
                section: 'schedule',
            });
        };
        const withSearchInput = activeMode === 'search' || isOrganizerWithControls;
        const searchInput = (React.createElement(CSSTransition, { in: withSearchInput && isMainPanelOpen, timeout: 300, classNames: "ConvoList__search--slide", mountOnEnter: true, unmountOnExit: true },
            React.createElement(Search, { className: cx('ConvoList__search', {
                    'ConvoList__search--scheduleOn': isEduScheduleEnabled,
                }), value: query, onChange: onChange, onFocus: onFocus, onBlur: onBlur, onClick: () => toggleSearchPanelWithSearchReset(true), onKeyDown: onElementKeyDownFactory((keyCombo, event) => {
                    /**
                     * Если поле ввода в фокусе, но поиск не открыт,
                     * то пользователь навигируется фокусом, в таком
                     * случае поиск у него откроется через начало ввода
                     * запроса или по нажатию на Enter.
                     */
                    if (keyCombo !== 'Enter' || isSearching) {
                        return;
                    }
                    event.stopPropagation();
                    event.preventDefault();
                    toggleSearchPanelWithSearchReset(true);
                }), getRef: convoListSearchInputRef, "aria-label": lang.use('me_search_input_label'), placeholder: lang.use('me_convo_list_search_placeholder') })));
        const topHintProps = getTopHintProps(selectedOrganiser.item, lang, storage, settings, isEdu, featureFlags.vkm_channel_name_to_community);
        return (React.createElement("div", { className: cx('ConvoList__headerContent', {
                'ConvoList__headerContent--scheduleOn': isEduScheduleEnabled,
            }) },
            React.createElement(ListHeader, { before: renderBeforeTitleElement(), title: React.createElement(React.Fragment, null,
                    renderTitle(),
                    !isCommunityMessaging && React.createElement(ConnectionIndicator, null)), after: isMainPanelOpen && renderAfterTitleElement() }),
            React.createElement("div", null,
                React.createElement(Flex, { align: "center", noWrap: true },
                    searchInput,
                    isCommunityMessaging && !organisers.tags.isUnavailable && (React.createElement(TagsMenu, { className: "ConvoList__tags-menu", onOpenTagManager: handleOpenTagManager, onSelectOrganiser: handleTagsOrganiserSelect, selectedOrganiser: selectedOrganiser })))),
            isEduScheduleEnabled && (React.createElement(Div, null,
                React.createElement("div", { className: "ConvoList__headerText" }, lang.use('me_convo_list_schedule_unavailability_text', {
                    values: {
                        day: unavailableScheduleData.day,
                        time: unavailableScheduleData.time,
                    },
                })),
                React.createElement(Button, { mode: "link", size: "s", onClick: openScheduleSettings }, lang.use('me_convo_list_schedule_setting_button')),
                React.createElement("div", { className: "ConvoList__bell" },
                    React.createElement(Icon180IllustrationNotificationsSferum, null)))),
            isArchiveFilter && (React.createElement("div", null,
                React.createElement(ArchiveTopTabs, { isChannelsFolderExists: isChannelsFolderExists, tab: selectedOrganiser.item.kind === 'channelFilters'
                        ? 'channels'
                        : 'convos', onArchiveTabClick: (tab) => {
                        switch (tab) {
                            case 'channels': {
                                return onOrganiserSelect({
                                    kind: 'channelFilters',
                                    filter: 'archive',
                                });
                            }
                            case 'convos': {
                                return onOrganiserSelect({
                                    kind: 'filters',
                                    filter: 'archive',
                                });
                            }
                            default:
                                exhaustivenessCheck(tab);
                        }
                    } }))),
            hasChannelsOnboarding && (React.createElement(ChannelsOnboardingBanner, { onClick: showChannelsOnboarding, className: "ChannelsList__onboardingBanner" })),
            topHintProps !== null && React.createElement(ConvoListTopHint, { ...topHintProps })));
    };
    const bannerSwitchAccount = settings.eduAccountSwitchBanner &&
        isMainPanelOpen &&
        getBannerSwitchAccount(accounts, viewer, profileType, selectedOrganiser, activeMode);
    const hasOrganiserOnboarding = typeof organiserOnboardingRenderer === 'function';
    const onBannerSwitchAccount = () => {
        if (!bannerSwitchAccount) {
            return;
        }
        const peerId = bannerSwitchAccount.id;
        if (!Peer.isUserPeerId(peerId)) {
            return;
        }
        setAccount(peerId);
    };
    const handleContextMenuAction = useCallback((action, convo) => {
        switch (action) {
            case 'clear':
                handleConvoClearAction?.(convo);
                break;
            case 'configure_tags':
                handleOpenTagManager(convo.peerId);
                break;
            case 'leave':
                handleConvoLeaveAction?.(convo.peerId);
                break;
            case 'pin':
                handlePinConvo?.(convo.peerId);
                break;
            case 'business_notify_disable':
                handleConvoDisableBusinessNotifyAction?.(convo);
                break;
            case 'delete':
                handleConvoDeleteAction(convo.peerId);
                break;
            default:
                break;
        }
    }, [
        handleConvoClearAction,
        handleConvoDeleteAction,
        handleConvoDisableBusinessNotifyAction,
        handleConvoLeaveAction,
        handleOpenTagManager,
        handlePinConvo,
    ]);
    const renderScrollableContent = () => {
        switch (activeMode) {
            case 'search': {
                return (React.createElement(SearchTabs, { query: query, openConvo: onSelect, setNavigationParams: setNavigationParams, changeQueryForced: setQuery, selectedConvoId: selectedConvoId, handleContextMenuAction: handleContextMenuAction, handleRejectMRAction: onRejectMR, toggleSearchPanel: toggleSearchPanelWithSearchReset, initialTab: isChannelsOrganizer
                        ? SearchResultsTab.Channels
                        : SearchResultsTab.Convos }));
            }
            case 'contacts': {
                if (isEdu) {
                    return (React.createElement(EduContactList, { onSelect: (peerId) => onSelect({ peerId, entrypoint: 'contacts_list' }), goBack: () => onOrganiserSelect({ kind: 'filters', filter: 'all' }) }));
                }
                return (React.createElement(ContactList, { onSelect: (peerId) => onSelect({ peerId, entrypoint: 'contacts_list' }), goBack: () => onOrganiserSelect({ kind: 'filters', filter: 'all' }) }));
            }
            case 'organizer': {
                return (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "ConvoList__top" },
                        isOrganizerWithControls &&
                            isTopFilterVisible &&
                            owner.kind !== 'Group' &&
                            isMainPanelOpen &&
                            renderTopFilters(),
                        isCommunityMessaging && !isEdu ? (React.createElement(React.Fragment, null, (isTwoColumnLayout || vkcom_me?.showCommunityFilters) && (React.createElement(ConvoListCommunityMessagingFilters, { items: convoOrganiserToggles, onSelectOrganiser: onOrganiserSelect, selectedOrganiser: selectedOrganiser })))) : (React.createElement(ConvoListFolders, { isHidden: !withFolders, items: convoOrganiserToggles, onClickSettings: handleFoldersSettingsClick, onSelectOrganiser: onOrganiserSelect, selectedOrganiser: selectedOrganiser })),
                        isCommunityMessaging && (React.createElement(CSSTransition, { classNames: "ConvoList__tags--slide", in: selectedOrganiser.item.kind === 'tags' &&
                                !!selectedOrganiser.item.mask, mountOnEnter: true, timeout: 300, unmountOnExit: true },
                            React.createElement(Flex, { align: "center", className: "ConvoList__tags-wrapper" },
                                React.createElement(HorizontalTagList, { onSelectOrganiser: onOrganiserSelect, selectedOrganiser: selectedOrganiser }))))),
                    React.createElement("div", { className: "ConvoList__items" },
                        React.createElement(ScrollbarProvider, { scrollableProps: scrollableProps, contentProps: contentProps, overflowX: "hidden" },
                            React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState },
                                isFeaturesDisabledBannerVisible && (React.createElement(FeaturesDisabledBanner, { bannerInfo: settings.featuresDisabledConvoBannerContent, className: "ConvoList__convoBanner" })),
                                bannerSwitchAccount && (React.createElement(AccountSwitchBanner, { className: "ConvoList__convoBanner", account: bannerSwitchAccount, onSwitch: onBannerSwitchAccount })),
                                isEdu &&
                                    isMainPanelOpen &&
                                    featureFlags.vkm_edu_offboarding && (React.createElement(SferumConvoOffboardingBanner, { className: "ConvoList__convoBanner" })),
                                isEdu &&
                                    isCommonChatListOpen &&
                                    eduBannerConvosCount > EDU_INTEGRATION_BANNER_LIMIT && (React.createElement("div", { className: "ConvoList__eduIntegrationBanner" },
                                    React.createElement(EduIntegrationBanner, { banner: eduIntegrationBanner }))),
                                hasOrganiserOnboarding && (React.createElement(ConvoListOrganiserOnboarding, { isSelectedOrganiserLoading: selectedOrganiser.hasMore &&
                                        (isChannelsOrganizer
                                            ? !channelsItems.channelsList.length
                                            : !peerIds.length), selectedOrganiser: selectedOrganiser, render: organiserOnboardingRenderer })),
                                React.createElement("section", { id: Organisers.getId(selectedOrganiser.item), className: "ConvoList__organiserSection", role: "list", ref: menuContainerRef, onFocus: handleFocus, onKeyDown: handleKeyDown }, renderListContent()))))));
            }
            default: {
                return null;
            }
        }
    };
    return (React.createElement("section", { style: {
            '--separator-height': `${SEPARATOR_HEIGHT}px`,
            '--separator-margin': `${vkIntegration ? INTEGRATION_SEPARATOR_MARGIN : SEPARATOR_MARGIN}px`,
        }, className: cx('ConvoList', className, {
            'ConvoList--collapsed': !isMainPanelOpen,
        }), "data-testid": "me_convo_list", ref: convoListContainerRef, tabIndex: -1, onKeyDown: onElementKeyDownFactory(onKeyDownHandler) },
        React.createElement("div", { className: "ConvoList__header" }, renderHeader()),
        conversationsBar &&
            selectedOrganiser.item.filter === 'all' &&
            selectedOrganiser.item.kind === 'filters' && (React.createElement(ConversationsBar, { className: "ConvoList__conversationsBar", conversationBar: conversationsBar })),
        renderScrollableContent(),
        isOrganizerWithControls &&
            !isCommunityMessaging &&
            selectedOrganiser.item.kind !== 'tags' &&
            !hasUnreadFolder && (React.createElement(ConvoListFooter, { selectedOrganiser: selectedOrganiser.item, onOrganiserChange: onOrganiserSelect })),
        ConvoClearConfirmModal,
        ConvoLeaveConfirmModal,
        ConvoDeleteConfirmModal,
        ConvoDisableBusinessNotifyModal,
        pinDialogErrorModal.isActive && (React.createElement(ModalDialog, { title: lang.use('me_error_title'), content: lang.use('me_too_many_conversation_pinned_error'), closeLabel: lang.use('me_close'), onClose: pinDialogErrorModal.close, buttons: React.createElement(Button, { onClick: pinDialogErrorModal.close }, lang.use('me_close')) })),
        tagManagerModal,
        needToShowGotoApp && (React.createElement("div", { className: "ConvoList__openInApp" },
            React.createElement("div", { className: "ConvoList__openInApp--background" }),
            React.createElement("div", { className: "ConvoList__openInAppModal" },
                React.createElement(Icon56LogoVkMeColor, null),
                React.createElement("div", { className: "ConvoList__openInAppModalTitle" }, lang.use('me_convo_list_go_to_app_title')),
                React.createElement("div", { className: "ConvoList__openInAppModalText" }, lang.use('me_convo_list_go_to_app_text')),
                React.createElement(Button, { onClick: setGotoAppIntent, size: "l", mode: "primary", appearance: "accent" }, lang.use('me_convo_list_go_to_nav_open')),
                React.createElement(Button, { onClick: setGotoAppFalsy, size: "l", mode: "tertiary", appearance: "accent" }, lang.use('me_convo_list_go_to_nav_stay')))))));
});
const ConvoListItems = ({ peerIds, precreatedPeerIds, isEdu, isCommonChatListOpen, isPrecreatedConvosVisible, eduBannerConvosCount, eduIntegrationBanner, selectedOrganiser, isMainPanelOpen, hasMorePrecreatedConvos, selectedConvoId, isNavigationActive, setConvoScrollFocusItem, onOpenChatCreation, onOrganiserSelect, handleConvoClick, handleContextMenuAction, handleRejectMRAction, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const nodes = [];
    if (peerIds.length && !isMainPanelOpen) {
        nodes.push(React.createElement("div", { className: "ConvoList__folderDropDownEmptySpace", key: "folder-empty" }));
    }
    peerIds.forEach((peerId, index) => {
        nodes.push(React.createElement(ConvoListItemRenderer, { key: getConvoKey(peerId), peerId: peerId, prevPeerId: peerIds[index - 1], selectedOrganiser: selectedOrganiser.item, selectedConvoId: selectedConvoId, isCollapsed: !isMainPanelOpen, dispatch: dispatch, handleItemClick: handleConvoClick, handleContextMenuAction: handleContextMenuAction, handleRejectMRAction: handleRejectMRAction, setConvoScrollFocusItem: setConvoScrollFocusItem, isNavigationActive: isNavigationActive, "aria-setsize": peerIds.length, "aria-posinset": index + 1 }));
    });
    if (selectedOrganiser.hasMore) {
        nodes.push(React.createElement(OptimizedSpinner, { key: Organisers.getId(selectedOrganiser.item), className: "ConvoList__loader", onIntersection: () => dispatch({
                type: 'MoreConvosNeeded',
                organiser: selectedOrganiser.item,
            }) }));
    }
    if (peerIds.length && !selectedOrganiser.hasMore && !isMainPanelOpen) {
        nodes.push(React.createElement("div", { className: "ConvoList__emptySpace", key: "empty" }));
    }
    if (isPrecreatedConvosVisible) {
        let addSeparator = true;
        precreatedPeerIds.forEach((peerId) => {
            const key = getPrecreatedConvoKey(peerId);
            nodes.push(React.createElement(VirtualScrollItem, { key: key, itemKey: key },
                addSeparator && (React.createElement("div", { className: cx('ConvoListPrecreatedConvos__separator', {
                        'ConvoListPrecreatedConvos__separator--bordered': nodes.length > 0,
                    }) }, lang.use('me_p2g_convos_divider_title'))),
                React.createElement(ConvoListPrecreatedConvo, { key: peerId, peerId: peerId, isSelected: peerId === selectedConvoId, onSelection: handleConvoClick })));
            addSeparator = false;
        });
        if (hasMorePrecreatedConvos) {
            nodes.push(React.createElement(OptimizedSpinner, { key: `precreated-convos-loader_${precreatedPeerIds.length}`, className: "ConvoList__loader ConvoList__loader--inline", onIntersection: () => {
                    dispatch({
                        type: 'MorePrecreatedConvosNeeded',
                    });
                } }));
        }
    }
    if (isMainPanelOpen &&
        isEdu &&
        isCommonChatListOpen &&
        !selectedOrganiser.hasMore &&
        !hasMorePrecreatedConvos &&
        eduBannerConvosCount <= EDU_INTEGRATION_BANNER_LIMIT) {
        nodes.push(React.createElement("div", { key: "edu-integration-banner", className: "ConvoList__eduIntegrationBanner ConvoList__eduIntegrationBanner--teaser" },
            React.createElement(EduIntegrationBanner, { variant: "large", banner: eduIntegrationBanner })));
    }
    else if (nodes.length === 0) {
        nodes.push(React.createElement(EmptyConvoList, { key: "empty-list", organiser: selectedOrganiser.item, onOrganiserChange: onOrganiserSelect, onOpenChatCreation: onOpenChatCreation }));
    }
    return React.createElement(React.Fragment, null, nodes);
};
function getActiveMode(isSearching, isOpenContacts) {
    if (isSearching) {
        return 'search';
    }
    if (isOpenContacts) {
        return 'contacts';
    }
    return 'organizer';
}
function getIsOrganizerWithControls(activeMode, selectedOrganiser) {
    if (activeMode !== 'organizer') {
        return false;
    }
    switch (selectedOrganiser.item.kind) {
        case 'channelFilters':
        case 'filters':
            return (selectedOrganiser.item.filter === 'adTag' ||
                selectedOrganiser.item.filter === 'all' ||
                selectedOrganiser.item.filter === 'important' ||
                selectedOrganiser.item.filter === 'unanswered' ||
                selectedOrganiser.item.filter === 'unread');
        case 'folders':
        case 'tags':
            return true;
        default:
            return false;
    }
}
function getBannerSwitchAccount(accounts, viewer, profileType, selectedOrganiser, activeMode) {
    if (activeMode !== 'organizer' || selectedOrganiser.item.filter !== 'all') {
        return null;
    }
    if (selectedOrganiser.item.kind === 'folders' &&
        selectedOrganiser.item.type !== 'default') {
        return null;
    }
    if (selectedOrganiser.item.kind === 'channelFilters') {
        return null;
    }
    /**
     * Возможность переключения между основным аккаунтом, и аккаунтом Сферума
     * Включаем баннер только когда есть два аккаунта один из которых Сферум. Предполагается что
     * power-пользователи (у которых есть больше 2-х аккаунтов) уже знают как пользоваться
     * мультиакком, и поэтому баннер им не нужен
     */
    const canSwitchEduAccount = accounts.length === 2 &&
        accounts.some((acc) => Viewer.isEdu(acc.profileType));
    if (!canSwitchEduAccount) {
        return null;
    }
    const acc = accounts.find((acc) => {
        if (acc.id === viewer.id) {
            // Не переключаемся на текущий аккаунт
            return false;
        }
        const isEduAcc = Viewer.isEdu(acc.profileType);
        if (Viewer.isEdu(profileType)) {
            // Если мы под образовательным профилем, переключаемся по основной
            return !isEduAcc;
        }
        // Если под основным, переключаемся на образовательный
        return isEduAcc;
    });
    if (!acc) {
        return null;
    }
    return acc;
}
const ConvoListItemRenderer = ({ peerId, prevPeerId, selectedOrganiser, selectedConvoId, isCollapsed, dispatch, handleItemClick, handleContextMenuAction, handleRejectMRAction, setConvoScrollFocusItem, isNavigationActive, ...ariaAttributes }) => {
    const convo = useConvo(peerId);
    const prevConvo = useConvo(prevPeerId);
    const isAfterSeparator = isConvoAfterSeparator(selectedOrganiser, convo, prevConvo);
    const [shouldRender, setShouldRender] = useState(false);
    return (React.createElement(VirtualScrollItem, { itemKey: getConvoKey(peerId), className: cx('ConvoList__item', {
            'ConvoList__item--separator': isAfterSeparator,
        }), shouldRender: shouldRender },
        React.createElement(ConvoListItem, { convo: convo, dispatch: dispatch, selectedOrganiser: selectedOrganiser, isSelected: peerId === selectedConvoId, withPinIcon: selectedOrganiser.kind === 'filters', isCollapsed: isCollapsed, onClick: handleItemClick, onContextMenuAction: handleContextMenuAction, onActionRejectMR: handleRejectMRAction, setConvoScrollFocusItem: setConvoScrollFocusItem, isNavigationActive: isNavigationActive, onActionsOpenChange: setShouldRender, ...ariaAttributes })));
};
/**
 * Запиненные беседы от незапиненных отделены сепаратором.
 * Поэтому это фукнция также проверяет, что предыдущая беседа
 * была последней запиненной.
 */
export function isConvoAfterSeparator(selectedOrganiser, convo, prevConvo) {
    return Boolean(Organisers.canHavePinnedConvos(selectedOrganiser) &&
        prevConvo &&
        Convo.isPinned(prevConvo) &&
        !Convo.isPinned(convo));
}
const ConvoListTopFilters = ({ selectedFilterKind, convoOrganisers, onFilterHideMap, onSelect, }) => {
    const dispatch = useDispatch();
    const viewer = useViewer();
    const isBusinessNotifyShown = Filters.isVisible(convoOrganisers.filters.businessNotify) &&
        viewer.settings.businessNotify &&
        !convoOrganisers.folders.find((folder) => folder.type === 'business');
    const onBack = () => {
        onSelect('all');
    };
    const onHide = (kind) => {
        dispatch({
            type: 'UserHideFilter',
            kind,
        });
        onFilterHideMap[kind]?.();
    };
    const currentFilter = convoOrganisers.filters[selectedFilterKind];
    return (React.createElement(React.Fragment, null, selectedFilterKind !== 'all' &&
        selectedFilterKind !== 'unread' &&
        selectedFilterKind !== 'chats' &&
        selectedFilterKind !== 'archive' ? (React.createElement(ConvoListFilter, { filter: selectedFilterKind, currentFilter: currentFilter, onSelect: onSelect, onHide: onHide, onBack: onBack })) : (React.createElement(React.Fragment, null,
        Filters.isVisible(convoOrganisers.filters.messageRequest) && (React.createElement(ConvoListFilter, { filter: "messageRequest", currentFilter: currentFilter, 
            // Для МРов отображаем общее кол-во, а не непрочитанных
            unreadCount: convoOrganisers.filters.messageRequest.totalCount, onSelect: onSelect, onBack: onBack })),
        isBusinessNotifyShown && (React.createElement(ConvoListFilter, { filter: "businessNotify", currentFilter: currentFilter, unreadCount: convoOrganisers.filters.businessNotify.unreadCount, onSelect: onSelect, onHide: convoOrganisers.filters.businessNotify.unreadCount === 0
                ? onHide
                : undefined, onBack: onBack }))))));
};
const ConvoListFooter = React.memo(({ selectedOrganiser, onOrganiserChange }) => {
    const { lang } = useBrowserEnv();
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const nextFilter = selectedOrganiser.filter === 'all' ? 'unread' : 'all';
    return (React.createElement("label", { className: "ConvoList__footer" },
        React.createElement(Tooltip, { align: "center", disabled: isMainPanelOpen, content: selectedOrganiser.filter === 'unread'
                ? lang.use('me_all_messages')
                : lang.use('me_unread_messages'), position: "top" },
            React.createElement("div", { className: cx('ConvoList__footerIcon', {
                    'ConvoList__footerIcon--active': selectedOrganiser.filter === 'unread',
                }) },
                React.createElement(Icon20MessageUnreadTopOutline, null))),
        React.createElement("span", { className: "ConvoList__footerText" }, lang.use(`me_convo_list_folder_unread_only`)),
        React.createElement("div", { className: "ConvoList__footerSwitch" },
            React.createElement(Switch, { checked: selectedOrganiser.filter === 'unread', onChange: () => {
                    /**
                     * VKUI использует media запросы по input modality, которые оптимизируют
                     * работу в мобильном режиме, при этом mvk собирает VKUI с указанием мобильной платформы.
                     * По этой причине в билде mvk логика и UX не рассчитаны на открытие mvk в вебе и теряется
                     * оптимизация - transform в transition слое не применяется до repaint.
                     * Используем raf, чтобы браузер мог закончить все pending style / layout / paint и после этого меняем роут
                     */
                    window.requestAnimationFrame(() => {
                        onOrganiserChange({ ...selectedOrganiser, filter: nextFilter });
                    });
                } }))));
});
const ConvoListTopMenu = React.memo(({ openChatCreationPanel, openChannelCreationPanel, openPhoneJoinModal, archive, availableOnboardingTooltips, }) => {
    const { lang, calls, vkIntegration, stats } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const helpHints = useHelpHints();
    const dispatch = useDispatch();
    const { screenRoute } = useRouter();
    const { registerPopper, isPopperOpen, isPopperLocked } = useSyncPoppers();
    const { viewer, profileType } = useViewer();
    const [archiveButton, setArchiveButton] = useState(null);
    const isEdu = Viewer.isEdu(profileType);
    const isRegularOrTeacherUser = !isEdu || viewer.isVerified;
    const isTeacherOrAdmin = (viewer) => {
        const roleId = viewer.eduRoles?.mainRoleCode;
        switch (roleId) {
            case 'admin':
            case 'employee':
            case 'teacher':
                return true;
            case 'parent':
            case 'student':
            case undefined:
                return false;
            default:
                exhaustivenessCheck(roleId);
        }
    };
    const callsDropdown = useMemo(() => registerPopper({
        id: 'calls-dropdown',
        locks: ['calls-tooltip'],
    }), [registerPopper]);
    const callsTooltip = useMemo(() => registerPopper({
        id: 'calls-tooltip',
    }), [registerPopper]);
    const creationDropdown = useMemo(() => registerPopper({
        id: 'creation-dropdown',
        locks: ['creation-dropdown'],
    }), [registerPopper]);
    const onCloseArchiveOnboardingTooltip = () => {
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: 'im:web_archive_location',
        });
    };
    return (React.createElement("div", { className: "ConvoList__topMenu" },
        calls &&
            (calls.env.canCreateCall ||
                calls.env.canScheduleCall ||
                calls.env.canNavigateToSeparateSection) && (React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", adaptive: true, content: React.createElement(ActionsMenu, { id: "call-menu", "aria-labelledby": "call-menu-trigger", className: "CallMenu" },
                React.createElement(CallMenuAlternative, null)), align: vkIntegration ? 'center' : 'right', hideOnClick: true, open: isPopperOpen('calls-dropdown'), ...callsDropdown },
            React.createElement(Tooltip, { align: "center", content: lang.use('me_new_call_title'), delay: 1000, disabled: isPopperLocked('calls-tooltip'), position: "bottom", ...callsTooltip },
                React.createElement("button", { id: "call-menu-trigger", "aria-label": lang.use('me_new_call_title'), "aria-haspopup": "menu", "aria-expanded": isPopperOpen('calls-dropdown'), "aria-controls": "call-menu", className: "vkmListHeader__button ConvoList__topMenuAction", onClick: () => {
                        stats.logEvent({
                            type: 'type_action',
                            type_action: {
                                type: 'type_messaging_action_item',
                                type_messaging_action_item: {
                                    action_type: 'BUTTON_HANDSET_PLUS',
                                    label: getLogEventLabel(),
                                },
                            },
                        });
                    } },
                    React.createElement(Icon24PhoneAddOutline, null))))),
        React.createElement(OnboardingWrapper, { type: "tooltip", shown: screenRoute.kind === 'MainRoute', mode: "1", appearance: "lime", tilt: "left", tipPosition: "bottom-left", size: 48, content: lang.use('me_onboarding_archive'), campaignName: "me_mvk:archive", screen: "mvk_convo_list", enableQuarantine: true },
            React.createElement("div", null,
                React.createElement(Tooltip, { align: "center", content: lang.use('me_archive_title'), delay: 1000, position: "bottom", ref: (button) => setArchiveButton(button) },
                    React.createElement("button", { "aria-label": lang.use('me_archive_title'), className: "vkmListHeader__button ConvoList__topMenuAction", onClick: () => {
                            stats.logEvent({
                                type: 'type_action',
                                type_action: {
                                    type: 'type_messaging_action_item',
                                    type_messaging_action_item: {
                                        action_type: 'BUTTON_ARCHIVE',
                                        label: getLogEventLabel(),
                                    },
                                },
                            });
                            archive.onClick();
                        } },
                        React.createElement(Icon24ArchiveOutline, null),
                        archive.hasMentions && (React.createElement("div", { className: "vkmListHeader__buttonMention ConvoList__topMenuActionBadge" },
                            React.createElement(Icon12Mention, null))),
                        React.createElement(OnboardingTooltip, { isOpen: archive.showOnboarding &&
                                helpHints.has('im:web_archive_location') &&
                                availableOnboardingTooltips.has('im:web_archive_location'), text: lang.use('me_archive_location_tooltip'), align: "center", withCloseButton: true, closeOnHoverTarget: { current: archiveButton }, onClose: onCloseArchiveOnboardingTooltip, closeTimeout: 10000 }))))),
        React.createElement(Dropdown, { enableFocusTrap: true, 
            /**
             * Вынуждены дизейблить, иначе не срабатывает
             * автофокус в панели создания чата.
             */
            disableInert: true, openType: "click", adaptive: true, content: React.createElement(ActionsMenu, { id: "chat-creation-menu", "aria-labelledby": CHAT_CREATION_BUTTON_ID, className: "CallMenu" },
                React.createElement(ActionsMenuAction, { title: lang.use('me_new_chat_title'), leftIcon: React.createElement(Icon20UsersOutline, null), onClick: openChatCreationPanel, type: "secondary" }),
                !featureFlags.vkm_channel_name_to_community &&
                    featureFlags.vkm_channel_creation_show && (React.createElement(ActionsMenuAction, { title: lang.use('me_channel_creation_button'), leftIcon: React.createElement(Icon20Users3Outline, null), onClick: () => {
                        stats.logEvent({
                            type: 'type_action',
                            type_action: {
                                type: 'type_messaging_action_item',
                                type_messaging_action_item: {
                                    action_type: 'BUTTON_CREATE_CHANNEL',
                                    label: getLogEventLabel(),
                                },
                            },
                        });
                        openChannelCreationPanel();
                    }, type: "secondary" })),
                featureFlags.vkm_channel_name_to_community &&
                    isEdu &&
                    isTeacherOrAdmin(viewer) && (React.createElement(ActionsMenuAction, { title: lang.use('me_channel_creation_button'), leftIcon: React.createElement(Icon20Users3Outline, null), onClick: () => {
                        stats.logEvent({
                            type: 'type_action',
                            type_action: {
                                type: 'type_messaging_action_item',
                                type_messaging_action_item: {
                                    action_type: 'BUTTON_CREATE_CHANNEL',
                                    label: getLogEventLabel(),
                                },
                            },
                        });
                        openChannelCreationPanel();
                    }, type: "secondary" })),
                isRegularOrTeacherUser && (React.createElement(ActionsMenuAction, { title: lang.use('me_write_by_phone_number'), leftIcon: React.createElement(Icon20PhoneOutline, null), onClick: () => {
                        stats.logEvent({
                            type: 'type_action',
                            type_action: {
                                type: 'type_messaging_action_item',
                                type_messaging_action_item: {
                                    action_type: 'BUTTON_WRITE_BY_NUMBER',
                                    label: getLogEventLabel(),
                                },
                            },
                        });
                        openPhoneJoinModal();
                    }, type: "secondary" }))), align: "right", hideOnClick: true, open: isPopperOpen('creation-dropdown'), ...creationDropdown },
            React.createElement(Tooltip, { align: "center", content: lang.use('me_create_title'), delay: 1000, position: "bottom" },
                React.createElement("button", { id: CHAT_CREATION_BUTTON_ID, "aria-label": lang.use('me_create_title'), "aria-haspopup": "menu", "aria-expanded": isPopperOpen('creation-dropdown'), "aria-controls": "chat-creation-menu", className: "vkmListHeader__button ConvoList__topMenuAction", onClick: () => {
                        stats.logEvent({
                            type: 'type_action',
                            type_action: {
                                type: 'type_messaging_action_item',
                                type_messaging_action_item: {
                                    action_type: 'BUTTON_START_WRITING',
                                    label: getLogEventLabel(),
                                },
                            },
                        });
                    } },
                    React.createElement(Icon24WriteOutline, null))))));
});
const SferumLogo = ({ className, }) => {
    return (React.createElement("svg", { width: "91", height: "18", viewBox: "0 0 91 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: className },
        React.createElement("path", { d: "M15.7341 4.79285C15.2852 4.34433 14.7005 4.07486 14.0283 3.97172C13.9251 3.29949 13.6557 2.71479 13.2072 2.26591C10.1859 -0.755304 5.28713 -0.755304 2.26591 2.26591C-0.755304 5.28713 -0.755304 10.1859 2.26591 13.2071C2.71479 13.656 3.2995 13.9251 3.97173 14.0286C4.07487 14.7009 4.34434 15.2856 4.79285 15.7341C7.81407 18.7553 12.7129 18.7553 15.7341 15.7341C18.7557 12.7129 18.7557 7.81443 15.7341 4.79285Z", fill: "url(#paint0_linear_935_60877)" }),
        React.createElement("path", { d: "M7.05996 7.05973C9.31525 4.80444 12.0507 3.66772 14.0288 3.97169C13.9257 3.29946 13.6562 2.71476 13.2077 2.26588C11.4383 0.496515 7.5546 1.51121 4.53338 4.53279C1.51217 7.55401 0.497105 11.4377 2.26647 13.2071C2.71535 13.656 3.30006 13.9251 3.97229 14.0286C3.66759 12.0504 4.80467 9.31502 7.05996 7.05973Z", fill: "url(#paint1_radial_935_60877)" }),
        React.createElement("g", { className: "ConvoList__sferum-text" },
            React.createElement("path", { d: "M28.5226 13.6726C30.4462 13.6726 32.2667 12.6765 32.9365 10.7185L30.7553 10.3579C30.3603 11.0792 29.5874 11.5601 28.6428 11.5601C27.2344 11.5601 26.2211 10.4953 26.2211 9.00104C26.2211 7.50682 27.2344 6.44197 28.6428 6.44197C29.5702 6.44197 30.3431 6.92287 30.6866 7.66139L32.8678 7.30072C32.2324 5.35994 30.5149 4.32944 28.5226 4.32944C25.7574 4.32944 23.7994 6.28739 23.7994 9.00104C23.7994 11.7147 25.7574 13.6726 28.5226 13.6726Z", fill: "currentColor" }),
            React.createElement("path", { d: "M38.4694 17.0218H40.6678V13.5352C43.4674 13.5352 45.4425 11.646 45.4425 8.98387C45.4425 6.32174 43.4674 4.44967 40.6678 4.44967V1.39252H38.4694V4.44967C35.6871 4.44967 33.712 6.32174 33.712 8.98387C33.712 11.646 35.6871 13.5352 38.4694 13.5352V17.0218ZM38.4694 11.5601C37.0611 11.5601 36.0821 10.5124 36.0821 8.98387C36.0821 7.47247 37.0611 6.42479 38.4694 6.42479V11.5601ZM40.6678 11.5601V6.42479C42.0934 6.42479 43.0723 7.47247 43.0723 8.98387C43.0723 10.5124 42.0934 11.5601 40.6678 11.5601Z", fill: "currentColor" }),
            React.createElement("path", { d: "M56.0235 8.86364C56.0235 6.32174 54.0655 4.32944 51.2832 4.32944C48.518 4.32944 46.5429 6.28739 46.5429 9.00104C46.5429 11.7147 48.5008 13.6726 51.2488 13.6726C53.1553 13.6726 55.0102 12.7624 55.6285 11.0105L53.4472 10.6498C53.035 11.2338 52.3137 11.6116 51.3862 11.6116C50.0294 11.6116 49.1363 10.8216 48.913 9.60217H55.9891C56.0063 9.39607 56.0235 9.13844 56.0235 8.86364ZM51.2832 6.27022C52.3652 6.27022 53.1896 6.97439 53.4988 7.93619H49.0333C49.3596 6.94004 50.2012 6.27022 51.2832 6.27022Z", fill: "currentColor" }),
            React.createElement("path", { d: "M57.4738 17.0218H59.7925V12.2128C60.4108 12.8998 61.5443 13.6726 63.0729 13.6726C65.6491 13.6726 67.4525 11.7147 67.4525 9.00104C67.4525 6.28739 65.6491 4.32944 63.0729 4.32944C61.4584 4.32944 60.2734 5.18819 59.6894 5.90954L59.2772 4.50119H57.4738V17.0218ZM62.4374 11.6116C60.8745 11.6116 59.7925 10.5124 59.7925 9.00104C59.7925 7.48964 60.8745 6.39044 62.4374 6.39044C63.9832 6.39044 65.0308 7.48964 65.0308 9.00104C65.0308 10.5124 63.9832 11.6116 62.4374 11.6116Z", fill: "currentColor" }),
            React.createElement("path", { d: "M75.1344 4.50119L72.9876 10.4781H72.6784L70.2567 4.50119H67.7835L71.7681 13.9474C71.4933 14.6688 71.2185 14.9092 70.5831 14.9092H68.814L69.003 17.0218H70.4113C72.2319 17.0218 73.1765 16.1974 73.8635 14.3425L77.4702 4.50119H75.1344Z", fill: "currentColor" }),
            React.createElement("path", { d: "M78.8252 13.5009H81.0236V7.28354H81.3327L83.4281 13.5009H85.1971L87.4127 7.28354H87.7047V13.5009H89.9031V4.50119H86.4852L84.5273 10.1002H84.2181L82.3289 4.50119H78.8252V13.5009Z", fill: "currentColor" })),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "paint0_linear_935_60877", x1: "3.35798", y1: "13.937", x2: "14.5213", y2: "4.16912", gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", { stopColor: "#0000C9" }),
                React.createElement("stop", { offset: "0.1277", stopColor: "#2006C9" }),
                React.createElement("stop", { offset: "0.3216", stopColor: "#4A0EC8" }),
                React.createElement("stop", { offset: "0.5106", stopColor: "#6B14C8" }),
                React.createElement("stop", { offset: "0.6905", stopColor: "#8318C7" }),
                React.createElement("stop", { offset: "0.8578", stopColor: "#911BC7" }),
                React.createElement("stop", { offset: "1", stopColor: "#961CC7" })),
            React.createElement("radialGradient", { id: "paint1_radial_935_60877", cx: "0", cy: "0", r: "1", gradientUnits: "userSpaceOnUse", gradientTransform: "translate(10.9913 11.1434) rotate(-128.972) scale(6.85089 10.1046)" },
                React.createElement("stop", { stopColor: "#0B25CE" }),
                React.createElement("stop", { offset: "0.4859", stopColor: "#2C93DB" }),
                React.createElement("stop", { offset: "0.8379", stopColor: "#42DCE4" }),
                React.createElement("stop", { offset: "1", stopColor: "#4BF9E8" })))));
};
export function hasFolders(owner, folders) {
    return owner.kind === 'User' && folders.length > 0;
}
export function isVerticalFoldersView(settings, isTwoColumnLayout, view) {
    switch (view) {
        case 'vertical':
            return true;
        case 'horizontal':
            return false;
        default:
            return settings.verticalFoldersView && isTwoColumnLayout;
    }
}
const useActiveOrganiser = (items, selectedOrganiser) => {
    const organisers = useOrganisers();
    const activeOrganiserIndex = items.findIndex((item) => Organisers.isEqual(item.organiser, selectedOrganiser.item));
    const activeOrganiser = items[activeOrganiserIndex];
    let activeOrganiserCount = 0;
    let isHaveUnreadUnmutedActiveOrganiserCount = false;
    if (activeOrganiser) {
        const isChannelActiveOrganiser = activeOrganiser.organiser.kind === 'folders' &&
            activeOrganiser.organiser.type === 'channels';
        if (isChannelActiveOrganiser) {
            activeOrganiser.primaryCount =
                organisers.channelFilters.all.unreadUnmutedCount;
            activeOrganiser.count = organisers.channelFilters.all.unreadCount;
        }
        if (activeOrganiser.count) {
            isHaveUnreadUnmutedActiveOrganiserCount = activeOrganiser.primaryCount > 0;
            activeOrganiserCount =
                activeOrganiser.primaryCount > 0
                    ? activeOrganiser.primaryCount
                    : activeOrganiser.count;
        }
    }
    return {
        activeOrganiser,
        activeOrganiserIndex,
        activeOrganiserCount,
        isHaveUnreadUnmutedActiveOrganiserCount,
    };
};
const ConvoListTabs = ({ isHidden, selectedOrganiserIndex, ...restProps }) => (React.createElement(CSSTransition, { in: !isHidden, timeout: 300, classNames: "ConvoList__tabs--slide", mountOnEnter: true, unmountOnExit: true },
    React.createElement(OrganiserViewHorizontal, { activeIndex: selectedOrganiserIndex, ...restProps })));
const ConvoListFolders = ({ isHidden, items, onClickSettings, onSelectOrganiser, selectedOrganiser, }) => {
    const { withNewChannels } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { isOpen: isExpanded } = useCollapsibleContainer();
    const organisers = useOrganisers();
    const { activeOrganiser, activeOrganiserCount, activeOrganiserIndex, isHaveUnreadUnmutedActiveOrganiserCount, } = useActiveOrganiser(items, selectedOrganiser);
    const isCounterHidden = useCallback((item) => {
        // Не показываем каунтер у папки каналов в web.vk.me
        if (featureFlags.vkm_old_channels_mock &&
            !withNewChannels &&
            item.organiser.kind === 'folders' &&
            item.organiser.type === 'channels') {
            return true;
        }
        return false;
    }, [withNewChannels, featureFlags.vkm_old_channels_mock]);
    return (React.createElement(React.Fragment, null,
        React.createElement(ConvoListTabs, { channelsCount: organisers.channelFilters.all.unreadCount, channelsPrimaryCount: organisers.channelFilters.all.unreadUnmutedCount, folders: organisers.folders, isHidden: isHidden || !isExpanded, items: items, isCounterHidden: isCounterHidden, onClickSettings: onClickSettings, onSelectOrganiser: onSelectOrganiser, selectedOrganiserIndex: activeOrganiserIndex }),
        !isHidden && !isExpanded && (React.createElement(ConvoListFoldersDropdown, { activeOrganiser: activeOrganiser, activeOrganiserCount: activeOrganiserCount, activeOrganiserIndex: activeOrganiserIndex, isHaveUnreadUnmutedActiveOrganiserCount: isHaveUnreadUnmutedActiveOrganiserCount, onOrganiserSelect: onSelectOrganiser, organisers: organisers, convoOrganiserToggles: items, handleFoldersSettingsClick: onClickSettings }))));
};
const ConvoListCommunityMessagingFilters = ({ isHidden, items, onSelectOrganiser, selectedOrganiser, }) => {
    const { isOpen: isExpanded } = useCollapsibleContainer();
    const { activeOrganiserIndex } = useActiveOrganiser(items, selectedOrganiser);
    return (React.createElement(ConvoListTabs, { isHidden: isHidden || !isExpanded, items: items, isCounterHidden: (item) => item.organiser.filter === 'all', onSelectOrganiser: onSelectOrganiser, selectedOrganiserIndex: activeOrganiserIndex }));
};
const ConvoListPrecreatedConvo = ({ peerId, isSelected, onSelection, }) => {
    const peers = usePeers();
    const peer = Peer.safeGet(peers, peerId);
    const lastSeen = useLastSeen(peer.id);
    const openConvo = () => {
        onSelection(peerId);
    };
    const renderNote = () => {
        if (lastSeen || (peer.kind === 'Contact' && peer.lastSeen)) {
            return React.createElement(OnlineStatus, { user: peer });
        }
        if (peer.phone) {
            return React.createElement(FormattedPhoneNumber, { phone: peer.phone });
        }
        return null;
    };
    return (React.createElement("div", { className: cx('ConvoListPrecreatedConvo', {
            'ConvoListPrecreatedConvo--selected': isSelected,
        }), onClick: openConvo },
        React.createElement("div", { className: "ConvoListPrecreatedConvo__content" },
            React.createElement(Avatar, { peer: peer, size: 48, withOnline: true, withBirthday: true }),
            React.createElement("div", { className: "ConvoListPrecreatedConvo__info" },
                React.createElement(PeerTitle, { className: "ConvoListPrecreatedConvo__name", peer: peer }),
                React.createElement("div", { className: "ConvoListPrecreatedConvo__note" }, renderNote())))));
};
const ConvoListOrganiserOnboarding = memo(function ConvoListOrganiserOnboarding({ isSelectedOrganiserLoading, selectedOrganiser, render, }) {
    const node = render(selectedOrganiser, isSelectedOrganiserLoading);
    // Не отрисовываем пустые ноды - в DOM-дереве не нужна пустая секция.
    if (!isValidElement(node)) {
        return;
    }
    return (React.createElement("section", { id: `${Organisers.getId(selectedOrganiser.item)}-onboarding`, className: "ConvoList__organiserOnboardingSection" },
        React.createElement("div", { role: "presentation", className: "ConvoList__organiserOnboardingSectionContainer" }, node)));
});
function TagsMenu({ className, onOpenTagManager, onSelectOrganiser, selectedOrganiser, }) {
    const { lang } = useBrowserEnv();
    const organisers = useOrganisers();
    const currentMask = selectedOrganiser.item.kind === 'tags' ? selectedOrganiser.item.mask : 0;
    const tagMap = useMemo(() => {
        return Tag.convertMask(organisers.tags.items, currentMask);
    }, [currentMask, organisers.tags.items]);
    const [isOpen, setIsOpen] = useState(false);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleToggleTag = (id) => {
        const mask = Tag.convertMask(organisers.tags.items, {
            ...tagMap,
            [id]: !tagMap[id],
        });
        onSelectOrganiser(mask
            ? { kind: 'tags', filter: 'all', mask }
            : { kind: 'filters', filter: 'all' });
    };
    const handleClick = () => {
        handleClose();
        onOpenTagManager();
    };
    return (React.createElement(Dropdown, { adaptive: true, align: "right", content: React.createElement(ActionsMenu, { "aria-labelledby": "tags-menu-trigger", className: "TagsMenu", id: "tags-menu" },
            React.createElement(ScrollbarProvider, { className: "TagsMenu__listWrapper", overflowX: "hidden" }, organisers.tags.items.map((tag) => (React.createElement(ActionsMenuAction, { disabled: !Tag.hasBit(tag), key: tag.id, onClick: () => handleToggleTag(tag.id), rightIcon: React.createElement(Checkbox, { checked: tagMap[tag.id], disabled: !Tag.hasBit(tag), noPadding: true, readOnly: true }), title: React.createElement(Flex, { align: "center", gap: 12 },
                    React.createElement(Flex.Item, { flex: "grow" },
                        React.createElement(EllipsisText, { maxWidth: 200 }, tag.name)),
                    React.createElement(Badge, { style: { backgroundColor: `#${tag.color}` } }),
                    React.createElement(Flex.Item, null, tag.uses)) })))),
            React.createElement(ActionsMenuAction, { className: "TagsMenu__settingsAction", onClick: handleClick, title: lang.use('me_convo_list_tags_menu_item_settings_label') })), enableFocusTrap: true, onClose: handleClose, onOpen: handleOpen, open: isOpen, openType: "click" },
        React.createElement(Button, { after: isOpen ? React.createElement(Icon16DropdownFlippedOutline, null) : React.createElement(Icon16DropdownOutline, null), className: className, mode: "link" }, lang.use('me_convo_list_tags_menu_label'))));
}
//# sourceMappingURL=ConvoList.js.map