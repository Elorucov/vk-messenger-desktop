import '../../ui/ConvoMain/ConvoMain.css';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState, } from 'react';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Message from '../../../core/model/Message';
import * as Post from '../../../core/model/Post';
import * as Viewer from '../../../core/model/Viewer';
import * as Comment from '../../../core/model/Comment';
import * as ThemeStyle from '../../../core/model/ThemeStyle';
import { ComposerSelectingPostponed, ComposerSelectingNormal, } from '../../ui/ComposerSelecting/ComposerSelecting';
import { ConvoHeader } from '../../ui/ConvoHeader/ConvoHeader';
import { useBrowserEnv, useFeatureFlags, usePeers, useOwner, useOnChange, useInsertIntoCache, useViewer, useCommunityMessagingWithToggle, useUserDetails, } from '../../hooks/misc';
import { useBotKeyboard } from '../../hooks/useBotKeyboard';
import { ConvoBanner } from '../../ui/ConvoBanner/ConvoBanner';
import { ConvoPinnedMessage } from '../../ui/ConvoPinnedMessage/ConvoPinnedMessage';
import { ConvoMainActionsMenu, } from '../../ui/ConvoMainActionsMenu/ConvoMainActionsMenu';
import { ComposerBlocked } from '../../ui/ComposerBlocked/ComposerBlocked';
import { ConvoAttachments } from '../../ui/ConvoAttachments/ConvoAttachments';
import { exhaustivenessCheck, isNonEmptyArray, noop, } from '../../../core/utils/misc';
import { useModuleKeyBoardHandlers } from '../../hooks/useKeyBoardHandlers';
import { DropAreaProvider } from '../../ui/DropArea/DropArea';
import { useConvoRoute, useRouter } from '../../ui/Router/Router';
import { applyParentRouteParam } from '../../../data/env/Router';
import { useSelectedMessages } from '../../hooks/useSelectedMessages';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { getOwnerGroupId } from '../../../data/store/State';
import { Button } from '@vkontakte/vkui';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useComposerDraft, useComposerPostponedDraft, } from '../../hooks/useComposerDraft';
import * as ComposerDraft from '../../../core/model/ComposerDraft';
import { ChatInviteByLinkModal } from '../../ui/ChatInviteModal/ChatInviteByLinkModal';
import { UserChatInvite } from '../../ui/UserChatInvite/UserChatInvite';
import { useConvoClear } from '../../hooks/useConvoClear';
import { useConvoLeave } from '../../hooks/useConvoLeave';
import cx from 'classnames';
import { ConvoHopNavigation, ConvoPostponedHopNavigation, } from '../../ui/ConvoHopNavigation/ConvoHopNavigation';
import { ChatInviteUsersModal } from '../../ui/ChatInviteUsersModal/ChatInviteUsersModal';
import { ChatInviteByMRPanel } from '../../ui/ChatInviteModal/ChatInviteByMRPanel';
import { SharedConvosPicker } from '../../ui/SharedConvosPicker/SharedConvosPicker';
import { CallJoin } from '../../ui/CallJoin/CallJoin';
import { ChatCreation } from '../../ui/ChatCreation/ChatCreation';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { useMessagesForward } from '../../hooks/useMessagesForward';
import { ConvoActiveCallBanner } from '../../ui/ConvoActiveCallBanner/ConvoActiveCallBanner';
import { ConvoTopPlayer, } from '../../ui/ConvoTopPlayer/ConvoTopPlayer';
import { BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import { useConvoDisableBusinessNotify } from '../../hooks/useConvoDisableBusinessNotify';
import { ConvoComposer } from '../../ui/ConvoComposer/ConvoComposer';
import { RightPanelContainer } from '../../ui/RightPanel/RightPanelContainer';
import { ConvoHistory, } from '../../ui/ConvoHistory/ConvoHistory';
import { useHandleConvoLoadingFailed } from '../../hooks/useHandleConvoLoadingFailed';
import { MarusiaComposer } from '../../ui/MarusiaComposer/MarusiaComposer';
import * as History from '../../../core/model/History';
import { useDropAreaState } from '../../ui/DropArea/useDropAreaState';
import { ForwardModal } from '../../ui/ForwardModal/ForwardModal';
import { fromApiMessage } from '../../../data/converter/MessageConverter';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { ReportConvoMessageModal } from '../../ui/ReportModal/ReportModal';
import { useConvoReplyChain } from '../../hooks/useConvoReplyChain';
import { useConvoDelete } from '../../hooks/useConvoDelete';
import { StickersPopupRootContainer } from '../../ui/StickersPopupRootContainer/StickersPopupRootContainer';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { PopupStickerService } from '@vkontakte-internal/stickers-kit';
import { IPerfStats } from '../../../data/env/IPerfStats';
import { isInputElementActive } from '../../utils/misc';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useHistoryKeyboardFocusNavigationState } from '../../hooks/useHistoryKeyboardFocusNavigationState';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { ConvoHistoryScheduleFootnote } from '../../ui/ConvoHistoryScheduleFootnote/ConvoHistoryScheduleFootnote';
import { PopupAnimationObserverProvider } from '@vkontakte-internal/stickers-kit';
import { PopupAnimationDeductibleElementWrapper } from '../../ui/PopupAnimationDeductibleElementWrapper/PopupAnimationDeductibleElementWrapper';
import { useApiFetch } from '../../hooks/useApiFetch';
import { ConvoPostponedHeader } from '../../ui/ConvoPostponedHeader/ConvoPostponedHeader';
import { ConvoHistoryPlaceholder } from '../../ui/ConvoHistoryPlaceholder/ConvoHistoryPlaceholder';
import { IApi } from '../../../data/env/IApi';
import { API_ERROR_MESSAGES_CHAT_WAS_DELETED } from '@vkontakte-internal/api-schema-typescript';
import { Icon24CheckCircleOutline, Icon28ErrorCircleOutline, } from '@vkontakte/icons';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useTagManager } from '../../hooks/useTagManager';
import { Placeholder, RichAvatar } from '@vkontakte-internal/vkcom-kit';
import { ConvoBlockGroupBanner } from '../../ui/ConvoBlockGroupBanner/ConvoBlockGroupBanner';
import { ConvoNoConversationGroupBanner } from '../../ui/ConvoNoConversationGroupBanner/ConvoNoConversationGroupBanner';
import { ConvoUserInfoBanner } from '../../ui/ConvoUserInfoBanner/ConvoUserInfoBanner';
import { GroupBanUserModal } from '../../ui/GroupBanUserModal/GroupBanUserModal';
import { GroupUnbanUserModal } from '../../ui/GroupBanUserModal/GroupUnbanUserModal';
import { useSferumOffboarding } from '../../hooks/useSferumOffboarding';
import { SferumConvoMigratedListBanner } from '../../ui/SferumConvoMigratedListBanner/SferumConvoMigratedListBanner';
export const ConvoMain = React.memo(function ConvoMain({ dispatch, convo, hiddenPinnedMessages, entrypoint, onClose, stickers, stickersKeywords, messageReactions, openConvo, openChannel, canPinMore, convoHistoryScrollCache, convoPostponedHistoryScrollCache, convoLoadingFailed, onRejectChatMR, topPlayerType, onSetAccount, hidePlayerOnMusicPlayback, handleOpenForeignMessageModal, handleCloseForeignMessageModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, onFailedPhoneNumbers, registerAccount, availableOnboardingTooltips, isCompactHistory, openClipCoOwnersModal, }) {
    const { lang, videoMessagePlayer, perfStats, router, analyticsAppName, envFeatureFlags, } = useBrowserEnv();
    const apiFetch = useApiFetch();
    /**
     * Реф конвы используем в функциях обработчиках, которые прокидываем
     * в ConvoMessage или Composer.
     * Это нужно для оптимизации, чтобы не триггерить их ререндеры при
     * изменении convo. Особенно часто она меняется при прочтении сообщений.
     */
    const convoRef = useRef(convo);
    convoRef.current = convo;
    const peers = usePeers();
    const owner = useOwner();
    const { profileType, id: viewerId, settings } = useViewer();
    const insertIntoCache = useInsertIntoCache();
    const featureFlags = useFeatureFlags();
    const { navigate, replace, screenRoute } = useRouter();
    useSferumOffboarding('group_chat', convo.kind === 'ChatConvo');
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const convoHistory = Convo.getHistory(convo, false);
    const postponedConvoHistory = Convo.getHistory(convo, true);
    const { selected, handleSelectMessage, handleCancelSelecting } = useSelectedMessages(convoHistory);
    const { selected: selectedPostponed, handleSelectMessage: handleSelectPostponedMessage, handleCancelSelecting: handleCancelPostponedSelecting, } = useSelectedMessages(postponedConvoHistory);
    const { peerId } = convo;
    const modalGroup = useModalGroup();
    const createNewChatFromCurrentModal = useModal(modalGroup.id);
    const pinDialogErrorModal = useModal();
    const snackbar = useSnackbar();
    const attachmentsModalTitleId = useId();
    const { isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const [isChatCreating, setIsChatCreating] = useState(false);
    const [messageForReport, setMessageForReport] = useState([]);
    const $onceOnMount = useRef(true);
    useEffect(() => {
        $onceOnMount.current = false;
    }, []);
    const { isMobileLayout } = useLayoutData();
    const [showBirthdayStickers, setShowBirthdayStickers] = useState(false);
    const convoRoute = useConvoRoute();
    const $historyVisibleNodes = useRef();
    const onVisibleNodesChange = useCallback((nodes) => {
        $historyVisibleNodes.current = nodes;
    }, []);
    const isPostponedScreen = envFeatureFlags.isPostponedMessagesAvailable &&
        screenRoute.kind === 'ConvoRoute' &&
        Boolean(screenRoute.postponed);
    const draft = useComposerDraft(peerId);
    const postponedDraft = useComposerPostponedDraft(peerId);
    const currentDraft = isPostponedScreen ? postponedDraft : draft;
    const convoReplyChain = useConvoReplyChain();
    const scrollCache = isPostponedScreen
        ? convoPostponedHistoryScrollCache
        : convoHistoryScrollCache;
    const { setFocusItem } = scrollCache;
    const userInfo = useUserDetails(peerId);
    const { isThemed, themeAppearance, themeBackground, isContrastTheme } = useCurrentThemeStyle({
        forceThemeStyleId: convo.styleId !== ThemeStyle.SYSTEM_STYLE_ID &&
            settings.showThemeStyles
            ? convo.styleId
            : undefined,
    });
    const setFocusMessage = useCallback((cmid) => {
        setFocusItem(convo.peerId, {
            kind: 'Normal',
            cmid,
            align: 'upper',
            // Отступ на высоту даты
            margin: 40,
            highlight: true,
            shouldMoveFocus: true,
        });
    }, [convo.peerId, setFocusItem]);
    const isEdu = Viewer.isEdu(profileType);
    const isCasperConvo = Convo.isCasper(convo);
    const hideAudioPlayer = hidePlayerOnMusicPlayback && topPlayerType === 'audio';
    const scrollHistoryToBottom = useCallback(() => {
        if (convoRoute.cmid) {
            navigate({ ...convoRoute, cmid: undefined });
        }
        setFocusItem(convo.peerId, {
            kind: 'bottom',
        });
    }, [navigate, convoRoute, convo.peerId, setFocusItem]);
    const { isKeyboardOpened, setKeyboardOpened, handleKeyboardSend, handleCallbackButtonClick, } = useBotKeyboard({
        entrypoint,
        convo,
        authorPeer: convo.currentKeyboard &&
            Peer.safeGet(peers, convo.currentKeyboard.authorId),
        onSend: scrollHistoryToBottom,
    });
    const forwardToConvoPickerModal = useModal();
    const forward = useMessagesForward({
        draft: currentDraft,
        peerId,
    });
    /**
     * Сохраняем forward.setBufferMessages в отдельную переменную для
     * оптимизации ререндеров ConvoMessage при изменении драфтов сообщений.
     */
    const setForwardBufferMessages = forward.setBufferMessages;
    const onMessageForward = useCallback((message) => {
        setForwardBufferMessages([message]);
        forwardToConvoPickerModal.open();
    }, [setForwardBufferMessages, forwardToConvoPickerModal]);
    const { ConvoClearConfirmModal, handleConvoClearAction } = useConvoClear();
    const { ConvoLeaveConfirmModal, handleConvoLeaveAction } = useConvoLeave();
    const { ConvoDeleteConfirmModal, handleConvoDeleteAction } = useConvoDelete();
    const { ConvoDisableBusinessNotifyModal, handleConvoDisableBusinessNotifyAction, } = useConvoDisableBusinessNotify();
    const { onOpen: handleOpenTagManager, tagManagerModal } = useTagManager();
    const onForwardSelectedHere = useCallback(() => {
        if (!isNonEmptyArray(selected)) {
            return;
        }
        forward.onTargetSelected(convo.peerId, selected);
        handleCancelSelecting();
        setKeyboardOpened(false);
    }, [
        forward,
        selected,
        convo.peerId,
        setKeyboardOpened,
        handleCancelSelecting,
    ]);
    const onForwardToConvoPicked = useCallback((peerIds) => {
        if (peerIds[0] === undefined) {
            return;
        }
        let selectedPeerId = peerIds[0];
        if (Peer.isContactPeerId(selectedPeerId)) {
            const contactPeer = peers.get(selectedPeerId);
            if (contactPeer?.kind === 'Contact' && contactPeer.userId) {
                selectedPeerId = contactPeer.userId;
            }
        }
        if (isNonEmptyArray(selected)) {
            forward.onTargetSelected(selectedPeerId, selected);
            handleCancelSelecting();
        }
        else {
            forward.onTargetSelected(selectedPeerId);
        }
        forwardToConvoPickerModal.close();
        openConvo({
            peerId: selectedPeerId,
            entrypoint: 'forward_messages_target',
        });
        dispatch({
            type: 'UserChangedConvo',
            userAction: 'hide_bot_keyboard',
            peerId: selectedPeerId,
        });
    }, [
        peers,
        forward,
        openConvo,
        selected,
        forwardToConvoPickerModal,
        dispatch,
        handleCancelSelecting,
    ]);
    const attachmentsModal = useModal();
    const sharedConvosModal = useModal();
    const reportModal = useModal();
    const userBanConfirmationModal = useModal();
    const groupBanUserConfirmationModal = useModal();
    const groupUnbanUserConfirmationModal = useModal();
    const blockGroupConfirmationModal = useModal();
    const userUnbanConfirmationModal = useModal();
    const [showChatInvitation, setShowChatInvitation] = useState(false);
    const [isHopNavigationUnreadVisible, setIsHopNavigationUnreadVisible] = useState(false);
    const peer = Peer.safeGet(peers, peerId);
    useHandleContactConverted(peer);
    const handleConvoLoadingFailed = () => replace({ kind: 'MainRoute' });
    useHandleConvoLoadingFailed(handleConvoLoadingFailed, peerId, convoLoadingFailed);
    const handleConvoHeaderClickSearch = useCallback(() => {
        navigate({
            ...convoRoute,
            search: convoRoute.search === undefined ? '' : undefined,
        });
    }, [navigate, convoRoute]);
    const [chatInviteUserShown, setChatInviteUserShown] = useState(false);
    const ref = useRef(null);
    const { dropAreaState, handleDragEnter, hideDropArea } = useDropAreaState();
    const handleBottomIdentCross = useCallback((isCrossed) => {
        setIsHopNavigationUnreadVisible(!isCrossed);
    }, []);
    useEffect(() => {
        return () => {
            const isVideoMessagePlayerPlaying = videoMessagePlayer.getState().status === 'playing';
            if (isVideoMessagePlayerPlaying) {
                videoMessagePlayer.stop();
            }
        };
        // при переходах между беседами останавливаем воспроизведение видео-сообщений
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [peerId]);
    const scrollToMessage = useCallback(async ({ cmid, peerId, rootCmid, entrypoint }) => {
        if (convoRoute.peerId === peerId && convoRoute.cmid === cmid) {
            setFocusMessage(cmid);
        }
        else {
            navigate(applyParentRouteParam(convoRoute, {
                ...convoRoute,
                peerId,
                cmid,
                entrypoint: entrypoint || convoRoute.entrypoint,
                postponed: undefined,
            }));
        }
        if (rootCmid !== undefined) {
            convoReplyChain.pushItem(rootCmid);
        }
    }, [convoRoute, navigate, setFocusMessage, convoReplyChain]);
    const handleHopNavigationUnreadClick = useCallback(() => {
        if (!$historyVisibleNodes.current) {
            // Невозможный сценарий
            return;
        }
        const { upper: upperNode, bottom: bottomNode } = $historyVisibleNodes.current;
        if (upperNode.kind === 'PendingNode') {
            // Если upperNode 'PendingNode' — очищаем convoReplyChain
            convoReplyChain.clearItems();
        }
        else {
            // Получаем replyCmid из ConvoReplyChain только, если он после upperNode,
            // чтобы пользователя всегда перемещало вниз, а не откинуло наверх
            const replyCmid = convoReplyChain.popItem(History.nodeCmid(upperNode));
            if (replyCmid) {
                return scrollToMessage({
                    cmid: replyCmid,
                    peerId: convoRoute.peerId,
                });
            }
        }
        const scrollTo = convo.unreadCount > 0 &&
            bottomNode.kind !== 'PendingNode' &&
            // Если нижнее видимое сообщение более раннее, чем непрочитанные,
            // то скроллим к непрочитанным.
            History.nodeCmid(bottomNode) < convo.inReadBy
            ? { kind: 'unread-separator', shouldMoveFocus: true }
            : { kind: 'bottom', shouldMoveFocus: true };
        if (convoRoute.cmid) {
            navigate({ ...convoRoute, cmid: undefined });
        }
        setFocusItem(peerId, scrollTo);
    }, [
        convoReplyChain,
        peerId,
        convo.unreadCount,
        convo.inReadBy,
        convoRoute,
        scrollToMessage,
        navigate,
        setFocusItem,
    ]);
    const firstUnreadMentionCmid = convo.kind === 'ChatConvo'
        ? Convo.getFirstUnreadMentionCmid(convo)
        : undefined;
    const handleHopNavigationMentionsClick = useCallback(() => {
        if (!firstUnreadMentionCmid) {
            return;
        }
        if (convoRoute.cmid) {
            navigate({ ...convoRoute, cmid: undefined });
        }
        setFocusMessage(firstUnreadMentionCmid);
    }, [firstUnreadMentionCmid, convoRoute, navigate, setFocusMessage]);
    const firstUnreadReactionCmid = Convo.firstUnreadReactionCmid(convo);
    const handleHopNavigationReactionsClick = useCallback(() => {
        if (!firstUnreadReactionCmid) {
            return;
        }
        if (convoRoute.cmid) {
            navigate({ ...convoRoute, cmid: undefined });
        }
        setFocusMessage(firstUnreadReactionCmid);
    }, [firstUnreadReactionCmid, convoRoute, navigate, setFocusMessage]);
    const { isNavigating, composerHandleRef, controlHandleRef, setIsNavigating, } = useHistoryKeyboardFocusNavigationState();
    const onKeyDown = useCallback((keyCombo, event) => {
        switch (keyCombo) {
            case 'ArrowUp':
                setIsNavigating(true);
                if (!controlHandleRef.current) {
                    break;
                }
                controlHandleRef.current.focusPrev().catch(noop);
                break;
            case 'ArrowDown':
                setIsNavigating(true);
                if (!controlHandleRef.current) {
                    break;
                }
                controlHandleRef.current.focusNext().catch(noop);
                break;
            case 'Escape': {
                event.preventDefault();
                event.stopPropagation();
                if (!isPostponedScreen && selected.length > 0) {
                    handleCancelSelecting();
                    break;
                }
                else if (isPostponedScreen && selectedPostponed.length > 0) {
                    handleCancelPostponedSelecting();
                    break;
                }
                if (isNavigating) {
                    // Если композер доступен, возвращаем фокус ему.
                    if (composerHandleRef.current) {
                        composerHandleRef.current.focus();
                        setIsNavigating(true);
                        break;
                    }
                    // Если нет, выходим из режима навигации.
                    setIsNavigating(false);
                    break;
                }
                onClose();
                break;
            }
            case 'Tab': {
                if (isNavigating || !controlHandleRef.current) {
                    break;
                }
                event.preventDefault();
                setIsNavigating(true);
                controlHandleRef.current.focusLast().catch(noop);
                break;
            }
            case 'Backspace': {
                if (isInputElementActive()) {
                    break;
                }
                event.stopPropagation();
                event.preventDefault();
                if (convoRoute.parentRoute) {
                    navigate(convoRoute.parentRoute);
                }
                else {
                    navigate({ kind: 'MainRoute' });
                }
                break;
            }
            default:
                break;
        }
    }, [
        convoRoute.parentRoute,
        handleCancelSelecting,
        navigate,
        onClose,
        selected.length,
        composerHandleRef,
        controlHandleRef,
        isNavigating,
        setIsNavigating,
        handleCancelPostponedSelecting,
        isPostponedScreen,
        selectedPostponed.length,
    ]);
    const { subscribeKeyDown, focusHandlerElement } = useModuleKeyBoardHandlers({
        moduleName: 'ConvoMain',
        handlerElementRef: ref,
    });
    useEffect(() => subscribeKeyDown(onKeyDown), [onKeyDown, subscribeKeyDown]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => focusHandlerElement(), []);
    const handleSeenMessages = useCallback((fromCmid, toCmid) => {
        dispatch({
            type: 'UserSeenMessages',
            fromCmid,
            toCmid,
            peerId,
            analyticsAppName,
        });
    }, [analyticsAppName, dispatch, peerId]);
    const lastEditableMessage = Convo.lastEditableMessage(convo);
    const lastEditablePostponedMessage = Convo.lastEditablePostponedMessage(convo);
    const handleEdit = useCallback(() => {
        if (isPostponedScreen && lastEditablePostponedMessage) {
            dispatch({
                type: 'UserChangedComposerDraft',
                kind: 'editing',
                editing: lastEditablePostponedMessage,
                peerId,
                isPostponed: true,
            });
        }
        else if (!isPostponedScreen && lastEditableMessage) {
            dispatch({
                type: 'UserChangedComposerDraft',
                kind: 'editing',
                editing: lastEditableMessage,
                peerId,
                isPostponed: false,
            });
        }
    }, [
        isPostponedScreen,
        lastEditablePostponedMessage,
        lastEditableMessage,
        dispatch,
        peerId,
    ]);
    /**
     * TODO: поднять на уровень app
     */
    const handleSend = useCallback((text, attaches, extra) => {
        const isPostponedMessage = !!extra.delayedUntil;
        if (perfStats) {
            perfStats.removeEvent(IPerfStats.EventType.receiveMessage);
            perfStats.addEvent(IPerfStats.EventType.receiveMessage, {
                peerIds: [peerId],
                data: {
                    sendClick: perfStats.getCurrentTime(),
                },
            });
        }
        const { editing, reply } = currentDraft;
        let forward = ComposerDraft.getNormalForward(currentDraft, "message" /* ComposerDraft.ForwardKind.Message */);
        let forwardedChannelPost = currentDraft.forward?.kind === 'post'
            ? currentDraft.forward.items[0]
            : undefined;
        let forwardPostComment = currentDraft.forward?.kind === 'comment'
            ? currentDraft.forward.items[0]
            : undefined;
        const hasStickerAttach = !!attaches.sticker || !!attaches.ugcSticker;
        // Не отправляем форвард, так как его нельзя использовать со стикером
        if (hasStickerAttach) {
            forward = undefined;
            forwardedChannelPost = undefined;
            forwardPostComment = undefined;
        }
        const hasMessageForwards = currentDraft.forward?.kind === 'message';
        let messageRefParams = {
            ref: undefined,
            refSource: undefined,
        };
        if (screenRoute.kind === 'ConvoRoute') {
            messageRefParams = {
                ref: screenRoute.ref,
                refSource: screenRoute.refSource,
            };
        }
        if (editing && !hasStickerAttach && editing.isPostponed) {
            dispatch({
                type: 'UserHitEditPostponed',
                cmid: editing.cmid,
                text,
                attaches,
                peerId,
                keepForwarded: Boolean(hasMessageForwards),
                formatData: extra.formatData,
                postponedTime: editing.sentAt,
            });
            return;
        }
        if (editing &&
            !editing.isPostponed &&
            Message.isEditable(editing, Date.now()) &&
            !hasStickerAttach) {
            dispatch({
                type: 'UserHitEdit',
                cmid: editing.cmid,
                text,
                attaches,
                peerId,
                keepForwarded: Boolean(reply || hasMessageForwards),
                formatData: extra.formatData,
            });
            return;
        }
        let postAttaches;
        if (forwardedChannelPost) {
            if (Post.isFromCommunityChannel(forwardedChannelPost)) {
                postAttaches = { channelMessage: forwardedChannelPost };
            }
            else {
                postAttaches = { wall: Post.toWallAttach(forwardedChannelPost) };
            }
        }
        else {
            postAttaches = {};
        }
        dispatch({
            type: 'UserHitSend',
            entrypoint,
            text,
            attaches: {
                ...attaches,
                ...postAttaches,
                ...(forwardPostComment
                    ? {
                        wallReply: Comment.toWallReplyAttach(forwardPostComment),
                    }
                    : {}),
            },
            timestamp: Date.now(),
            peerId,
            extra: {
                ...extra,
                ...messageRefParams,
            },
            forwarded: forward,
            analyticsAppName,
            deleteTTL: isCasperConvo
                ? Convo.CASPER_MESSAGE_DELETE_TTL
                : undefined,
            reply: reply?.kind === 'Normal' ? reply : undefined,
            communityAdminId: isCommunityMessaging ? viewerId : undefined,
        });
        if (screenRoute.kind === 'ConvoRoute' &&
            (screenRoute.ref || screenRoute.refSource)) {
            router.replace({
                ...screenRoute,
                ref: undefined,
                refSource: undefined,
            });
        }
        if (reply && hasStickerAttach) {
            dispatch({
                type: 'UserChangedComposerDraft',
                kind: 'reply',
                reply: undefined,
                peerId,
                isPostponed: isPostponedScreen,
            });
        }
        const needSwitchIntoPostponedScreen = isPostponedMessage && !isPostponedScreen;
        if (needSwitchIntoPostponedScreen) {
            router.push({
                kind: 'ConvoRoute',
                peerId,
                entrypoint: 'postponed_messages',
                postponed: true,
            });
        }
        else {
            scrollHistoryToBottom();
        }
    }, [
        perfStats,
        currentDraft,
        screenRoute,
        dispatch,
        entrypoint,
        peerId,
        analyticsAppName,
        isCasperConvo,
        isCommunityMessaging,
        viewerId,
        isPostponedScreen,
        router,
        scrollHistoryToBottom,
    ]);
    const handleUnpinForAll = useCallback((peerId) => {
        dispatch({
            type: 'UserUnpinMessage',
            peerId,
            userAction: 'unpin_message_for_all',
        });
    }, [dispatch]);
    const handleHidePinnedMessageLocally = useCallback((peerId) => {
        dispatch({
            type: 'UserChangedConvo',
            peerId,
            userAction: 'hide_pinned_message',
        });
    }, [dispatch]);
    const handleBirthdayStickersOpen = () => {
        setShowBirthdayStickers(true);
    };
    const isHandleMessageClickAvailable = useRef(true);
    const handleMessageClick = useCallback(async ({ cmid, peerId, isUnavailable, rootCmid, entrypoint }) => {
        if (!isHandleMessageClickAvailable.current) {
            return;
        }
        let message = peerId === convoRef.current.peerId
            ? Convo.findMessageByCmid(convoRef.current, cmid)
            : undefined;
        if (!message) {
            try {
                isHandleMessageClickAvailable.current = false;
                const response = await apiFetch('messages.getByConversationMessageId', {
                    peer_id: peerId,
                    conversation_message_ids: `${cmid}`,
                    extended: 1,
                    group_id: getOwnerGroupId(owner.id),
                });
                const [apiMessage] = response.items;
                insertIntoCache({
                    profiles: response.profiles,
                    groups: response.groups,
                });
                if (apiMessage) {
                    message = fromApiMessage(featureFlags, apiMessage).message;
                    if (message.kind !== 'Normal') {
                        return;
                    }
                }
            }
            catch (error) {
                if (error instanceof IApi.RequestError &&
                    error.code === API_ERROR_MESSAGES_CHAT_WAS_DELETED) {
                    snackbar({
                        mode: 'dark',
                        message: lang.use('me_chat_deleted_notification'),
                        before: (React.createElement(Icon28ErrorCircleOutline, { fill: "var(--vkui--color_icon_negative)" })),
                    });
                    return;
                }
            }
            finally {
                isHandleMessageClickAvailable.current = true;
            }
        }
        /**
         * Удаленное или недоступное пользователю сообщение
         * открываем в модальном окне
         */
        if (isUnavailable ||
            !message ||
            ('isUnavailable' in message && message.isUnavailable)) {
            replace({
                kind: 'ModalMessageRuntimeRoute',
                message: message?.kind === 'Normal' ? message : undefined,
            });
            return;
        }
        scrollToMessage({ cmid, peerId, rootCmid, entrypoint });
    }, [
        apiFetch,
        featureFlags,
        insertIntoCache,
        owner.id,
        replace,
        scrollToMessage,
        lang,
        snackbar,
    ]);
    const handleChatCreatingOpen = useCallback(() => {
        setIsChatCreating(true);
        createNewChatFromCurrentModal.open();
    }, [createNewChatFromCurrentModal]);
    const handleChatCreatingClose = useCallback(() => {
        setIsChatCreating(false);
        createNewChatFromCurrentModal.close();
    }, [createNewChatFromCurrentModal]);
    const onChatCreation = (chatId) => {
        navigate({
            kind: 'ConvoRoute',
            peerId: chatId,
            entrypoint: 'create_conversation',
        });
    };
    const handleConvoAction = useCallback((userAction) => {
        switch (userAction) {
            case 'clear':
                handleConvoClearAction(convo);
                break;
            case 'configure_tags':
                handleOpenTagManager(convo.peerId);
                break;
            case 'leave':
                handleConvoLeaveAction(convo.peerId);
                break;
            case 'add_to_chat':
                setChatInviteUserShown(true);
                break;
            case 'unpin_message_for_all':
                dispatch({
                    type: 'UserUnpinMessage',
                    peerId: convo.peerId,
                    userAction: 'unpin_message_for_all',
                });
                break;
            case 'pin_message_for_all':
                break;
            case 'mute':
            case 'unmute':
            case 'mute_until':
                dispatch({
                    type: 'UserChangedMute',
                    userAction,
                    peerId: convo.peerId,
                    timer: 0,
                });
                break;
            case 'archive':
            case 'unarchive': {
                dispatch({
                    type: 'UserChangedConvo',
                    peerId: convo.peerId,
                    userAction,
                    uiCallback: (isSuccess) => {
                        if (isSuccess) {
                            snackbar({
                                message: userAction === 'archive'
                                    ? lang.use('me_chat_moved_in_archive')
                                    : lang.use('me_chat_returned_from_archive'),
                                before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                                action: lang.use('me_cancel'),
                                onActionClick: () => {
                                    dispatch({
                                        type: 'UserChangedConvo',
                                        peerId: convo.peerId,
                                        userAction: userAction === 'archive' ? 'unarchive' : 'archive',
                                    });
                                },
                            });
                        }
                    },
                });
                break;
            }
            case 'mark_unread':
            case 'mark_read':
            case 'mark_unimportant':
            case 'mark_important':
            case 'mark_answered':
            case 'pin':
            case 'unpin':
            case 'show_pinned_message':
            case 'hide_pinned_message':
            case 'show_bot_keyboard':
            case 'hide_bot_keyboard':
            case 'return_to_chat':
            case 'leave_and_clear':
                if (userAction === 'pin' && !canPinMore) {
                    pinDialogErrorModal.open();
                    break;
                }
                dispatch({
                    type: 'UserChangedConvo',
                    peerId: convo.peerId,
                    userAction,
                });
                if (userAction === 'mark_unread') {
                    navigate({
                        kind: 'MainRoute',
                        organiser: router.screenRoute.organiser,
                    });
                }
                break;
            case 'off_stickers_popup_animation':
            case 'on_stickers_popup_animation':
                dispatch({
                    type: 'UserChangedStickersPopupAutoplay',
                    userAction,
                    peerId: convo.peerId,
                });
                break;
            case 'business_notify_enable':
                if (convo.kind === 'BusinessNotify' &&
                    convo.ownerId !== undefined) {
                    dispatch({
                        type: 'UserChangedBusinessNotify',
                        peerId: convo.ownerId,
                        userAction: 'business_notify_enable',
                    });
                }
                break;
            case 'business_notify_disable':
                handleConvoDisableBusinessNotifyAction(convo);
                break;
            case 'open_convo_attaches':
                router.push({
                    kind: 'PeerPanel',
                    peerId: convo.peerId,
                    section: 'photos',
                });
                break;
            case 'open_shared_convos':
                sharedConvosModal.open();
                break;
            case 'add_to_convo':
            case 'invite_to_convo':
                setShowChatInvitation(true);
                break;
            case 'ban':
                switch (convo.kind) {
                    case 'UserConvo':
                        owner.kind === 'Group'
                            ? groupBanUserConfirmationModal.open()
                            : userBanConfirmationModal.open();
                        break;
                    case 'GroupConvo':
                        blockGroupConfirmationModal.open();
                        break;
                    default:
                        dispatch({
                            type: 'UserChangedConvo',
                            peerId: convo.peerId,
                            userAction,
                        });
                }
                break;
            case 'unban':
                switch (convo.kind) {
                    case 'UserConvo':
                        owner.kind === 'Group'
                            ? groupUnbanUserConfirmationModal.open()
                            : userUnbanConfirmationModal.open();
                        break;
                    case 'GroupConvo':
                        snackbar({
                            before: React.createElement(RichAvatar, { src: peer.photo?.photo50, size: 48 }),
                            message: lang.use('me_group_unblocked_snackbar', {
                                values: { group: Peer.name(peer) },
                            }),
                        });
                        dispatch({
                            type: 'UserChangedConvo',
                            peerId: convo.peerId,
                            userAction,
                        });
                        break;
                    default:
                        dispatch({
                            type: 'UserChangedConvo',
                            peerId: convo.peerId,
                            userAction,
                        });
                }
                break;
            case 'create_chat_based_on_current':
                handleChatCreatingOpen();
                break;
            case 'forbid_writing_all':
            case 'allow_writing_all':
            case 'forbid_writing_all_until':
                break;
            case 'finish_call':
                if (Convo.canFinishCall(convo)) {
                    dispatch({
                        type: 'UserChangedConvo',
                        peerId: convo.peerId,
                        userAction,
                    });
                }
                break;
            case 'delete_for_all':
                if (Convo.canDelete(convo)) {
                    handleConvoDeleteAction(convo.peerId);
                }
                break;
            case 'enable_mentions':
            case 'disable_all_and_online_mentions':
            case 'disable_mentions':
                break;
            default:
                exhaustivenessCheck(userAction);
        }
    }, [
        handleConvoClearAction,
        convo,
        handleConvoLeaveAction,
        dispatch,
        canPinMore,
        handleConvoDisableBusinessNotifyAction,
        router,
        sharedConvosModal,
        handleChatCreatingOpen,
        pinDialogErrorModal,
        navigate,
        userBanConfirmationModal,
        groupBanUserConfirmationModal,
        groupUnbanUserConfirmationModal,
        owner.kind,
        userUnbanConfirmationModal,
        handleConvoDeleteAction,
        handleOpenTagManager,
        blockGroupConfirmationModal,
        lang,
        peer,
        snackbar,
    ]);
    const handleGoToMessage = useCallback((cmid) => {
        if (attachmentsModal.isActive) {
            attachmentsModal.close();
        }
        if (sharedConvosModal.isActive) {
            sharedConvosModal.close();
        }
        if (convoRoute.cmid === cmid) {
            setFocusMessage(cmid);
        }
        else {
            navigate({ ...convoRoute, peerId: convo.peerId, cmid });
        }
    }, [
        convoRoute,
        navigate,
        attachmentsModal,
        sharedConvosModal,
        convo.peerId,
        setFocusMessage,
    ]);
    const lastHistoryCmid = History.lastCmid(convo.history);
    const isCmidInHistoryRange = useCallback((cmid) => {
        return (cmid > 0 && (lastHistoryCmid === undefined || cmid <= lastHistoryCmid));
    }, [lastHistoryCmid]);
    /**
     * Ниже используем два разных хука, хотя их код просится объединиться в один,
     * по двум причинам:
     * - им нужен разный набор зависимостей
     * - useOnChange работает быстрее, но внутри него можно изменять только стейт компонента.
     */
    useOnChange(() => {
        const { cmid } = convoRoute;
        if (cmid !== undefined && isCmidInHistoryRange(cmid)) {
            setFocusMessage(cmid);
        }
    }, [convoRoute.cmid, convoRoute.peerId]);
    useEffect(() => {
        const { cmid, ...restConvoRoute } = convoRoute;
        if (cmid !== undefined && !isCmidInHistoryRange(cmid)) {
            replace({ ...restConvoRoute, cmid: undefined });
        }
    }, [convoRoute, replace, isCmidInHistoryRange]);
    const handleGoToMessageFromPlayer = async (peerId, entrypoint, cmid) => {
        const isInCurrentConvo = convoRoute.peerId === peerId;
        if (!isInCurrentConvo) {
            openConvo({ peerId, entrypoint, cmid });
            return;
        }
        handleGoToMessage(cmid);
    };
    const handleConfirmBanUnbanUser = useCallback(({ userAction, modal, }) => {
        dispatch({
            type: 'UserChangedConvo',
            peerId: convo.peerId,
            userAction,
        });
        modal.close();
    }, [convo.peerId, dispatch]);
    const handleConfirmBanUser = useCallback(() => {
        handleConfirmBanUnbanUser({
            userAction: 'ban',
            modal: userBanConfirmationModal,
        });
    }, [userBanConfirmationModal, handleConfirmBanUnbanUser]);
    const handleConfirmBanGroup = useCallback((banInfo) => {
        dispatch({
            type: 'GroupBanUser',
            peerId: convo.peerId,
            userAction: 'ban',
            banInfo,
        });
        groupBanUserConfirmationModal.close();
    }, [groupBanUserConfirmationModal, dispatch, convo.peerId]);
    const onBlockGroupConfirmation = useCallback(() => {
        dispatch({
            type: 'UserChangedConvo',
            peerId: convo.peerId,
            userAction: 'ban',
        });
        blockGroupConfirmationModal.close();
    }, [blockGroupConfirmationModal, dispatch, convo.peerId]);
    const handleConfirmUnbanUser = useCallback(() => handleConfirmBanUnbanUser({
        userAction: 'unban',
        modal: userUnbanConfirmationModal,
    }), [userUnbanConfirmationModal, handleConfirmBanUnbanUser]);
    const handleConfirmGroupUnbanUser = useCallback(() => {
        dispatch({
            type: 'UserChangedConvo',
            peerId: convo.peerId,
            userAction: 'unban',
        });
        groupUnbanUserConfirmationModal.close();
    }, [groupUnbanUserConfirmationModal, dispatch, convo.peerId]);
    const handleCallJoinAction = () => {
        navigate({
            ...convoRoute,
            callJoinHash: undefined,
            callJoinId: undefined,
            p: undefined,
        });
    };
    const unknownReactionModal = useModal();
    const normalMessageActions = useMemo(() => convo.kind === 'BusinessNotify'
        ? new Set(['delete'])
        : new Set([
            'forward',
            'reply',
            'delete',
            'unpin_message_for_all',
            'pin_message_for_all',
            'unmark_important',
            'mark_important',
            'spam',
            'select',
            'edit',
        ]), [convo.kind]);
    const onSharedConvoSelection = useCallback((peerId) => {
        openConvo({ peerId, entrypoint: 'shared_convos' });
    }, [openConvo]);
    const onReactionsReadAllClick = useCallback(() => {
        dispatch({
            type: 'UserReadAllReactions',
            peerId,
        });
    }, [dispatch, peerId]);
    const onOpenReport = useCallback((messages) => {
        setMessageForReport(messages || selected);
        reportModal.open();
    }, [selected, reportModal]);
    const popupStickersService = useMemo(() => {
        return new PopupStickerService();
    }, []);
    const handleOpenStickersKeyboard = useCallback(() => {
        popupStickersService.destroyWithFadeOut();
    }, [popupStickersService]);
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    const onNavigationStart = useCallback(() => {
        controlHandleRef.current?.focusLast().catch(noop);
    }, [controlHandleRef]);
    const onNavigationEnd = useCallback(() => {
        if (!composerHandleRef.current)
            return;
        composerHandleRef.current.focus();
        // Не сбрасываем текущее состояние.
        if (isNavigating) {
            setIsNavigating(true);
        }
    }, [isNavigating, composerHandleRef, setIsNavigating]);
    // Если композер недоступен, забрасываем фокус в саму беседу.
    useEffect(() => {
        if (convo.canWrite.allowed || !controlHandleRef.current)
            return;
        controlHandleRef.current.autoFocus().catch(noop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleOpenStickersSuggestionsBot = () => {
        navigate({
            kind: 'ConvoRoute',
            peerId: Peer.STICKERS_KEYWORDS_BOT_PEER_ID,
            entrypoint: 'stickers_suggestions_bot_link',
        });
    };
    const [isAntispamBannerHidden, setAntispamBannerHidden] = useState(false);
    if (convo.kind === 'MessageRequestChatConvo') {
        return (React.createElement("div", { className: "ConvoMain", ref: ref, tabIndex: -1 },
            React.createElement(ChatInviteByMRPanel, { convo: convo, onReject: onRejectChatMR.bind(null, convo), onGoBack: () => navigate({ kind: 'MainRoute' }) })));
    }
    const getComposerComponent = () => {
        if (isPostponedScreen && selectedPostponed.length > 0) {
            return (React.createElement(ComposerSelectingPostponed, { selected: selectedPostponed, convo: convo, handleCancelSelecting: handleCancelPostponedSelecting, controlHandleRef: composerHandleRef, isNavigating: isNavigating, onNavigationStart: onNavigationStart }));
        }
        else if (!isPostponedScreen && selected.length > 0) {
            return (React.createElement(ComposerSelectingNormal, { selected: selected, convo: convo, handleCancelSelecting: handleCancelSelecting, onForward: forwardToConvoPickerModal.open, onForwardHere: onForwardSelectedHere, setKeyboardOpened: setKeyboardOpened, onOpenReport: onOpenReport, controlHandleRef: composerHandleRef, isNavigating: isNavigating, onNavigationStart: onNavigationStart }));
        }
        if (userInfo?.is_answer_locked &&
            userInfo?.answer_locked_by_user_id !== viewerId &&
            peer.kind === 'User' &&
            convo.kind === 'UserConvo' &&
            owner.kind === 'Group') {
            return (React.createElement(ComposerBlocked, { className: "ConvoMain__composerContent", reason: "community_messages_other_admin_acquired_user_convo", dispatch: dispatch, convo: convo, peer: peer }));
        }
        if (convo.canWrite.allowed) {
            if (featureFlags.vkm_marusia_main_chat &&
                Peer.isMarusia(convo.peerId) &&
                !isPostponedScreen) {
                return (React.createElement(MarusiaComposer, { entrypoint: entrypoint, isNewConvo: Convo.isNew(convo), instanceId: "main-marusia" }));
            }
            if (isPostponedScreen &&
                convo.kind === 'ChatConvo' &&
                convo.state === 'left') {
                return (React.createElement(ComposerBlocked, { className: "ConvoMain__composerContent", reason: "sending_postponed_messages_is_resticted_because_user_left_chat", dispatch: dispatch, convo: convo, peer: peer }));
            }
            return (React.createElement(ConvoComposer, { key: isPostponedScreen ? 'postponed' : 'original', showBirthdayStickers: showBirthdayStickers, setShowBirthdayStickers: setShowBirthdayStickers, className: "ConvoMain__composerContent", peerId: peerId, isPostponed: isPostponedScreen, composerDraft: currentDraft, stickers: stickers, stickersKeywords: stickersKeywords, hasBirthdayBanner: Convo.hasBirthdayBanner(convo), isBotKeyboardOpened: isKeyboardOpened, canUseMassMentions: Convo.canUseMassMentions(convo), setBotKeyboardOpened: setKeyboardOpened, onBotKeyboardSend: handleKeyboardSend, onCallbackButtonClick: handleCallbackButtonClick, onOpenStickersKeyboard: handleOpenStickersKeyboard, scrollToMessage: handleMessageClick, onEscapePress: onClose, onMessageSend: handleSend, onLastMessageEdit: handleEdit, availableOnboardingTooltips: availableOnboardingTooltips, 
                /**
                 * Фокусируем только один на раз на маунт истории,
                 * чтобы фокус не убегал в композер после снятия
                 * выделения сообщения.
                 */
                focusOnMount: $onceOnMount.current, focusOnCharKey: true, controlHandleRef: composerHandleRef, isNavigating: isNavigating, setIsNavigating: setIsNavigating, onNavigationStart: onNavigationStart, onOpenStickersSuggestionsBot: handleOpenStickersSuggestionsBot }));
        }
        return (React.createElement(ComposerBlocked, { className: "ConvoMain__composerContent", reason: convo.canWrite.reason, until: convo.canWrite.until, dispatch: dispatch, convo: convo, peer: peer }));
    };
    const fromConvo = convo.kind === 'ChatConvo' ? convo : undefined;
    const forwardingMessages = (() => {
        const items = [...selected, ...forward.messages];
        if (!items.length) {
            return null;
        }
        return {
            kind: "message" /* ComposerDraft.ForwardKind.Message */,
            items: items,
        };
    })();
    const isAntispamBanner = !!convo.convoBanner &&
        [
            'spam_dialog',
            'spam_chat_global',
            'friend_send_request',
            'friend_accept_request',
            'not_friend',
            'spam_chat_invite_banner',
            'hacked_dialog',
            'verified_community',
            'mail_verified_community',
        ].includes(convo.convoBanner.name);
    const audioPlayerBanner = topPlayerType && !hideAudioPlayer ? (React.createElement(BannerPanel, { mode: "custom", isVisible: true, noBottomBorder: true },
        React.createElement(ConvoTopPlayer, { type: topPlayerType, goToMessage: handleGoToMessageFromPlayer, convo: convo }))) : null;
    const getConvoComposer = () => (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ConvoMain__historyUnreadWrapper" }, isPostponedScreen ? (React.createElement(ConvoPostponedHopNavigation, { isVisible: isHopNavigationUnreadVisible, onClick: () => setFocusItem(convo.peerId, {
                kind: 'bottom',
                shouldMoveFocus: true,
            }), className: "ConvoMain__historyUnread" })) : (React.createElement(ConvoHopNavigation, { convo: convo, isUnreadVisible: isHopNavigationUnreadVisible, onReactionsClick: handleHopNavigationReactionsClick, onMentionsClick: handleHopNavigationMentionsClick, onUnreadClick: handleHopNavigationUnreadClick, onReactionsReadAllClick: onReactionsReadAllClick, className: "ConvoMain__historyUnread" }))),
        React.createElement("div", { className: "ConvoMain__composer", onDragEnter: handleDragEnter }, getComposerComponent())));
    const getConvoHistory = () => (React.createElement(ConvoHistory, { key: isPostponedScreen ? 'postponed' : 'original', isPostponed: isPostponedScreen, onKeyboardSend: handleKeyboardSend, onCallbackButtonClick: handleCallbackButtonClick, convo: convo, history: isPostponedScreen ? postponedConvoHistory : convoHistory, entrypoint: entrypoint, normalMessageActions: normalMessageActions, selected: isPostponedScreen ? selectedPostponed : selected, onSelectMessage: isPostponedScreen ? handleSelectPostponedMessage : handleSelectMessage, onSeenMessages: isPostponedScreen ? noop : handleSeenMessages, onMessageForward: onMessageForward, onScrollToMessage: handleMessageClick, onOpenMessageInModal: handleOpenForeignMessageModal, onCloseMessageInModal: handleCloseForeignMessageModal, onOpenForwardedMessageModal: onOpenForwardedMessageModal, onCloseForwardedMessageModal: onCloseForwardedMessageModal, scrollCache: scrollCache, onVisibleNodesChange: onVisibleNodesChange, onBottomIndentCross: handleBottomIdentCross, messageReactions: messageReactions, onUnknownReactionClick: unknownReactionModal.open, onOpenReport: onOpenReport, toggleAntispamBanner: setAntispamBannerHidden, withScrollSaveOnClose: isPostponedScreen ? false : true, isThemed: isThemed, isContrastTheme: isContrastTheme, isNavigating: isNavigating, controlHandleRef: controlHandleRef, onNavigationEnd: onNavigationEnd, isCompactView: isCompactHistory, placeholder: isPostponedScreen ? (React.createElement(ConvoHistoryPlaceholder, { convo: convo, isThemed: isThemed, text: lang.use('me_empty_postponed_convo'), isCompactView: isCompactHistory, postponed: true })) : undefined, openClipCoOwnersModal: openClipCoOwnersModal }));
    const getConvoHistoryScheduleFootnote = () => {
        return (featureFlags.vkm_enable_schedule_edu &&
            peer?.kind === 'User' &&
            Peer.isUserPeerId(convo.peerId) &&
            isEdu && React.createElement(ConvoHistoryScheduleFootnote, { peer: peer }));
    };
    const hasGradientFix = featureFlags.vas_popup_sticker_gradient_fix;
    const isBirthdayBanner = Convo.hasBirthdayBanner(convo);
    const hasCommonUserBirthdayBanner = !isEdu && featureFlags.vas_birthday_banner && isBirthdayBanner;
    const hasEduUserBirthdayBanner = isEdu && isBirthdayBanner;
    const hasBirthdayBanner = hasCommonUserBirthdayBanner || hasEduUserBirthdayBanner;
    const showCommonBanner = convo.convoBanner &&
        !isAntispamBanner &&
        (!topPlayerType || hideAudioPlayer) &&
        (!isBirthdayBanner || hasBirthdayBanner);
    const handleBirthdayBannerButtonClick = () => {
        if (hasEduUserBirthdayBanner) {
            handleBirthdayStickersOpen();
            return;
        }
        navigate({
            kind: 'GiftsCatalogProxyRoute',
            peerId: Peer.isUserPeerId(peerId) ? peerId : undefined,
            send: true,
            ref: 'im_birthday_banner',
        });
    };
    return (React.createElement(RightPanelContainer, { minCompressedWidth: isMainPanelOpen ? 550 : 370, className: "ConvoMain__rightPanelContainer" },
        React.createElement("div", { className: cx('ConvoMain', {
                'ConvoMain--mobile': isMobileLayout,
                RE_userSelectNone: !Convo.canCopyMessagesText(convo),
            }), style: themeAppearanceStyles, ref: ref, tabIndex: -1, onKeyDown: onElementKeyDownFactory(onKeyDown) },
            isPostponedScreen ? (React.createElement(ConvoPostponedHeader, { onBack: () => navigate({
                    kind: 'ConvoRoute',
                    peerId: convo.peerId,
                    entrypoint: 'postponed_messages',
                }), convo: convo, peer: peer })) : (React.createElement(ConvoHeader, { convo: convo, peer: peer, onSearchClick: handleConvoHeaderClickSearch, onPostponedClick: () => navigate({
                    kind: 'ConvoRoute',
                    peerId: convo.peerId,
                    entrypoint: 'postponed_messages',
                    postponed: true,
                }), actionsMenu: React.createElement(ConvoMainActionsMenu, { convo: convo, onAction: handleConvoAction, isPinnedMessageHiddenLocally: convo.kind === 'ChatConvo' && convo.pinnedMessage
                        ? hiddenPinnedMessages.has(convo.peerId)
                        : false }), availableOnboardingTooltips: availableOnboardingTooltips, closeConvo: onClose })),
            React.createElement("div", { className: "ConvoMain__themeWrapper" },
                themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
                isPostponedScreen ? null : (React.createElement("div", { className: "ConvoMain__banners" },
                    isAntispamBanner && !isAntispamBannerHidden && (React.createElement(ConvoBanner, { banner: convo.convoBanner, peerId: convo.peerId, closeConvo: onClose })),
                    audioPlayerBanner,
                    showCommonBanner && (React.createElement(ConvoBanner, { banner: convo.convoBanner, peerId: convo.peerId, closeConvo: onClose, onBirthdayBannerClickButton: handleBirthdayBannerButtonClick })),
                    convo.kind === 'ChatConvo' &&
                        (!topPlayerType || hideAudioPlayer) && (React.createElement("div", { className: "ConvoMain__overlappingBanners" },
                        convo.pinnedMessage && (React.createElement(ConvoPinnedMessage, { pinnedMessage: convo.pinnedMessage, isHiddenLocally: hiddenPinnedMessages.has(convo.peerId), onHideLocally: handleHidePinnedMessageLocally, onUnpinForAll: convo.acl.canChangePin &&
                                (convo.canWrite.allowed ||
                                    convo.canWrite.reason ===
                                        'forbid_writing_for_all')
                                ? handleUnpinForAll
                                : undefined, onClick: handleMessageClick })),
                        convo.activeCall && (React.createElement(ConvoActiveCallBanner, { activeCall: convo.activeCall })))),
                    peer.kind === 'Group' &&
                        peer.isBlacklistedByMe &&
                        convo.canWrite.allowed &&
                        (!convo.isNew ? (React.createElement(ConvoBlockGroupBanner, { peerId: peer.id })) : (React.createElement(ConvoNoConversationGroupBanner, null))),
                    peer.kind === 'User' &&
                        owner.kind === 'Group' &&
                        isCommunityMessaging && (React.createElement(ConvoUserInfoBanner, { peer: peer, groupId: owner.id, convo: convo, handleOpenTagManager: handleOpenTagManager })),
                    isEdu &&
                        featureFlags.vkm_edu_offboarding &&
                        convo.kind === 'ChatConvo' && (React.createElement(SferumConvoMigratedListBanner, { convo: convo })))),
                React.createElement(DropAreaProvider, { ...dropAreaState, onHide: hideDropArea, containerRef: ref }, hasGradientFix ? (React.createElement(PopupAnimationObserverProvider, null,
                    React.createElement(StickersPopupRootContainer, { id: "popup-sticker-convo-main-history-container", isUseAsFullscreen: true, popUpStore: popupStickersService, className: "ConvoMain__popupWrapper" },
                        React.createElement("div", { className: "ConvoMain__history", onDragEnter: handleDragEnter }, getConvoHistory()),
                        getConvoHistoryScheduleFootnote(),
                        React.createElement(PopupAnimationDeductibleElementWrapper, { className: "ConvoMain__composerWrapper", popupStickerContainerId: "popup-sticker-convo-main-history-container" }, getConvoComposer())))) : (React.createElement(React.Fragment, null,
                    React.createElement(PopupAnimationObserverProvider, null,
                        React.createElement(StickersPopupRootContainer, { id: "popup-sticker-convo-main-history-container", className: "ConvoMain__history", isUseAsFullscreen: true, onDragEnter: handleDragEnter, popUpStore: popupStickersService }, getConvoHistory())),
                    getConvoHistoryScheduleFootnote(),
                    React.createElement("div", { className: "ConvoMain__composerWrapper" }, getConvoComposer()))))),
            userBanConfirmationModal.isActive && (React.createElement(ModalInterface, { onClose: userBanConfirmationModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_confirmation_title'), buttons: React.createElement(React.Fragment, null,
                    React.createElement(Button, { mode: "secondary", onClick: userBanConfirmationModal.close }, lang.use('global_cancel')),
                    React.createElement(Button, { onClick: handleConfirmBanUser }, lang.use('me_convo_ban_confirmation_modal_confirm'))) }, lang.use('me_convo_ban_confirmation_modal_text', {
                values: { fullname: Peer.name(peer) },
            }))),
            groupBanUserConfirmationModal.isActive &&
                peer.kind === 'User' &&
                owner.kind === 'Group' && (React.createElement(GroupBanUserModal, { onClose: groupBanUserConfirmationModal.close, onSubmit: handleConfirmBanGroup, peer: peer, owner: owner, canWriteToConvo: convo.canWrite.allowed })),
            blockGroupConfirmationModal.isActive && (React.createElement(ModalInterface, { onClose: blockGroupConfirmationModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig ConvoProfileMenu__blockGroupModalContext", title: lang.use('me_block_group_confirmation_modal_title'), buttons: React.createElement(React.Fragment, null,
                    React.createElement(Button, { mode: "secondary", onClick: blockGroupConfirmationModal.close }, lang.use('global_cancel')),
                    React.createElement(Button, { onClick: onBlockGroupConfirmation }, lang.use('me_block_group_confirmation_modal_confirm'))) },
                React.createElement(Placeholder, { noPadding: true }, lang.use('me_convo_block_group_confirmation_modal_text', {
                    values: { group: Peer.name(peer) },
                })))),
            userUnbanConfirmationModal.isActive && (React.createElement(ModalInterface, { onClose: userUnbanConfirmationModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_confirmation_title'), buttons: React.createElement(React.Fragment, null,
                    React.createElement(Button, { mode: "secondary", onClick: userUnbanConfirmationModal.close }, lang.use('global_cancel')),
                    React.createElement(Button, { onClick: handleConfirmUnbanUser }, lang.use('me_convo_unban_confirmation_modal_confirm'))) }, lang.use('me_convo_unban_confirmation_modal_text', {
                values: { fullname: Peer.name(peer) },
            }))),
            groupUnbanUserConfirmationModal.isActive && (React.createElement(GroupUnbanUserModal, { onClose: groupUnbanUserConfirmationModal.close, onSubmit: handleConfirmGroupUnbanUser, peer: peer })),
            showChatInvitation &&
                (Peer.isUserPeerId(peer.id) || Peer.isContactPeerId(peer.id)) && (React.createElement(UserChatInvite, { onClose: () => setShowChatInvitation(false), peerId: peer.id, source: "other" })),
            reportModal.isActive && (React.createElement(ReportConvoMessageModal, { peerId: peerId, messages: messageForReport, onClose: reportModal.close, onSubmit: handleCancelSelecting })),
            attachmentsModal.isActive && (React.createElement(ModalView, { onEscape: attachmentsModal.close, contextClass: "MEAppConfig" },
                React.createElement(ModalBackdrop, { onClick: attachmentsModal.close, isBodyScrollDisabled: true },
                    React.createElement(ModalPanel, { ariaLabelledby: attachmentsModalTitleId },
                        React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: attachmentsModal.close, title: lang.use('me_convo_attaches_app'), titleId: attachmentsModalTitleId }),
                        React.createElement(ModalBody, { withCustomLayout: true },
                            React.createElement(ConvoAttachments, { peerId: convo.peerId, goToMessage: handleGoToMessage, className: "ConvoMain__attachments" })))))),
            peer.kind === 'User' && sharedConvosModal.isActive && (React.createElement(ModalInterface, { onClose: sharedConvosModal.close, contextClass: "MEAppConfig", closeLabel: lang.use('me_close'), title: lang.use('me_convo_modal_shared_convos_title'), withCustomLayout: true, buttons: React.createElement(Button, { mode: "primary", onClick: sharedConvosModal.close }, lang.use('me_close')) },
                React.createElement(SharedConvosPicker, { className: "ConvoMain__sharedConvosPicker", peerId: peer.id, onSelection: onSharedConvoSelection }))),
            !featureFlags.vkm_router_modal_unification &&
                convoRoute.chatJoinHash &&
                owner.kind !== 'Group' && (React.createElement(ChatInviteByLinkModal, { hash: convoRoute.chatJoinHash, onSetAccount: onSetAccount, registerAccount: registerAccount })),
            !featureFlags.vkm_router_modal_unification &&
                convoRoute.callJoinHash && (React.createElement(CallJoin, { callId: convoRoute.callJoinHash, onJoin: handleCallJoinAction, onSetAccount: onSetAccount, registerAccount: registerAccount })),
            !featureFlags.vkm_router_modal_unification &&
                convoRoute.callJoinId && (React.createElement(CallJoin, { shortId: convoRoute.callJoinId, onJoin: handleCallJoinAction, onSetAccount: onSetAccount, registerAccount: registerAccount })),
            forwardToConvoPickerModal.isActive && (React.createElement(ForwardModal, { entrypoint: "convo", initialStrategy: "singular", canChooseStrategy: true, close: forwardToConvoPickerModal.close, handleCancelSelecting: handleCancelSelecting, forward: forwardingMessages, openChannel: openChannel, openConvo: openConvo, onConvoSelected: onForwardToConvoPicked })),
            chatInviteUserShown && convo.kind === 'ChatConvo' && (React.createElement(ChatInviteUsersModal, { convo: convo, onClose: () => setChatInviteUserShown(false) })),
            ConvoClearConfirmModal,
            ConvoLeaveConfirmModal,
            ConvoDeleteConfirmModal,
            isChatCreating && fromConvo && (React.createElement(ModalInterface, { onClose: handleChatCreatingClose, backLabel: lang.use('me_back'), closeLabel: lang.use('me_close'), title: lang.use('me_chat_creation_title'), isHidden: !createNewChatFromCurrentModal.isActive, panelClass: "ConvoMain__chatCreationModal", withCustomLayout: true },
                React.createElement(ChatCreation, { modalGroupId: modalGroup.id, onCreate: onChatCreation, onFailPhoneNumbers: onFailedPhoneNumbers, fromConvo: fromConvo }))),
            pinDialogErrorModal.isActive && (React.createElement(ModalDialog, { title: lang.use('me_error_title'), content: lang.use('me_too_many_conversation_pinned_error'), closeLabel: lang.use('me_close'), onClose: pinDialogErrorModal.close, buttons: React.createElement(Button, { onClick: pinDialogErrorModal.close }, lang.use('me_close')) })),
            unknownReactionModal.isActive && (React.createElement(ModalInterface, { onClose: unknownReactionModal.close, backLabel: lang.use('me_back'), closeLabel: lang.use('me_close'), title: lang.use('me_unknown_reaction_modal_title'), buttons: [
                    React.createElement(Button, { mode: "primary", onClick: unknownReactionModal.close }, lang.use('me_close')),
                ] }, lang.use('me_unknown_reaction_modal_text'))),
            ConvoDisableBusinessNotifyModal,
            tagManagerModal)));
});
function useHandleContactConverted(peer) {
    const { replace } = useRouter();
    const route = useConvoRoute();
    const convertedContactPeerUserId = peer.kind === 'Contact' && peer.userId ? peer.userId : undefined;
    useEffect(() => {
        if (convertedContactPeerUserId) {
            replace({
                kind: 'ConvoRoute',
                entrypoint: route.entrypoint,
                peerId: convertedContactPeerUserId,
            });
        }
    }, [convertedContactPeerUserId, replace, route.entrypoint]);
}
//# sourceMappingURL=ConvoMain.js.map