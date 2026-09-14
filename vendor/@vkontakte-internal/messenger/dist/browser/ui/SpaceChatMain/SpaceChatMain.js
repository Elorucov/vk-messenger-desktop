import '../../ui/SpaceChatMain/SpaceChatMain.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Message from '../../../core/model/Message';
import * as Post from '../../../core/model/Post';
import * as Comment from '../../../core/model/Comment';
import * as ComposerDraft from '../../../core/model/ComposerDraft';
import * as History from '../../../core/model/History';
import { DropAreaProvider } from '../../ui/DropArea/DropArea';
import { useDropAreaState } from '../../ui/DropArea/useDropAreaState';
import { ConvoHistory, } from '../../ui/ConvoHistory/ConvoHistory';
import { useSelectedMessages } from '../../hooks/useSelectedMessages';
import { useBotKeyboard } from '../../hooks/useBotKeyboard';
import { useBrowserEnv, useDispatch, useFeatureFlags, useInsertIntoCache, usePeers, useViewer, } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { useModal } from '../../hooks/useModal';
import { ConvoComposer } from '../../ui/ConvoComposer/ConvoComposer';
import { ComposerSelectingNormal } from '../../ui/ComposerSelecting/ComposerSelecting';
import { ComposerBlocked } from '../../ui/ComposerBlocked/ComposerBlocked';
import { useComposerDraft } from '../../hooks/useComposerDraft';
import { ConvoHopNavigation } from '../../ui/ConvoHopNavigation/ConvoHopNavigation';
import { SpaceJoinButton } from '../../ui/SpaceJoinButton/SpaceJoinButton';
import { SpaceRoomHeader } from '../../ui/SpaceRoomHeader/SpaceRoomHeader';
import { ReportConvoMessageModal } from '../../ui/ReportModal/ReportModal';
import { useConvoReplyChain } from '../../hooks/useConvoReplyChain';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import * as ThemeStyle from '../../../core/model/ThemeStyle';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { ConvoPinnedMessage } from '../../ui/ConvoPinnedMessage/ConvoPinnedMessage';
import { useApiFetch } from '../../hooks/useApiFetch';
import { fromApiMessage } from '../../../data/converter/MessageConverter';
import { IPerfStats } from '../../../data/env/IPerfStats';
export const SpaceChatMain = ({ space, convo, variant, peer, hiddenPinnedMessages, messageReactions, scrollCache, stickers, stickersKeywords, withHeader = true, isCompactView, availableOnboardingTooltips, }) => {
    // SPC-TODO: come up with spaces
    const entrypoint = 'list_all';
    const { settings } = useViewer();
    const dispatch = useDispatch();
    const peers = usePeers();
    const router = useRouter();
    const draft = useComposerDraft(peer.id);
    const { perfStats, analyticsAppName } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const insertIntoCache = useInsertIntoCache();
    useEffect(() => {
        dispatch({
            type: 'UserOpenedConvo',
            peerId: peer.id,
        });
        return () => dispatch({
            type: 'UserClosedConvo',
            peerId: peer.id,
        });
    }, [dispatch, peer.id]);
    const $container = useRef(null);
    const convoHistory = Convo.getHistory(convo, false);
    const { selected, handleSelectMessage, handleCancelSelecting } = useSelectedMessages(convoHistory);
    const { dropAreaState, handleDragEnter, hideDropArea } = useDropAreaState();
    const [isHopNavigationUnreadVisible, setIsHopNavigationUnreadVisible] = useState(false);
    const $historyVisibleNodes = useRef();
    const onVisibleNodesChange = useCallback((nodes) => {
        $historyVisibleNodes.current = nodes;
    }, []);
    const convoReplyChain = useConvoReplyChain();
    const { setFocusItem } = scrollCache;
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
    const scrollHistoryToBottom = useCallback((shouldMoveFocus = false) => {
        if ('cmid' in router.screenRoute) {
            router.navigate({ ...router.screenRoute, cmid: undefined });
        }
        setFocusItem(peer.id, {
            kind: 'bottom',
            shouldMoveFocus,
        });
    }, [router, peer.id, setFocusItem]);
    const { isKeyboardOpened, setKeyboardOpened, handleKeyboardSend, handleCallbackButtonClick, } = useBotKeyboard({
        entrypoint,
        convo,
        authorPeer: convo.currentKeyboard &&
            Peer.safeGet(peers, convo.currentKeyboard.authorId),
        onSend: scrollHistoryToBottom,
    });
    const normalMessageActions = useMemo(() => new Set([
        // 'forward',
        'reply',
        'delete',
        'unpin_message_for_all',
        'pin_message_for_all',
        // 'unmark_important',
        // 'mark_important',
        'spam',
        // 'select',
        'edit',
    ]), []);
    const handleBottomIdentCross = useCallback((isCrossed) => {
        setIsHopNavigationUnreadVisible(!isCrossed);
    }, []);
    const handleScrollToMessage = useCallback(async ({ cmid, rootCmid }) => {
        setFocusMessage(cmid);
        if (rootCmid !== undefined) {
            convoReplyChain.pushItem(rootCmid);
        }
    }, [setFocusMessage, convoReplyChain]);
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
                return handleScrollToMessage({
                    cmid: replyCmid,
                    peerId: convo.peerId,
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
        if ('cmid' in router.screenRoute) {
            router.navigate({ ...router.screenRoute, cmid: undefined });
        }
        setFocusItem(convo.peerId, scrollTo);
    }, [
        router,
        convo.peerId,
        convo.inReadBy,
        convo.unreadCount,
        convoReplyChain,
        setFocusItem,
        handleScrollToMessage,
    ]);
    const firstUnreadMentionCmid = Convo.getFirstUnreadMentionCmid(convo);
    const handleHopNavigationMentionClick = useCallback(() => {
        if (!firstUnreadMentionCmid) {
            return scrollHistoryToBottom(true);
        }
        setFocusMessage(firstUnreadMentionCmid);
    }, [scrollHistoryToBottom, setFocusMessage, firstUnreadMentionCmid]);
    const firstUnreadReactionCmid = Convo.firstUnreadReactionCmid(convo);
    const handleHopNavigationReactionClick = useCallback(() => {
        if (!firstUnreadReactionCmid) {
            return scrollHistoryToBottom(true);
        }
        setFocusMessage(firstUnreadReactionCmid);
    }, [scrollHistoryToBottom, setFocusMessage, firstUnreadReactionCmid]);
    const handleSeenMessages = useCallback((fromCmid, toCmid) => {
        dispatch({
            type: 'UserSeenMessages',
            fromCmid,
            toCmid,
            peerId: peer.id,
            analyticsAppName,
        });
    }, [analyticsAppName, dispatch, peer.id]);
    const handleSend = useCallback((text, attaches, extra) => {
        if (perfStats) {
            perfStats.removeEvent(IPerfStats.EventType.receiveMessage);
            perfStats.addEvent(IPerfStats.EventType.receiveMessage, {
                peerIds: [peer.id],
                data: {
                    sendClick: perfStats.getCurrentTime(),
                },
            });
        }
        const { editing, reply } = draft;
        let forward = ComposerDraft.getNormalForward(draft, "message" /* ComposerDraft.ForwardKind.Message */);
        let forwardedChannelPost = draft.forward?.kind === 'post' ? draft.forward.items[0] : undefined;
        let forwardPostComment = draft.forward?.kind === 'comment' ? draft.forward.items[0] : undefined;
        const hasStickerAttach = !!attaches.sticker || !!attaches.ugcSticker;
        // Не отправляем форвард, так как его нельзя использовать со стикером
        if (hasStickerAttach) {
            forward = undefined;
            forwardedChannelPost = undefined;
            forwardPostComment = undefined;
        }
        const hasMessageForwards = draft.forward?.kind === 'message';
        if (editing &&
            Message.isEditable(editing, Date.now()) &&
            !hasStickerAttach) {
            dispatch({
                type: 'UserHitEdit',
                cmid: editing.cmid,
                text,
                attaches,
                peerId: peer.id,
                keepForwarded: Boolean(reply || hasMessageForwards),
            });
            return;
        }
        dispatch({
            type: 'UserHitSend',
            entrypoint,
            text,
            attaches: {
                ...attaches,
                ...(forwardedChannelPost
                    ? {
                        wall: Post.toWallAttach(forwardedChannelPost),
                    }
                    : {}),
                ...(forwardPostComment
                    ? {
                        wallReply: Comment.toWallReplyAttach(forwardPostComment),
                    }
                    : {}),
            },
            timestamp: Date.now(),
            peerId: peer.id,
            extra,
            reply: reply?.kind === 'Normal' ? reply : undefined,
            forwarded: forward,
            analyticsAppName,
        });
        if (reply && hasStickerAttach) {
            dispatch({
                type: 'UserChangedComposerDraft',
                kind: 'reply',
                reply: undefined,
                peerId: peer.id,
                isPostponed: false,
            });
        }
        scrollHistoryToBottom();
    }, [
        draft,
        dispatch,
        entrypoint,
        peer.id,
        scrollHistoryToBottom,
        perfStats,
        analyticsAppName,
    ]);
    const { isThemed, themeAppearance, themeBackground } = useCurrentThemeStyle({
        forceThemeStyleId: convo.styleId !== ThemeStyle.SYSTEM_STYLE_ID && settings.showThemeStyles
            ? convo.styleId
            : undefined,
    });
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    const handleHidePinnedMessageLocally = useCallback((peerId) => {
        dispatch({
            type: 'UserChangedConvo',
            peerId,
            userAction: 'hide_pinned_message',
        });
    }, [dispatch]);
    const handleUnpinForAll = useCallback((peerId) => {
        dispatch({
            type: 'UserUnpinMessage',
            peerId,
            userAction: 'unpin_message_for_all',
        });
    }, [dispatch]);
    const handleMessageClick = useCallback(async ({ cmid, peerId, isUnavailable, rootCmid }) => {
        if (peerId === convo.peerId) {
            const message = Convo.findMessageByCmid(convo, cmid);
            if (message) {
                return handleScrollToMessage({ cmid, peerId, rootCmid });
            }
        }
        const res = await apiFetch('messages.getByConversationMessageId', {
            peer_id: peerId,
            conversation_message_ids: cmid.toString(),
            extended: 1,
            group_id: 0,
        });
        const apiMessage = res.items[0];
        if (!apiMessage) {
            return;
        }
        const { message } = fromApiMessage(featureFlags, apiMessage);
        insertIntoCache({
            profiles: res.profiles,
            groups: res.groups,
        });
        if (message.kind !== 'Normal') {
            return;
        }
        /**
         * Удаленное или недоступное пользователю сообщение
         * открываем в модальном окне
         */
        if (isUnavailable ||
            !message ||
            ('isUnavailable' in message && message.isUnavailable)) {
            return router.replace({
                kind: 'ModalMessageRuntimeRoute',
                message,
            });
        }
        handleScrollToMessage({ cmid, peerId, rootCmid });
    }, [
        apiFetch,
        featureFlags,
        insertIntoCache,
        router,
        handleScrollToMessage,
        convo,
    ]);
    const lastEditableMessage = Convo.lastEditableMessage(convo);
    const handleEdit = useCallback(() => {
        if (lastEditableMessage) {
            dispatch({
                type: 'UserChangedComposerDraft',
                kind: 'editing',
                editing: lastEditableMessage,
                peerId: peer.id,
                isPostponed: false,
            });
        }
    }, [dispatch, peer.id, lastEditableMessage]);
    const { isMobileLayout, isOneColumnLayout } = useLayoutData();
    const [messageForReport, setMessageForReport] = useState([]);
    const reportModal = useModal();
    const onOpenReport = useCallback((messages) => {
        setMessageForReport(messages || selected);
        reportModal.open();
    }, [selected, reportModal]);
    const getComposerComponent = () => {
        if (normalMessageActions.has('select') && selected.length > 0) {
            return (React.createElement(ComposerSelectingNormal, { selected: selected, convo: convo, handleCancelSelecting: handleCancelSelecting, 
                // SPC-TODO: починить форварды
                onForward: () => { }, onForwardHere: () => { }, setKeyboardOpened: setKeyboardOpened, onOpenReport: onOpenReport }));
        }
        if (convo.canWrite.allowed) {
            return (React.createElement(ConvoComposer, { className: "ConvoMain__composerContent", peerId: peer.id, isPostponed: false, composerDraft: draft, stickers: stickers, stickersKeywords: stickersKeywords, isBotKeyboardOpened: isKeyboardOpened, canUseMassMentions: Convo.canUseMassMentions(convo), setBotKeyboardOpened: setKeyboardOpened, onBotKeyboardSend: handleKeyboardSend, onCallbackButtonClick: handleCallbackButtonClick, scrollToMessage: handleScrollToMessage, onMessageSend: handleSend, onLastMessageEdit: handleEdit, availableOnboardingTooltips: availableOnboardingTooltips, isCompactView: isCompactView }));
        }
        return (React.createElement(ComposerBlocked, { className: "ConvoMain__composerContent", reason: convo.canWrite.reason, until: convo.canWrite.until, dispatch: dispatch, convo: convo, peer: peer }));
    };
    return (React.createElement("div", { className: cx('SpaceChatMain', {
            'SpaceChatMain--one-column': isOneColumnLayout,
            'SpaceChatMain--mobile': isMobileLayout,
        }), ref: $container, style: themeAppearanceStyles },
        withHeader && (React.createElement(SpaceRoomHeader, { variant: variant, spaceId: space.id, convo: convo, peer: peer })),
        React.createElement("div", { className: "SpaceChatMain__banners" }, convo.pinnedMessage && (React.createElement(ConvoPinnedMessage, { pinnedMessage: convo.pinnedMessage, isHiddenLocally: hiddenPinnedMessages.has(convo.peerId), onHideLocally: handleHidePinnedMessageLocally, onUnpinForAll: convo.acl.canChangePin &&
                (convo.canWrite.allowed ||
                    convo.canWrite.reason === 'forbid_writing_for_all')
                ? handleUnpinForAll
                : undefined, onClick: handleMessageClick }))),
        React.createElement("div", { className: "SpaceChatMain__themeWrapper" },
            React.createElement(DropAreaProvider, { ...dropAreaState, onHide: hideDropArea, containerRef: $container },
                themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
                React.createElement("div", { className: "SpaceChatMain__history", onDragEnter: handleDragEnter },
                    React.createElement(ConvoHistory, { isPostponed: false, onKeyboardSend: handleKeyboardSend, onCallbackButtonClick: handleCallbackButtonClick, convo: convo, history: convo.history, entrypoint: entrypoint, normalMessageActions: normalMessageActions, selected: selected, onSelectMessage: handleSelectMessage, onSeenMessages: handleSeenMessages, onScrollToMessage: handleScrollToMessage, 
                        // onOpenMessageInModal={handleOpenForeignMessageModal}
                        // onCloseMessageInModal={handleCloseForeignMessageModal}
                        scrollCache: scrollCache, onVisibleNodesChange: onVisibleNodesChange, onBottomIndentCross: handleBottomIdentCross, messageReactions: messageReactions, 
                        // onUnknownReactionClick={unknownReactionModal.open}
                        onOpenReport: onOpenReport, withScrollSaveOnClose: true, isCompactView: isCompactView, isThemed: isThemed })),
                React.createElement("div", { className: "SpaceChatMain__composerWrapper" },
                    React.createElement("div", { className: "SpaceChatMain__historyUnreadWrapper" },
                        React.createElement(ConvoHopNavigation, { convo: convo, isUnreadVisible: isHopNavigationUnreadVisible, onReactionsClick: handleHopNavigationReactionClick, onMentionsClick: handleHopNavigationMentionClick, onUnreadClick: handleHopNavigationUnreadClick, 
                            // onReactionsReadAllClick={onReactionsReadAllClick}
                            onReactionsReadAllClick: () => { }, className: "SpaceChatMain__historyUnread" })),
                    !space.viewerData.isMember ? (React.createElement("div", { className: "SpaceChatMain__join" },
                        React.createElement(SpaceJoinButton, { space: space, variant: "history" }))) : (React.createElement("div", { className: "SpaceChatMain__composer", onDragEnter: handleDragEnter }, getComposerComponent()))))),
        reportModal.isActive && (React.createElement(ReportConvoMessageModal, { peerId: peer.id, messages: messageForReport, onClose: reportModal.close, onSubmit: handleCancelSelecting }))));
};
//# sourceMappingURL=SpaceChatMain.js.map