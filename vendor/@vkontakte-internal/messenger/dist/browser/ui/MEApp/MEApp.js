import '../../styles/base.css';
import '../../styles/baseWithoutBubblesTheme.css';
import '../../ui/MEApp/MEApp.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect, } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import * as Channel from '../../../core/model/Channel';
import * as Filters from '../../../core/model/Filters';
import { ConvoList, hasFolders, isVerticalFoldersView, CHAT_CREATION_BUTTON_ID, } from '../../ui/ConvoList/ConvoList';
import { ConvoMain } from '../../ui/ConvoMain/ConvoMain';
import { useBrowserEnv, useCommunityMessagingWithToggle, useFeatureFlags, useMemoWithCustomCompare, useOnChange, useOrganisers, useOwner, usePeers, usePreferReducedMotion, useViewer, } from '../../hooks/misc';
import { Symbols } from '../../ui/Symbols/Symbols';
import { Provider } from '../../ui/Provider/Provider';
import { getOwnerGroupId } from '../../../data/store/State';
import { setCharKeysHandlerContainer, useGlobalKeyBoardHandlers, } from '../../hooks/useKeyBoardHandlers';
import { useRouter } from '../../ui/Router/Router';
import * as Organisers from '../../../core/model/Organisers';
import { IRouter } from '../../../data/env/IRouter';
import { ChannelMain } from '../../ui/ChannelMain/ChannelMain';
import { exhaustivenessCheck, isShallowEqual, noop } from '../../../core/utils/misc';
import { MainPanel } from '../../ui/MainPanel/MainPanel';
import { ChatCreation } from '../../ui/ChatCreation/ChatCreation';
import { ContentPlaceholder, getPlaceholderType, } from '../../ui/ContentPlaceholder/ContentPlaceholder';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useModal } from '../../hooks/useModal';
import { CallJoin } from '../../ui/CallJoin/CallJoin';
import { ChatInviteByExternalLinkModal } from '../../ui/ChatInviteModal/ChatInviteByExternalLinkModal';
import { MediaModalRenderer, } from '../../ui/MediaModalRenderer/MediaModalRenderer';
import * as Viewer from '../../../core/model/Viewer';
import { OrganisersViewVertical, } from '../../ui/OrganisersViewVertical/OrganisersViewVertical';
import { MiniAppsService } from '../../ui/MiniApp/MiniApp';
import { ModalMessage } from '../../ui/ModalMessage/ModalMessage';
import { CSSTransition } from 'react-transition-group';
import { ImportantMessagesModal } from '../../ui/ImportantMessagesList/ImportantMessagesList';
import { BurgerMenu, } from '../../ui/BurgerMenu/BurgerMenu';
import { useMRReject } from '../../hooks/useMRReject';
import { useChannelsOnboarding } from '../../hooks/useChannelsOnboarding';
import { ModalsConfigProvider } from '../../ui/ModalConfigProvider/ModalConfigProvider';
import { EDU_HELP_CONVO_ID, HELPDESK_MINIAPP_ID, } from '../../../core/config/config';
import classnames from 'classnames';
import { ConvoMainWrapper } from '../../ui/ConvoMainWrapper/ConvoMainWrapper';
import { VKNotifications } from '../../ui/VKNotifications/VKNotifications';
import { RightPanelContextProvider } from '../../ui/RightPanel/RightPanelContext';
import { ConvoSearch } from '../../ui/ConvoSearch/ConvoSearch';
import { ChannelsOnboarding } from '../../ui/ChannelsOnboarding/ChannelsOnboarding';
import { AttachAudioRestrictionModal } from '../../ui/AttachAudio/AttachAudioRestrictionModal';
import { SnackbarProvider, useSnackbar } from '../../hooks/useSnackbar';
import { PollResultsModal } from '../../ui/PollResultsModal/PollResultsModal';
import { resolveMiniAppId } from '../../../core/model/Attach';
import { MiniAppsCatalogModal } from '../../ui/MiniAppsCatalogModal/MiniAppsCatalogModal';
import { useHandleBotKeyboardEvents } from '../../hooks/useHandleBotKeyboardEvents';
import { useFocusItemsCache } from '../../ui/MEApp/useFocusItemsCache';
import { ChannelCreation } from '../../ui/ChannelCreation/ChannelCreation';
import { ChannelCreationSwitchAccountModal } from '../../ui/ChannelCreation/ChannelCreationSwitchAccountModal';
import { ChannelProfile } from '../../ui/ChannelProfile/ChannelProfile';
import { Icon24ErrorCircleOutline, Icon20GlobeCrossOutline, } from '@vkontakte/icons';
import { ChannelMainWrapper } from '../../ui/ChannelMainWrapper/ChannelMainWrapper';
import { UnifiedServiceModal } from '../../ui/UnifiedServiceModal/UnifiedServiceModal';
import { useAddSferumUrlParamForEdu } from '../../hooks/useAddSferumUrlParamForEdu';
import { Button } from '@vkontakte/vkui';
import { useSuggestToSwitchAccountToEdu } from '../../hooks/useSuggestToSwitchAccountToEdu';
import { useMessageModal } from '../../hooks/useMessageModal';
import { browser, formatPhoneNumber, preparePhoneNumber, } from '../../utils/misc';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ChannelSearch } from '../../ui/ChannelSearch/ChannelSearch';
import { ConnectionIndicatorProvider } from '../../ui/ConnectionIndicator/ConnectionIndicator';
import { ConvoProfile } from '../../ui/ConvoProfile/ConvoProfile';
import { useCollectAppStartEvent, useCollectMessageReceivedEvent, useMemoryStats, usePerformanceObserver, } from '../../hooks/usePerfStats';
import { FailedPhoneNumbersModal } from '../../ui/FailedPhoneNumbers/FailedPhoneNumbers';
import { FoldersModalNew } from '../../ui/FoldersModalNew/FoldersModalNew';
import { FoldersModalEdit } from '../../ui/FoldersModalEdit/FoldersModalEdit';
import { SpacesNavbar } from '../../ui/SpacesNavbar/SpacesNavbar';
import { RedirectSpaceNotFound, SpaceScreen, } from '../../ui/SpaceScreen/SpaceScreen';
import { SpaceChatMain } from '../../ui/SpaceChatMain/SpaceChatMain';
import { SpaceProfile } from '../../ui/SpaceProfile/SpaceProfile';
import { RightPanelContainer } from '../../ui/RightPanel/RightPanelContainer';
import { SpaceRoomCreate } from '../../ui/SpaceRoomUpsert/SpaceRoomCreate';
import { CollapsibleContainerProvider, useCollapsibleContainer, } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { MEAppMainPanel } from '../../ui/MEAppMainPanel/MEAppMainPanel';
import { SpaceRoomCall } from '../../ui/SpaceRoomCall/SpaceRoomCall';
import { usePhoneJoin } from '../../hooks/usePhoneJoin';
import { IApi } from '../../../data/env/IApi';
import { API_ERROR_FLOOD, API_ERROR_MESSAGES_SPAM_RESTRICTION, } from '@vkontakte-internal/api-schema-typescript';
import { IPerfStats } from '../../../data/env/IPerfStats';
import { ImagesLayoutProvider, useImagesLayout, } from '../../ui/ConvoHistory/ImagesLayoutContext';
import { SpaceSectionCreateModal } from '../../ui/SpaceSectionCreateModal/SpaceSectionCreateModal';
import { SpaceRoomUpdate } from '../../ui/SpaceRoomUpsert/SpaceRoomUpdate';
import { AttentionImage } from '../../ui/AttentionImage/AttentionImage';
import { SwitchToSferumModal } from '../../ui/SwitchToSferumModal/SwitchToSferumModal';
import { COMPACT_HISTORY_WIDTH } from '../../ui/ConvoHistory/ConvoHistory';
import { useForeignMessagesHistoryModal } from '../../hooks/useForeignMessagesHistoryModal';
import { useLayer } from '../../ui/Layer/Layer';
import { useCheckTimezone } from '../../ui/SettingsSchedule/useCheckTimezone';
import { IMGoAnalytics } from '../../ui/Analytics/IMGoAnalytics';
import { useOrganiser } from '../../hooks/useOrganiser';
import { useRightPanelChange } from '../../hooks/useRightPanelChange';
import { handleVKWebAppCustomMessage, } from '../../utils/miniApps';
import { useApiFetch } from '../../hooks/useApiFetch';
import { BotKeyboardAlert } from '../../ui/BotKeyboard/BotKeyboardAlert';
import { SferumOffboardingModal } from '../../ui/SferumOffboardingModal/SferumOffboardingModal';
import { IMChannelDetails } from '../../ui/Analytics/IMChannelDetails';
import { ClipCoOwnersModal } from '../../ui/ClipCoOwnersModal/ClipCoOwnersModal';
import { useClipCoOwnersModal } from '../../hooks/useClipCoOwnersModal';
import { ChannelsFolderRoutePlaceholder } from '../../ui/ChannelsFolderRoutePlaceholder/ChannelsFolderRoutePlaceholder';
import { ChatInviteUnifiedModal } from '../../ui/ChatInviteModal/ChatInviteUnifiedModal';
import { useAutoSwitchToChannelsOnFirstEntry } from '../../hooks/useAutoSwitchToChannelsOnFirstEntry';
import cx from 'classnames';
export const MEApp = ({ store, state, env, availableActions, setOwner, setAccount, onLogout, miniAppsRenderer, foldersView = 'auto', hidePlayerOnMusicPlayback = false, logoVariant = 'vkme', autoOpenPromo = false, registerAccount, notificationUnblockPics, mediaRenderer, SettingsRoute, mode: forceLayoutMode, forceMobileMode, availableOnboardingTooltips, callRoomChatAppRenderer, organiserOnboardingRenderer, }) => {
    const isCallsEnabled = state.viewer.settings.callsEnabled;
    env = useMemo(() => {
        return {
            ...env,
            calls: isCallsEnabled ? env.calls : undefined,
        };
    }, [env, isCallsEnabled]);
    useHandleBotKeyboardEvents(state, env.botKeyboard);
    const owner = Peer.safeGet(state.peers, state.ownerId);
    const mode = useMemo(() => {
        if (forceMobileMode) {
            return 'mobile';
        }
        return forceLayoutMode || state.viewer.settings.layoutMode;
    }, [forceLayoutMode, forceMobileMode, state.viewer.settings.layoutMode]);
    const width = state.containerSize.width ?? window.innerWidth;
    const IMAGES_LAYOUT = useMemo(() => {
        if (mode === 'mobile') {
            return {
                // TODO ME-33097
                // Коэффициент 0. завязан на CSS:
                // - ConvoMain занимает всю ширину экрана,
                // - ConvoHistory__messageWrapper - 90% от ширины ConvoMain
                // - есть внутренние боковые отступы у .ConvoMessage
                width: Math.min(width * 0.7, 360),
                minHeight: 80,
                maxSingleHeight: 384,
                preferredRatio: 1,
            };
        }
        if (mode === 'one-column') {
            /**
             *  Конфиг ориентирован на безбабловый одноколоночный вид в вкком с шириной беседы 550px
             */
            return {
                width: 340,
                minHeight: 80,
                maxSingleHeight: 384,
                preferredRatio: 4 / 3,
            };
        }
        return {
            width: 360,
            minHeight: 80,
            maxSingleHeight: 384,
            preferredRatio: 4 / 3,
        };
    }, [mode, width]);
    return (React.createElement(ErrorBoundary, { fallbackRender: () => null, onError: (err) => env.logger.error('[MEApp] Error', err) },
        React.createElement(Provider, { env: env, state: state, store: store, owner: owner, layoutMode: mode, imagesLayoutEdgeSizes: IMAGES_LAYOUT },
            React.createElement(ModalsConfigProvider, null,
                React.createElement(CollapsibleContainerProvider, { initialWidthPercent: state.viewer.settings.convoListWidthPercent, disabled: !store.featureFlags.vkm_chat_list_collapse },
                    React.createElement(App, { state: state, availableActions: availableActions, dispatch: store.dispatch, setOwner: setOwner, setAccount: setAccount, registerAccount: registerAccount, onLogout: onLogout, miniAppsRenderer: miniAppsRenderer, foldersView: foldersView, hidePlayerOnMusicPlayback: hidePlayerOnMusicPlayback, logoVariant: logoVariant, SettingsRoute: SettingsRoute, notificationUnblockPics: notificationUnblockPics, mediaRenderer: mediaRenderer, autoOpenPromo: autoOpenPromo, availableOnboardingTooltips: useMemo(() => availableOnboardingTooltips || new Set(), [availableOnboardingTooltips]), callRoomChatAppRenderer: callRoomChatAppRenderer, organiserOnboardingRenderer: organiserOnboardingRenderer }))),
            React.createElement(SnackbarProvider, null))));
};
const App = ({ state, availableActions, dispatch, setAccount, setOwner, onLogout, miniAppsRenderer, foldersView, hidePlayerOnMusicPlayback, logoVariant, registerAccount, SettingsRoute, notificationUnblockPics, autoOpenPromo, mediaRenderer, availableOnboardingTooltips, callRoomChatAppRenderer, organiserOnboardingRenderer, }) => {
    const { lang, idle, browserNotifications, perfStats, stats, externalEvents, withNewChannels, vkcom_me: { clipCoOwnersBoxRenderer } = {}, } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const { screenRoute, runtimeRoute, navigate, replace, pop, router } = useRouter();
    const $screenRoute = useRef(screenRoute);
    $screenRoute.current = screenRoute;
    const { profileType, viewer } = useViewer();
    const snackbar = useSnackbar();
    const selectedPeer = screenRoute.kind === 'ConvoRoute' ? screenRoute : undefined;
    const $selectedPeerId = useRef(selectedPeer?.peerId);
    $selectedPeerId.current = selectedPeer?.peerId;
    const openConvo = useCallback(({ peerId, entrypoint, cmid, messageHighlightQuery }) => {
        /**
         * Раскомментить код ниже, чтобы понять, насколько точную стату собираем.
         */
        // window.performance.mark('reforged__start_open_chat', {
        //   detail: {
        //     peerId,
        //   },
        // })
        perfStats?.removeEvent(IPerfStats.EventType.openChat);
        perfStats?.addEvent(IPerfStats.EventType.openChat, {
            prevPeerId: $selectedPeerId.current,
            peerId,
            cmid,
            data: {
                start: perfStats.getCurrentTime(),
            },
        });
        navigate({
            kind: 'ConvoRoute',
            peerId,
            entrypoint,
            cmid,
            highlightQuery: messageHighlightQuery,
            organiser: $screenRoute.current.organiser,
        });
    }, [perfStats, navigate]);
    useMemoryStats(state);
    usePerformanceObserver(state);
    useCollectAppStartEvent();
    useCollectMessageReceivedEvent(selectedPeer?.peerId);
    usePreferReducedMotion();
    useCheckTimezone();
    useEffect(() => {
        const handleIdle = () => {
            // Если перешли в idle, то вероятно перерисовка экрана отложилась
            // и не хотим в таком случае трекать евент.
            if (idle.isIdle()) {
                perfStats?.removeAllEvents();
            }
        };
        handleIdle();
        return idle.subscribe(handleIdle);
    }, [idle, perfStats]);
    useEffect(() => perfStats?.subscribeOnChanges((name) => {
        // Если перешли в idle, то вероятно перерисовка экрана отложилась
        // и не хотим в таком случае трекать евент.
        if (idle.isIdle()) {
            perfStats.removeEvent(name);
        }
    }), [perfStats, idle]);
    const listControlHandleRef = useRef();
    const closeConvo = useCallback(() => {
        navigate({
            kind: 'MainRoute',
            organiser: $screenRoute.current.organiser,
        });
        // Возвращаем фокус в текущий список.
        listControlHandleRef.current
            /**
             * Не скроллим к элементу в фокусе, поскольку он итак
             * должен быть в видимой области списка чатов, а попытка
             * проскролла приводит в сдвигу контейнера списка чатов
             * наверх.
             * Подробнее: https://jira.mvk.com/browse/ME-75079 .
             */
            ?.focusFirst({}, { preventScroll: true })
            .catch(noop);
    }, [navigate]);
    const openChannel = useCallback((channelId) => {
        navigate({
            kind: 'ChannelRoute',
            channelId,
            organiser: $screenRoute.current.organiser,
        });
    }, [navigate]);
    const { onRejectMR, rejectMRConfirmationModal } = useMRReject(screenRoute, closeConvo);
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const { open: openClipCoOwnersModal, close: closeClipCoOwnersModal, clipId: coOwnersModalClipId, isActive: isClipCoOwnersModalActive, } = useClipCoOwnersModal();
    const isEdu = Viewer.isEdu(profileType);
    const creatingChannelForEduModal = useModal();
    const onOpenChannelCreation = useCallback(() => {
        isEdu && !viewer.isVerified
            ? creatingChannelForEduModal.open()
            : setChannelCreationOpen(true);
    }, [creatingChannelForEduModal, isEdu, viewer.isVerified]);
    const [failedPhoneNumbers, setFailedPhoneNumbers] = useState(null);
    /**
     * Ходим при маунте на бэк, чтоб бэк знал что пользователь зашёл в приложение
     * Актуально для SPA в vk.com, где нет никаких запросов при заходе в интеграцию
     * Если есть какие-то новости и у пользователя не открыто бесед, то открываем новости
     *
     * По планам это должно пожить пару месяцев после запуска интеграции, а потом избавимся
     */
    useEffect(() => {
        ;
        (async function getPromoUpdate() {
            if (!autoOpenPromo) {
                return;
            }
            if (!featureFlags.vkm_promo_auto_open) {
                return;
            }
            try {
                const resp = await apiFetch('messages.sendAnnouncement', {
                    group_id: getOwnerGroupId(owner.id),
                });
                if (resp.promo_sent && resp.peer_id && !$selectedPeerId.current) {
                    const peerId = Peer.resolveId(resp.peer_id);
                    openConvo({ peerId, entrypoint: 'list_all' });
                }
            }
            catch { }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        const customMessageHanlder = (name, params) => {
            if (name === 'VKWebAppCustomMessage') {
                handleVKWebAppCustomMessage(params, router, dispatch);
            }
        };
        /**
         * Ловим событие VKWebAppCustomMessage из бриджа в
         * интеграции VKCOM при работе с мини аппами.
         */
        return externalEvents.subscribe(customMessageHanlder);
    }, [dispatch, externalEvents, router]);
    const failedPhoneNumbersModal = useModal();
    const handleFailAddingPhoneNumbers = useCallback(async (phoneNumbers) => {
        const formattedPhoneNumbers = await Promise.all(phoneNumbers.map(async (phoneNumber) => {
            const formattedPhoneNumber = await formatPhoneNumber(preparePhoneNumber(phoneNumber));
            if (formattedPhoneNumber.isValid) {
                return formattedPhoneNumber.international;
            }
            else {
                return phoneNumber;
            }
        }));
        setFailedPhoneNumbers(formattedPhoneNumbers);
        snackbar({
            before: (React.createElement(Icon24ErrorCircleOutline, { fill: "var(--vkui--color_icon_negative)" })),
            message: lang.use('me_failed_phone_snackbar_text', {
                values: { phones: formattedPhoneNumbers.join(', ') },
            }),
            action: lang.use('me_failed_phone_snackbar_action'),
            onActionClick: failedPhoneNumbersModal.open,
        });
    }, [failedPhoneNumbersModal.open, lang, snackbar]);
    const handleFailedPhoneNumbersClose = () => {
        failedPhoneNumbersModal.close();
        setFailedPhoneNumbers(null);
    };
    const [isContactsOpen, setContactsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const toggleContactList = useCallback((state = false) => {
        setContactsOpen(state);
    }, [setContactsOpen]);
    // Выставляем начальное значение настройки браузерных уведомлений
    useEffect(() => {
        browserNotifications
            ?.onChange(state.viewer.settings.browserNotifications)
            .catch(noop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [browserNotifications]);
    const { subscribeGlobalKeyDown } = useGlobalKeyBoardHandlers();
    useEffect(() => {
        return subscribeGlobalKeyDown('Mod+/', {
            handler: () => {
                owner.kind !== 'Group' &&
                    navigate({
                        kind: 'SettingsRoute',
                        section: 'main',
                        back: screenRoute,
                    });
            },
        });
    }, [navigate, subscribeGlobalKeyDown, owner.kind, screenRoute]);
    useEffect(() => {
        const selectedPeerId = selectedPeer?.peerId;
        if (selectedPeerId && Peer.isContactPeerId(selectedPeerId)) {
            const contactPeer = state.peers.get(selectedPeerId);
            if (contactPeer?.kind === 'Contact' && contactPeer.userId) {
                /**
                 * Если выбран диалог с известным контактом - открываем диалог с пользователем
                 * энтрипоинт в таком случае ставим - contacts_list
                 * Этот кейс должен возникать только при переходе по прямой ссылке на диалог с контактом
                 */
                navigate({
                    kind: 'ConvoRoute',
                    peerId: contactPeer.userId,
                    entrypoint: 'contacts_list',
                });
            }
        }
    }, [navigate, selectedPeer?.peerId, state.peers]);
    useEffect(() => {
        return idle.subscribe((isIdle) => {
            if (!isIdle) {
                dispatch({
                    type: 'UserActualizeHideFilter',
                    kind: 'businessNotify',
                });
                dispatch({
                    type: 'ResetUpdatesCounter',
                });
            }
        });
    }, [idle, dispatch]);
    const layer = useLayer();
    // Обновляем класс контейнера модалок, чтобы были правильные CSS переменные
    useEffect(() => {
        if (!layer) {
            return;
        }
        if (isWithoutBubblesTheme) {
            layer.classList.add('MEAppConfig__withoutBubbles');
        }
        else {
            layer.classList.remove('MEAppConfig__withoutBubbles');
        }
    }, [isWithoutBubblesTheme, layer]);
    const $containerRef = useRef(null);
    useEffect(() => {
        setCharKeysHandlerContainer($containerRef.current);
        return () => setCharKeysHandlerContainer(null);
    }, []);
    const openMainRoute = useCallback(() => {
        navigate({ kind: 'MainRoute' });
    }, [navigate]);
    const closeRouterModal = useCallback(() => {
        router.pop();
    }, [router]);
    const handleSetOwner = useCallback((id) => {
        openMainRoute();
        setOwner(id);
    }, [openMainRoute, setOwner]);
    const handleSetAccount = useCallback((id, resetRoute = true) => {
        if (resetRoute) {
            openMainRoute();
        }
        setAccount(id, resetRoute);
    }, [openMainRoute, setAccount]);
    useAddSferumUrlParamForEdu();
    const { isSferumSwitchNeeded, closeSuggestSwitchAccountModal } = useSuggestToSwitchAccountToEdu();
    const onChatCreated = (chatId) => {
        setChatCreationOpen(false);
        openConvo({ peerId: chatId, entrypoint: 'create_conversation' });
    };
    const onChannelCreated = (channelId) => {
        setChannelCreationOpen(false);
        navigate({
            kind: 'ChannelRoute',
            channelId,
            organiser: screenRoute.organiser,
        });
    };
    const [isChatCreationOpen, setChatCreationOpen] = useState(false);
    const [isChannelCreationOpen, setChannelCreationOpen] = useState(false);
    /**
     * Храним в объекте для перемещения фокуса при каждом изменении,
     * даже если сам id не изменился.
     */
    const [moveFocusTo, setMoveFocusTo] = useState({ id: undefined });
    useEffect(() => {
        if (!moveFocusTo.id) {
            return;
        }
        const target = document.getElementById(moveFocusTo.id);
        if (target) {
            target.focus({ preventScroll: true });
        }
    }, [moveFocusTo]);
    const onChatCreationPanelClose = (moveFocusBack) => {
        setChatCreationOpen(false);
        if (moveFocusBack) {
            setMoveFocusTo({ id: CHAT_CREATION_BUTTON_ID });
        }
    };
    const onOpenChatCreation = useCallback(() => {
        setChatCreationOpen(true);
    }, []);
    const onChannelCreationPanelClose = (moveFocusBack) => {
        setChannelCreationOpen(false);
        if (moveFocusBack) {
            setMoveFocusTo({ id: CHAT_CREATION_BUTTON_ID });
        }
    };
    const onOrganiserChange = () => {
        if (isChatCreationOpen) {
            onChatCreationPanelClose();
        }
        if (isChannelCreationOpen) {
            onChannelCreationPanelClose();
        }
        if (isContactsOpen) {
            toggleContactList(false);
        }
        if (isSearching) {
            setIsSearching(false);
        }
    };
    const { selectedOrganiser, setSelectedOrganiser } = useOrganiser(state, onOrganiserChange);
    const [isCompactHistory, setIsCompactHistory] = useState(false);
    const collapsibleMainPanel = useCollapsibleContainer((width) => {
        if ($containerRef.current) {
            setIsCompactHistory($containerRef.current.offsetWidth - width < COMPACT_HISTORY_WIDTH);
        }
    });
    const isMainPanelCollapsible = !collapsibleMainPanel.disabled;
    useCollapsibleMainPanel({
        ...collapsibleMainPanel,
        selectedOrganiser,
        isContactsOpen,
        isChatCreationOpen,
        isChannelCreationOpen,
        isSearching,
    });
    const convoOrganiserToggles = useConvoOrganiserToggles(selectedOrganiser.item.filter);
    useAutoSwitchToChannelsOnFirstEntry(selectedOrganiser, state.organisers, setSelectedOrganiser, convoOrganiserToggles);
    const handleFoldersSettingsClick = useCallback(() => {
        navigate({
            kind: 'SettingsRoute',
            section: 'folders',
            back: $screenRoute.current,
        });
    }, [navigate]);
    const [hiddenFilterTooltipText, setHiddenFilterTooltipText] = useState(null);
    const phoneJoinModal = useModal();
    const handlePhoneJoin = useCallback((contactId) => {
        phoneJoinModal.close();
        navigate({
            kind: 'ConvoRoute',
            peerId: contactId,
            entrypoint: 'contacts_list',
        });
    }, [navigate, phoneJoinModal]);
    const handlePhoneJoinError = useCallback((error) => {
        let message = lang.use('me_phone_invite_contacts_unknown_error');
        if (error instanceof IApi.RequestError &&
            (error.code === API_ERROR_MESSAGES_SPAM_RESTRICTION ||
                error.code === API_ERROR_FLOOD)) {
            message = lang.use('me_phone_invite_contacts_spamblock_or_floodcontrol_error');
        }
        snackbar({
            before: (React.createElement(Icon20GlobeCrossOutline, { fill: "var(--vkui--color_text_negative)" })),
            message,
        });
    }, [snackbar, lang]);
    const phoneJoin = usePhoneJoin({
        onClose: phoneJoinModal.close,
        onSuccess: handlePhoneJoin,
        onError: handlePhoneJoinError,
    });
    const onHiddenFilterTooltipClose = useCallback(() => {
        setHiddenFilterTooltipText(null);
    }, []);
    const searchInputRef = useRef(null);
    const handleBurgerMenuAction = useCallback((action) => {
        switch (action) {
            case 'contacts':
                // SPC-TODO При переходе в контакты закрываем пространства, пока самое дешевое решение
                navigate({
                    kind: 'MainRoute',
                });
                toggleContactList(true);
                break;
            case 'settings':
                navigate({
                    kind: 'SettingsRoute',
                    section: 'start',
                    back: $screenRoute.current,
                });
                break;
            case 'businessNotify':
                setSelectedOrganiser({ kind: 'filters', filter: 'businessNotify' });
                break;
            case 'messageRequest':
                setSelectedOrganiser({ kind: 'filters', filter: 'messageRequest' });
                break;
            case 'archive':
                setSelectedOrganiser({ kind: 'filters', filter: 'archive' });
                break;
            case 'important':
                navigate({
                    kind: 'ImportantMessagesModal',
                });
                break;
            case 'logout':
                onLogout();
                break;
            case 'helpdesk':
                if (isEdu) {
                    if (featureFlags.vkm_edu_help_miniapp) {
                        navigate({
                            kind: 'MiniAppModal',
                            miniAppId: resolveMiniAppId(HELPDESK_MINIAPP_ID),
                            hash: 'act=home_education',
                        });
                    }
                    else {
                        navigate({
                            kind: 'ConvoRoute',
                            peerId: Peer.resolveId(EDU_HELP_CONVO_ID),
                            entrypoint: 'app_menu',
                        });
                    }
                }
                else {
                    navigate({
                        kind: 'MiniAppModal',
                        miniAppId: resolveMiniAppId(HELPDESK_MINIAPP_ID),
                    });
                }
                break;
            case 'miniAppsCatalog':
                navigate({
                    kind: 'MiniAppCatalogModal',
                });
                break;
            case 'search':
                setIsSearching(true);
                // TODO: FocusTrap блокирует фокус внутри бургер меню, а разблокируется только после закрытия DropDown, поэтому необходима задержка.
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 300);
                break;
            case 'openChatCreationPanel':
                onOpenChatCreation();
                break;
            case 'openChannelCreationPanel':
                onOpenChannelCreation();
                break;
            case 'openPhoneJoinModal':
                phoneJoinModal.open();
                break;
            default:
                exhaustivenessCheck(action);
        }
    }, [
        featureFlags.vkm_edu_help_miniapp,
        phoneJoinModal,
        onOpenChannelCreation,
        onOpenChatCreation,
        toggleContactList,
        setSelectedOrganiser,
        onLogout,
        navigate,
        isEdu,
    ]);
    /**
     * После обработки роутером ссылки на приглашение в звонок / чат,
     * редиректим на MainRoute c параметром callJoinHash / chatJoinHash, чтобы в MainRoute показать join modal
     */
    useEffect(() => {
        let routeParam;
        switch (screenRoute.kind) {
            case 'CallJoinShortenedRoute':
                routeParam = {
                    callJoinId: screenRoute.callJoinId,
                    p: screenRoute.p,
                };
                break;
            case 'CallJoinRoute':
                routeParam = {
                    callJoinHash: screenRoute.callJoinHash,
                };
                break;
            case 'ChatJoinRoute':
                routeParam = {
                    chatJoinHash: screenRoute.chatJoinHash,
                };
                break;
            default:
                return;
        }
        navigate({ kind: 'MainRoute', ...routeParam });
    }, [navigate, screenRoute]);
    const canPinMoreConvos = useMemo(() => Array.from(state.convos.values()).filter(Convo.isPinned).length <
        Convo.MAX_PINNED, [state.convos]);
    const canPinMoreChannels = useMemo(() => Array.from(state.channels.values()).filter((channel) => channel.kind === 'Channel' && Channel.isPinned(channel)).length < Channel.MAX_PINNED, [state.channels]);
    const { isMobileLayout, isOneColumnLayout, isTwoColumnLayout } = useLayoutData();
    const groups = useGroups(availableActions);
    /**
     * Для оптимизации ререндеров BurgerMenu мемоизируем массив групп.
     */
    const memoizedGroups = useMemoWithCustomCompare(() => groups, groups, isShallowEqual);
    const burgerMenu = useMemo(() => (React.createElement(BurgerMenu, { groups: memoizedGroups, accounts: state.viewer.accounts, availableActions: availableActions, selectedOrganiserFilter: selectedOrganiser.item.filter, onAction: handleBurgerMenuAction, tooltipText: hiddenFilterTooltipText, onCloseTooltip: onHiddenFilterTooltipClose, onSetAccount: handleSetAccount, onSetGroupOwner: handleSetOwner, isMRFilterVisible: Filters.isVisible(state.organisers.filters.messageRequest), hasBusinessFolder: !!state.organisers.folders.find((folder) => folder.type === 'business') })), [
        availableActions,
        handleBurgerMenuAction,
        handleSetAccount,
        handleSetOwner,
        hiddenFilterTooltipText,
        memoizedGroups,
        onHiddenFilterTooltipClose,
        selectedOrganiser.item.filter,
        state.organisers.filters.messageRequest,
        state.organisers.folders,
        state.viewer.accounts,
    ]);
    const convoScrollCache = useFocusItemsCache();
    const convoPostponedHistoryScrollCache = useFocusItemsCache();
    const channelScrollCache = useFocusItemsCache();
    const scrollPostponedCache = useFocusItemsCache();
    const isChannelsReconnecting = (selectedOrganiser.item.kind === 'channelFilters' ||
        screenRoute.kind === 'ChannelRoute' ||
        screenRoute.kind === 'ChannelsFolderRoute') &&
        state.channelConn.status === 'resyncing';
    const isReconnecting = state.convoConn.status === 'resyncing' || isChannelsReconnecting;
    const renderSwitchSferumAccountModal = (title, subtitle) => {
        if (!isSferumSwitchNeeded) {
            return null;
        }
        return (React.createElement(SwitchToSferumModal, { title: title, subtitle: subtitle, registerAccount: registerAccount, handleSetAccount: handleSetAccount, onClose: closeSuggestSwitchAccountModal }));
    };
    const [convoListScrollPosition, setConvoListScrollPosition] = useState({ kind: 'Upper' });
    useOnChange(() => setConvoListScrollPosition({
        kind: 'Upper',
    }), 
    // Скроллим список чатов к верху при изменении органайзера.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Organisers.getId(selectedOrganiser.item)]);
    const renderListContent = () => (React.createElement(ConnectionIndicatorProvider, { value: isReconnecting },
        React.createElement(ConvoList, { dispatch: dispatch, selectedConvoId: selectedPeer ? selectedPeer.peerId : null, organisers: state.organisers, onboardingTriggers: state.onboardingTriggers, conversationsBar: state.conversationsBar, selectedOrganiser: selectedOrganiser, foldersView: foldersView, menu: burgerMenu, hasChannelsOnboarding: hasChannelsOnboarding, showChannelsOnboarding: channelsOnboarding.incrementStep, onSelect: openConvo, toggleContactList: toggleContactList, onLogout: onLogout, onOrganiserSelect: setSelectedOrganiser, setHiddenFilterTooltipText: setHiddenFilterTooltipText, className: classnames('MEApp__convoList', {
                'MEApp__convoList--hidden': isChatCreationOpen || isChannelCreationOpen,
            }), onRejectMR: onRejectMR, convoOrganiserToggles: convoOrganiserToggles, handleFoldersSettingsClick: handleFoldersSettingsClick, onOpenChatCreation: onOpenChatCreation, onOpenChannelCreation: onOpenChannelCreation, onOpenPhoneJoinModal: phoneJoinModal.open, isOpenContacts: isContactsOpen, canPinMoreConvos: canPinMoreConvos, logoVariant: logoVariant, setAccount: handleSetAccount, managedGroupsCache: state.managedGroups, setConvoScrollFocusItem: convoScrollCache.setFocusItem, availableOnboardingTooltips: availableOnboardingTooltips, eduIntegrationBanner: state.eduIntegrationBanner, precreatedConvos: state.precreatedConvos, convoListSearchInputRef: searchInputRef, isSearching: isSearching, toggleSearchPanel: setIsSearching, controlHandleRef: listControlHandleRef, canPinMoreChannels: canPinMoreChannels, closeConvo: closeConvo, organiserOnboardingRenderer: organiserOnboardingRenderer, scrollPosition: convoListScrollPosition, setScrollPosition: setConvoListScrollPosition }),
        React.createElement(MainPanel, { onClose: () => onChatCreationPanelClose(true), title: lang.use('me_chat_creation_panel_title'), isOpen: isChatCreationOpen, className: "MEApp__panel" },
            React.createElement(ChatCreation, { onCreate: onChatCreated, onFailPhoneNumbers: handleFailAddingPhoneNumbers })),
        React.createElement(MainPanel, { onClose: () => onChannelCreationPanelClose(true), title: lang.use('me_new_channel'), isOpen: isChannelCreationOpen, className: "MEApp__panel" },
            React.createElement(ChannelCreation, { onCreate: onChannelCreated })),
        creatingChannelForEduModal.isActive && (React.createElement(ChannelCreationSwitchAccountModal, { onSetAccount: handleSetAccount, onRegisterAccount: registerAccount, handleClose: creatingChannelForEduModal.close }))));
    const { MessageModal, openMessageModal, closeMessageModal } = useMessageModal({ openClipCoOwnersModal });
    const { ForwardedMessageModal, isActive: isForwardedMessageModalActive, open: handleOpenForwardedMessageModal, close: handleCloseForwardedMessageModal, } = useForeignMessagesHistoryModal({
        goToMessage: openConvo,
        openClipCoOwnersModal,
    });
    /**
     * Если открылась правая панель пока открыта модалка форварда,
     * то закрываем её. В модалке кликнули на автора сообщения или на тэг
     */
    useRightPanelChange(() => {
        if (isForwardedMessageModalActive) {
            handleCloseForwardedMessageModal();
        }
    });
    const renderConvo = () => (React.createElement(ConvoMainWrapper, { dispatch: dispatch, convos: state.convos }, ({ convo, entrypoint, peerId, topPlayerType }) => {
        return (React.createElement(ConvoMain
        /**
         * Тут добавляем key, чтобы Реакт насильно убивал компонент
         * и создавал новый для рендера новой беседы.
         * Это нужно, чтобы полностью сбрасывать стейт при переходах
         * между беседами.
         */
        , { 
            /**
             * Тут добавляем key, чтобы Реакт насильно убивал компонент
             * и создавал новый для рендера новой беседы.
             * Это нужно, чтобы полностью сбрасывать стейт при переходах
             * между беседами.
             */
            key: peerId, dispatch: dispatch, convo: convo, hiddenPinnedMessages: state.hiddenPinnedMessages, entrypoint: entrypoint, stickers: state.stickers, messageReactions: state.messageReactionsConfig, stickersKeywords: state.stickersKeywords, onClose: closeConvo, openConvo: openConvo, openChannel: openChannel, canPinMore: canPinMoreConvos, convoHistoryScrollCache: convoScrollCache, convoPostponedHistoryScrollCache: convoPostponedHistoryScrollCache, onRejectChatMR: onRejectMR, topPlayerType: topPlayerType, onSetAccount: handleSetAccount, hidePlayerOnMusicPlayback: hidePlayerOnMusicPlayback, handleOpenForeignMessageModal: openMessageModal, handleCloseForeignMessageModal: closeMessageModal, onOpenForwardedMessageModal: handleOpenForwardedMessageModal, onCloseForwardedMessageModal: handleCloseForwardedMessageModal, onFailedPhoneNumbers: handleFailAddingPhoneNumbers, registerAccount: registerAccount, availableOnboardingTooltips: availableOnboardingTooltips, convoMembersLoading: state.locks.getConversationMembers.has(peerId), isCompactHistory: isCompactHistory && isWithoutBubblesTheme, openClipCoOwnersModal: openClipCoOwnersModal }));
    }));
    const renderChannel = (route) => {
        return (React.createElement(ChannelMainWrapper, { dispatch: dispatch, channelsCache: state.channels, channelId: route.channelId, postCmid: route.postCmid, onSetAccount: handleSetAccount, registerAccount: registerAccount }, ({ channel }) => (React.createElement(ChannelMain, { canPinMoreChannels: canPinMoreChannels, 
            /**
             * Тут добавляем key, чтобы Реакт насильно убивал компонент
             * и создавал новый для рендера нового канала.
             * Это нужно, чтобы полностью сбрасывать стейт при переходах
             * между каналами.
             */
            key: channel.id, channel: channel, scrollCache: channelScrollCache, scrollPostponedCache: scrollPostponedCache, postCmid: route.postCmid, commentCmid: route.commentCmid, hidePlayerOnMusicPlayback: hidePlayerOnMusicPlayback, openConvo: openConvo, openChannel: openChannel }))));
    };
    const renderScreenRoute = () => {
        switch (screenRoute.kind) {
            case 'ChannelRoute': {
                if (owner.kind === 'Group') {
                    return (React.createElement(IMGoAnalytics, { type: "im", onEvent: stats.logEvent, id: "ChannelRoute_groupOwner" },
                        React.createElement(MEAppLayout, { isCompactHistory: isCompactHistory, isPrimaryContent: true, mainPanel: renderListContent(), mainContent: React.createElement(ContentPlaceholder, { type: "channel" }) })));
                }
                const { channelId, entrypoint } = screenRoute;
                return (React.createElement(IMGoAnalytics, { type: "im_channel", id: "ChannelRoute", channelId: channelId, entrypoint: entrypoint, onEvent: stats.logEvent },
                    React.createElement(MEAppLayout, { isCompactHistory: isCompactHistory, isCollapsible: isMainPanelCollapsible, mainPanel: renderListContent(), mainContent: React.createElement(React.Fragment, null, renderChannel(screenRoute)) })));
            }
            case 'ChannelsFolderRoute': {
                return (React.createElement(IMGoAnalytics, { type: "im", onEvent: stats.logEvent, id: "ChannelsFolderRoute" },
                    React.createElement(MEAppLayout, { isCompactHistory: isCompactHistory, isPrimaryContent: true, isCollapsible: isMainPanelCollapsible, mainPanel: renderListContent(), mainContent: React.createElement(ChannelsFolderRoutePlaceholder, { setSelectedOrganiser: setSelectedOrganiser }) })));
            }
            case 'MainRoute': {
                const placeholderType = getPlaceholderType(selectedOrganiser.item);
                return (React.createElement(IMGoAnalytics, { type: "im", onEvent: stats.logEvent, id: "MainRoute" },
                    React.createElement(MEAppLayout, { isCompactHistory: isCompactHistory, isPrimaryContent: true, isCollapsible: isMainPanelCollapsible, mainPanel: renderListContent(), mainContent: React.createElement(React.Fragment, null,
                            React.createElement(ContentPlaceholder, { ...(placeholderType === 'convo'
                                    ? { type: placeholderType, onOpenChatCreation }
                                    : { type: placeholderType }) })) }),
                    !featureFlags.vkm_router_modal_unification &&
                        screenRoute.callJoinHash && (React.createElement(CallJoin, { callId: screenRoute.callJoinHash, onJoin: openMainRoute, onSetAccount: handleSetAccount, registerAccount: registerAccount })),
                    !featureFlags.vkm_router_modal_unification &&
                        screenRoute.callJoinId && (React.createElement(CallJoin, { shortId: screenRoute.callJoinId, onJoin: openMainRoute, onSetAccount: handleSetAccount, registerAccount: registerAccount })),
                    !featureFlags.vkm_router_modal_unification &&
                        screenRoute.chatJoinHash && (React.createElement(ChatInviteByExternalLinkModal, { hash: screenRoute.chatJoinHash, onSetAccount: handleSetAccount, registerAccount: registerAccount }))));
            }
            case 'ConvoRoute': {
                const { peerId, entrypoint } = screenRoute;
                return (React.createElement(IMGoAnalytics, { id: "ConvoRoute", type: "im_chat", peerId: peerId, entrypoint: entrypoint, onEvent: stats.logEvent },
                    React.createElement(MEAppLayout, { isCompactHistory: isCompactHistory, isCollapsible: isMainPanelCollapsible, mainPanel: renderListContent(), mainContent: React.createElement(React.Fragment, null,
                            renderConvo(),
                            renderSwitchSferumAccountModal(lang.use('me_chat_join_edu_account_error_caption'), lang.use('me_chat_join_edu_account_error_description'))) })));
            }
            // TODO: убрать отсюда not found route
            case 'NotFoundRoute': {
                return (React.createElement(IMGoAnalytics, { type: "im", onEvent: stats.logEvent, id: "NotFoundRoute" },
                    React.createElement(MEAppLayout, { isCompactHistory: isCompactHistory, isPrimaryContent: true, isCollapsible: true, mainPanel: renderListContent(), mainContent: React.createElement(ContentPlaceholder, { type: "convo", onOpenChatCreation: onOpenChatCreation }) })));
            }
            case 'CallJoinRoute':
            case 'CallJoinShortenedRoute':
            case 'ChatJoinRoute': {
                return null;
            }
            case 'SettingsRoute': {
                return (React.createElement(IMGoAnalytics, { type: "im_settings", id: "SettingsRoute", onEvent: stats.logEvent },
                    React.createElement(SettingsRoute, { onLogout: onLogout, foldersView: foldersView, state: state, notificationUnblockPics: notificationUnblockPics, screenRoute: screenRoute })));
            }
            case 'SpaceRoute': {
                return (React.createElement(IMGoAnalytics, { type: "im", onEvent: stats.logEvent, id: "SpaceRoute" },
                    React.createElement(SpaceScreen, { isReconnecting: state.spaceConn.status !== 'running', spacesCache: state.spaces, screenRoute: screenRoute, renderRoom: () => React.createElement("div", null) })));
            }
            case 'SpaceRoomRoute': {
                return (React.createElement(SpaceScreen, { isReconnecting: state.spaceConn.status !== 'running', spacesCache: state.spaces, screenRoute: screenRoute, renderRoom: (space, room) => {
                        switch (room.relatedEntity.kind) {
                            case 'RoomChat':
                            case 'RoomChannel':
                                const convo = Convo.safeGet(state.convos, room.relatedEntity.peerId);
                                const peer = Peer.safeGet(state.peers, room.relatedEntity.peerId);
                                return (
                                // @todo Когда оживет, добавить аналитику
                                React.createElement(RightPanelContainer, { minCompressedWidth: 550, className: "MEApp__rightPanelContainer" },
                                    React.createElement(SpaceChatMain, { key: room.id, space: space, convo: convo, variant: room.relatedEntity.kind === 'RoomChat'
                                            ? 'convo'
                                            : 'channel', peer: peer, hiddenPinnedMessages: state.hiddenPinnedMessages, withHeader: room.relatedEntity.kind === 'RoomChat', stickers: state.stickers, stickersKeywords: state.stickersKeywords, messageReactions: state.messageReactionsConfig, scrollCache: convoScrollCache, availableOnboardingTooltips: availableOnboardingTooltips })));
                            case 'RoomCall':
                            case 'RoomTribune': {
                                const convo = Convo.safeGet(state.convos, room.relatedEntity.peerId);
                                const peer = Peer.safeGet(state.peers, room.relatedEntity.peerId);
                                let roomProps;
                                if (room.relatedEntity.kind === 'RoomCall') {
                                    const call = state.spacesCalls.get(room.relatedEntity.callId);
                                    if (call) {
                                        roomProps = { call, roomEntity: room.relatedEntity };
                                    }
                                }
                                else {
                                    const tribune = state.spacesTribunes.get(room.relatedEntity.tribuneId);
                                    if (tribune) {
                                        roomProps = { tribune, roomEntity: room.relatedEntity };
                                    }
                                }
                                // Невозможный сценарий
                                if (!roomProps)
                                    return React.createElement(React.Fragment, null);
                                return (React.createElement(RightPanelContainer, { minCompressedWidth: 550, className: "SpaceChatMain__rightPanelContainer" },
                                    React.createElement(SpaceRoomCall, { space: space, roomId: room.id, peerId: room.relatedEntity.peerId, convo: convo, variant: "convo", peer: peer, stickers: state.stickers, stickersKeywords: state.stickersKeywords, hiddenPinnedMessages: state.hiddenPinnedMessages, messageReactions: state.messageReactionsConfig, scrollCache: convoScrollCache, availableOnboardingTooltips: availableOnboardingTooltips, callRoomChatAppRenderer: callRoomChatAppRenderer, ...roomProps })));
                            }
                            default:
                                return exhaustivenessCheck(room.relatedEntity);
                        }
                    } }));
            }
            default:
                /**
                 * При добавлении нового, оберни его в IMAnalytics, либо узнай у аналитика какой
                 * нужен screen поле для этого экрана и создай новый компонент
                 */
                return exhaustivenessCheck(screenRoute);
        }
    };
    const renderRightPanels = (panels) => {
        return panels.map(renderRightPanel);
    };
    const renderRightPanel = (panel) => {
        const kind = panel.kind;
        switch (kind) {
            case 'PeerPanel': {
                return (React.createElement(ConvoProfile, { key: panel.peerId, peerId: panel.peerId, peer: state.peers.get(panel.peerId), channel: Channel.isChannelId(panel.peerId)
                        ? state.channels.get(panel.peerId)
                        : undefined, goToMessage: (cmid) => {
                        switch (screenRoute.kind) {
                            case 'ConvoRoute':
                            case 'ChannelRoute':
                                navigate({
                                    kind: 'ConvoRoute',
                                    peerId: panel.peerId,
                                    cmid,
                                    entrypoint: 'shared_convos',
                                });
                                break;
                            default:
                        }
                    }, goToConvo: ({ peerId, entrypoint, postponed }) => navigate({
                        kind: 'ConvoRoute',
                        peerId,
                        entrypoint,
                        ...(postponed && { postponed }),
                    }), convo: state.convos.get(panel.peerId), onClose: pop, convoMembersLoading: state.locks.getConversationMembers.has(panel.peerId) }));
            }
            case 'ChannelPanel': {
                if (owner.kind === 'Group') {
                    return null;
                }
                return (React.createElement(IMChannelDetails, { channelId: panel.channelId, onEvent: stats.logEvent },
                    React.createElement(ChannelProfile, { key: panel.channelId, channelId: panel.channelId, onClose: pop, canPinMoreChannels: canPinMoreChannels, section: panel.section, openConvo: openConvo })));
            }
            case 'SpacePanel': {
                const space = state.spaces.get(panel.spaceId);
                if (space === null) {
                    return React.createElement(RedirectSpaceNotFound, null);
                }
                return (React.createElement(SpaceProfile, { key: panel.spaceId, spaceId: panel.spaceId, space: space, onClose: pop }));
            }
            default:
                exhaustivenessCheck(kind);
        }
    };
    const renderModalList = (modals) => {
        return modals.map((modal, index) => {
            const isHidden = index !== modals.length - 1;
            return renderModal(modal, isHidden, index);
        });
    };
    const renderModal = (modal, isHidden, index) => {
        switch (modal.kind) {
            case 'PhotoModal':
            case 'VideoModal':
                if (mediaRenderer) {
                    return mediaRenderer({
                        modal,
                        channels: state.channels,
                        convos: state.convos,
                        composerDrafts: state.composerDrafts,
                        channelComposerDrafts: state.channelComposerDrafts,
                        commentsComposerDrafts: state.commentsComposerDrafts,
                        isHidden,
                    });
                }
                return (React.createElement(MediaModalRenderer, { key: index, modal: modal, channels: state.channels, convos: state.convos, composerDrafts: state.composerDrafts, channelComposerDrafts: state.channelComposerDrafts, commentsComposerDrafts: state.commentsComposerDrafts, isHidden: isHidden, registerAccount: registerAccount, onSetAccount: setAccount }));
            case 'MiniAppModal':
                if (!isEdu && screenRoute.sferum) {
                    return (React.createElement(SwitchToSferumModal, { title: lang.use('me_switch_account_to_sferum_miniapp_modal_title'), subtitle: lang.use('me_switch_account_to_sferum_miniapp_modal_subtitle'), registerAccount: registerAccount, handleSetAccount: handleSetAccount }));
                }
                return (React.createElement(MiniAppsService, { key: index, miniAppId: modal.miniAppId, miniAppsRenderer: miniAppsRenderer, isHidden: isHidden }));
            case 'PollModal':
                return React.createElement(PollResultsModal, { key: index, pollRoute: modal });
            case 'NewFolderModal':
                return (React.createElement(FoldersModalNew, { folders: state.organisers.folders, convos: state.convos, addedPeers: modal.peerId ? [modal.peerId] : [] }));
            case 'EditFolderModal':
                return (React.createElement(FoldersModalEdit, { folderId: modal.folderId, folders: state.organisers.folders, sublists: state.organisers.sublists, locks: state.locks, convos: state.convos }));
            case 'ImportantMessagesModal':
                return (React.createElement(ImportantMessagesModal, { key: index, importantMessages: state.importantMessages, goToMessage: openConvo, onOpenMessageInModal: openMessageModal, onOpenForwardedMessageModal: handleOpenForwardedMessageModal, onCloseForwardedMessageModal: handleCloseForwardedMessageModal, openClipCoOwnersModal: openClipCoOwnersModal }));
            case 'MiniAppCatalogModal':
                return React.createElement(MiniAppsCatalogModal, { key: index });
            case 'SpaceRoomCreateModal':
            case 'SpaceRoomUpdateModal':
                const space = state.spaces.get(modal.spaceId);
                if (space === null) {
                    return React.createElement(RedirectSpaceNotFound, null);
                }
                return modal.kind === 'SpaceRoomCreateModal' ? (React.createElement(SpaceRoomCreate, { space: space, spaceId: modal.spaceId, initialSectionId: modal.sectionId, isHidden: isHidden })) : (React.createElement(SpaceRoomUpdate, { space: space, spaceId: modal.spaceId, roomId: modal.roomId, isHidden: isHidden }));
            case 'SpaceSectionCreateModal': {
                const space = state.spaces.get(modal.spaceId);
                if (space === null) {
                    return React.createElement(RedirectSpaceNotFound, null);
                }
                return (React.createElement(SpaceSectionCreateModal, { spaceId: modal.spaceId, space: space, withRoomsSelector: true, onClose: () => navigate({
                        kind: 'SpacePanel',
                        spaceId: modal.spaceId,
                    }) }));
            }
            case 'ChatInviteModal':
                return (React.createElement(ChatInviteUnifiedModal, { key: index, hash: modal.hash, onSetAccount: handleSetAccount, registerAccount: registerAccount }));
            case 'CallJoinByIdModal':
                return (React.createElement(CallJoin, { key: index, callId: modal.callId, onJoin: closeRouterModal, onSetAccount: handleSetAccount, registerAccount: registerAccount }));
            case 'CallJoinByShortIdModal':
                return (React.createElement(CallJoin, { key: index, shortId: modal.shortId, onJoin: closeRouterModal, onSetAccount: handleSetAccount, registerAccount: registerAccount }));
            default:
                return exhaustivenessCheck(modal);
        }
    };
    const renderRuntimeRoute = () => {
        if (!runtimeRoute) {
            return null;
        }
        switch (runtimeRoute.kind) {
            case 'ModalMessageRuntimeRoute':
                return (React.createElement(ModalMessage, { useModal: true, modalMessage: runtimeRoute, onForeignMessageOpen: openMessageModal, onForeignMessageClose: closeMessageModal, openClipCoOwnersModal: openClipCoOwnersModal, onOpenForwardedMessageModal: handleOpenForwardedMessageModal, onCloseForwardedMessageModal: handleCloseForwardedMessageModal }));
            case 'AudioRestrictionRuntimeRoute':
                return (React.createElement(AttachAudioRestrictionModal, { audio: runtimeRoute.audio, onClose: () => replace({ kind: 'EmptyRuntimeRoute' }) }));
            case 'SferumMigrateToMaxRoute':
                return (React.createElement(SferumOffboardingModal, { banner: runtimeRoute.banner, onClose: () => replace({ kind: 'EmptyRuntimeRoute' }) }));
            case 'RedirectRuntimeRoute':
                replace({ kind: 'EmptyRuntimeRoute' });
                return React.createElement(RedirectRuntimeRouteComponent, { url: runtimeRoute.redirectUrl });
            case 'EmptyRuntimeRoute':
                return null;
            default:
                return exhaustivenessCheck(runtimeRoute);
        }
    };
    const [hasChannelsOnboarding, setHasChannelsOnboarding] = useState(Boolean(state.helpHints.has('im:channels_onboarding') && !withNewChannels));
    const channelsOnboarding = useChannelsOnboarding({
        type: 'hasChannels', // || hasNotChannels в зависимости от того, какой из хинтов равен true
        onFinish: useCallback(() => setHasChannelsOnboarding(false), []),
    });
    const onConvoSearchMessageClick = (message) => {
        if (screenRoute.kind !== 'ConvoRoute') {
            return;
        }
        replace({
            ...screenRoute,
            search: isOneColumnLayout || isMobileLayout ? undefined : screenRoute.search,
            cmid: message.cmid,
        });
    };
    const withVerticalFolders = hasFolders(owner, state.organisers.folders) &&
        isVerticalFoldersView(state.viewer.settings, isTwoColumnLayout, foldersView);
    const isSettingsRoute = screenRoute.kind === 'SettingsRoute';
    useEffect(() => {
        switch (true) {
            case featureFlags.vkm_prds: {
                $containerRef.current?.style.setProperty('--aside_panel_width', 'var(--aside_spaces_width)');
                break;
            }
            case withVerticalFolders: {
                $containerRef.current?.style.setProperty('--aside_panel_width', 'var(--aside_folders_width)');
                break;
            }
            default: {
                $containerRef.current?.style.removeProperty('--aside_panel_width');
                break;
            }
        }
    }, [featureFlags.vkm_prds, withVerticalFolders]);
    return (React.createElement(RightPanelContextProvider, { containerRef: $containerRef },
        React.createElement("div", { className: classnames('MEApp MEAppConfig MEConfig', {
                'MEApp--one-column': isOneColumnLayout,
                'MEApp--mobile': isMobileLayout,
                'MEApp--mobileSafari': isMobileLayout && browser.safari_mobile,
                MEAppConfig__withoutBubbles: isWithoutBubblesTheme,
            }), ref: $containerRef },
            featureFlags.vkm_prds && !isSettingsRoute && owner.kind !== 'Group' ? (React.createElement("div", { className: "MEApp__aside" },
                React.createElement("div", { className: "MEApp__aside-inner" },
                    React.createElement(SpacesNavbar, { spacesCache: state.spaces, 
                        // SPC-TODO Разобраться какой каунтер показывать, замьюченные или всех
                        totalUnreadCount: state.organisers.filters.all.unreadUnmutedCount, menu: burgerMenu })))) : (React.createElement(CSSTransition, { in: !isSettingsRoute && withVerticalFolders, timeout: 300, classNames: "MEApp__aside--slide", unmountOnExit: true },
                React.createElement("div", { className: "MEApp__aside" },
                    React.createElement("div", { className: "MEApp__aside-inner" },
                        React.createElement(OrganisersViewVertical, { channelsCount: state.organisers.channelFilters.all.unreadCount, channelsPrimaryCount: state.organisers.channelFilters.all.unreadUnmutedCount, folders: state.organisers.folders, items: convoOrganiserToggles, activeIndex: convoOrganiserToggles.findIndex((item) => Organisers.isEqual(selectedOrganiser.item, item.organiser)), onSelectOrganiser: setSelectedOrganiser, onClickSettings: handleFoldersSettingsClick }))))),
            React.createElement("div", { className: "MEApp__route" },
                (isMobileLayout || isOneColumnLayout) && (React.createElement("div", { className: "MEApp__contentShiftFix" })),
                renderScreenRoute(),
                React.createElement(ConvoSearch, { onMessageClick: onConvoSearchMessageClick }),
                owner.kind !== 'Group' && (React.createElement(ChannelSearch, { onPostClick: (post) => {
                        if (screenRoute.kind !== 'ChannelRoute') {
                            return;
                        }
                        navigate({
                            kind: 'ChannelRoute',
                            channelId: post.channelId,
                            postCmid: post.cmid,
                            search: isOneColumnLayout || isMobileLayout
                                ? undefined
                                : screenRoute.search,
                        });
                    } })),
                owner.kind === 'Group' &&
                    !IRouter.isEnabledWithCommunity(screenRoute) && (React.createElement(UnifiedServiceModal, { title: lang.use('me_community_unsupported_link_title'), subtitle: lang.use('me_community_unsupported_link_subtitle'), image: React.createElement(AttentionImage, null), footer: React.createElement(Button, { size: "l", stretched: true, onClick: () => handleSetAccount(state.viewer.id, false) }, lang.use('me_community_unsupported_link_text')), handleModalClose: () => navigate({ kind: 'MainRoute' }) })))),
        MessageModal,
        ForwardedMessageModal,
        featureFlags.vkm_clip_co_owners_modal &&
            clipCoOwnersBoxRenderer &&
            isClipCoOwnersModalActive && (React.createElement(ClipCoOwnersModal, { activeClipId: coOwnersModalClipId, close: closeClipCoOwnersModal })),
        failedPhoneNumbersModal.isActive && (React.createElement(FailedPhoneNumbersModal, { phoneNumbers: failedPhoneNumbers, onClose: handleFailedPhoneNumbersClose })),
        rejectMRConfirmationModal,
        React.createElement(ChannelsOnboarding, { ...channelsOnboarding }),
        renderRightPanels(screenRoute.rp || []),
        renderModalList(screenRoute.modal || []),
        renderRuntimeRoute(),
        selectedPeer && (React.createElement(VKNotifications, { peerId: selectedPeer.peerId, className: "MEApp__BotNotification" })),
        React.createElement(BotKeyboardAlert, null),
        React.createElement(Symbols, null),
        phoneJoinModal.isActive && phoneJoin.modal));
};
function useCollapsibleMainPanel({ openContainer, closeContainer, changeSettings, selectedOrganiser, isContactsOpen, isChatCreationOpen, isChannelCreationOpen, isSearching, }) {
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const [isOpened, settings] = useMemo(() => {
        const isOpenedWithoutButton = isContactsOpen ||
            isChatCreationOpen ||
            isChannelCreationOpen ||
            isSearching ||
            (isCommunityMessaging && !isEdu) ||
            !['all', 'chats', 'unread'].includes(selectedOrganiser.item.filter);
        if (isOpenedWithoutButton) {
            return [
                true,
                {
                    button: false,
                    resize: false,
                },
            ];
        }
        return [
            false,
            {
                button: true,
                resize: true,
            },
        ];
    }, [
        isChannelCreationOpen,
        isChatCreationOpen,
        isCommunityMessaging,
        isContactsOpen,
        isEdu,
        isSearching,
        selectedOrganiser.item.filter,
    ]);
    useLayoutEffect(() => {
        if (isOpened) {
            openContainer();
        }
        else {
            closeContainer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpened]);
    useLayoutEffect(() => {
        changeSettings(settings);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings]);
}
function useConvoOrganiserToggles(selectedOrganiserFilter) {
    const { lang } = useBrowserEnv();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const organisers = useOrganisers();
    return useMemo(() => {
        if (isCommunityMessaging && !isEdu) {
            return [
                {
                    name: lang.use('me_folder_list_all'),
                    organiser: { kind: 'filters', filter: 'all' },
                    count: organisers.filters.all.unreadCount,
                    primaryCount: organisers.filters.all.unreadUnmutedCount,
                },
                {
                    name: lang.use('me_filter_list_unread'),
                    organiser: { kind: 'filters', filter: 'unread' },
                    count: organisers.filters.all.unreadCount,
                    primaryCount: organisers.filters.all.unreadUnmutedCount,
                },
                {
                    name: lang.use('me_filter_list_important'),
                    organiser: { kind: 'filters', filter: 'important' },
                    count: organisers.filters.important.totalCount,
                    primaryCount: 0,
                },
                {
                    name: lang.use('me_filter_list_unanswered'),
                    organiser: { kind: 'filters', filter: 'unanswered' },
                    count: organisers.filters.unanswered.totalCount,
                    primaryCount: 0,
                },
                {
                    name: lang.use('me_filter_list_ad_tag'),
                    organiser: { kind: 'filters', filter: 'adTag' },
                    count: organisers.filters.adTag.totalCount,
                    primaryCount: 0,
                },
            ];
        }
        return [
            {
                name: lang.use('me_folder_list_all'),
                organiser: {
                    kind: 'filters',
                    filter: selectedOrganiserFilter === 'unread' ? 'unread' : 'all',
                },
                count: organisers.filters.all.unreadCount,
                primaryCount: organisers.filters.all.unreadUnmutedCount,
            },
            ...organisers.folders.map((folder) => ({
                name: folder.name,
                organiser: {
                    kind: 'folders',
                    id: folder.id,
                    type: folder.type,
                    filter: selectedOrganiserFilter === 'unread' ? 'unread' : 'all',
                },
                count: folder.unreadCount,
                primaryCount: folder.unreadUnmutedCount,
            })),
        ];
    }, [
        isCommunityMessaging,
        isEdu,
        lang,
        organisers.filters.adTag.totalCount,
        organisers.filters.all.unreadCount,
        organisers.filters.all.unreadUnmutedCount,
        organisers.filters.important.totalCount,
        organisers.filters.unanswered.totalCount,
        organisers.folders,
        selectedOrganiserFilter,
    ]);
}
const RedirectRuntimeRouteComponent = ({ url }) => {
    useEffect(() => {
        window.open(url);
    }, [url]);
    return null;
};
export const MEAppLayout = ({ mainPanel, mainContent, isCompactHistory, isPrimaryContent = false, isCollapsible = false, isCompact = false, }) => {
    const { vkm_unloadable_layout } = useFeatureFlags();
    const { isMobileLayout, isOneColumnLayout, isTwoColumnLayout } = useLayoutData();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const defaultImagesLayout = useImagesLayout();
    const withoutBubblesCompactHistoryImagesLayout = useRef({
        width: 190,
        minHeight: 50,
        maxSingleHeight: 250,
        preferredRatio: 1,
    });
    const imagesLayout = isWithoutBubblesTheme && isCompactHistory
        ? withoutBubblesCompactHistoryImagesLayout.current
        : defaultImagesLayout;
    const shouldShowConvoList = !vkm_unloadable_layout || isTwoColumnLayout || isPrimaryContent;
    const shouldShowMainContent = !vkm_unloadable_layout || isTwoColumnLayout || !isPrimaryContent;
    return (React.createElement(ImagesLayoutProvider, { value: imagesLayout },
        shouldShowConvoList && (React.createElement(MEAppMainPanel, { isCollapsible: isCollapsible && isTwoColumnLayout, classNames: classnames('MEApp__mainPanel', {
                'MEApp__mainPanel--primary': isPrimaryContent,
                'MEApp__mainPanel--compact': isCompact,
                MEApp__oneColumn: isOneColumnLayout,
                MEApp__mobile: isMobileLayout,
            }) }, mainPanel)),
        shouldShowMainContent && (React.createElement("div", { className: cx('MEApp__content', {
                'MEApp__content--switch': !vkm_unloadable_layout,
            }), "data-testid": "me_main_content" }, mainContent))));
};
const EMPTY_GROUPS_ARRAY = [];
const useGroups = (availableActions) => {
    const featureFlags = useFeatureFlags();
    const peers = usePeers();
    if (!featureFlags.me_community_messages_enabled) {
        return EMPTY_GROUPS_ARRAY;
    }
    if (!availableActions.has('groups')) {
        return EMPTY_GROUPS_ARRAY;
    }
    return Array.from(peers.values()).reduce((acc, peer) => {
        if (peer.kind === 'Group' &&
            peer.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */ &&
            peer.canMessage) {
            acc.push(peer);
        }
        return acc;
    }, []);
};
//# sourceMappingURL=MEApp.js.map