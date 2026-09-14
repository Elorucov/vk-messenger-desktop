import React, { useCallback, useEffect, useMemo, useRef, useState, useId, } from 'react';
import cx from 'classnames';
import { Icon20CheckCircleOn, Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { ConvoMessage } from '../../ui/ConvoMessage/ConvoMessage';
import { MessageActionsDropdown } from '../../ui/MessageActionsDropdown/MessageActionsDropdown';
import { isOneToOneConvo, } from '../../ui/ConvoHistory/ConvoHistory';
import * as History from '../../../core/model/History';
import * as Message from '../../../core/model/Message';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Attach from '../../../core/model/Attach';
import * as Reaction from '../../../core/model/Reaction';
import { useBrowserEnv, useDidUpdate, useDispatch, useViewer, useFeatureFlags, useInsertIntoCache, useSelectConvo, usePeer, } from '../../hooks/misc';
import { useModal } from '../../hooks/useModal';
import { ContextMenu, } from '../../ui/ContextMenu/ContextMenu';
import { MessageActionsContent } from '../../ui/MessageActionsContent/MessageActionsContent';
import { DeleteMessageModal } from '../../ui/DeleteMessageModal/DeleteMessageModal';
import { MessageViewersModal } from '../../ui/MessageViewersModal/MessageViewersModal';
import { ConfirmPinMessageModal } from '../../ui/ConfirmPinMessageModal/ConfirmPinMessageModal';
import { MessageReactedPeersModal } from '../../ui/MessageReactedPeersModal/MessageReactedPeersModal';
import { useSnackbar } from '../../hooks/useSnackbar';
import { IncognitoReactionModal } from '../../ui/IncognitoReactionModal/IncognitoReactionModal';
import { ConvoMessageWithoutBubble } from '../../ui/ConvoMessage/ConvoMessageWithoutBubble';
import { API_ERROR_FLOOD, API_ERROR_MESSAGES_CHAT_FORWARD_DISABLED, API_ERROR_MESSAGES_SPAM_RESTRICTION, } from '@vkontakte-internal/api-schema-typescript';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useApiFetch } from '../../hooks/useApiFetch';
import { useMessageBlockHighlight } from '../../hooks/useMessageBlockHighlight';
import { PostponedMessageCalendarModal } from '../../ui/PostponedMessageCalendarModal/PostponedMessageCalendarModal';
import { FastEditMessageActionButton, FastForwardMessageActionButton, FastReplyMessageActionButton, } from '../../ui/MessageActionsButton/MessageActionsButton';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
import { useMessageFastReactions } from '../../hooks/useMessageFastReactions';
import { useMessageFastReactionsSuggest } from '../../hooks/useMessageFastReactionsSuggest';
const UPDATE_DURATION = 200;
export const ConvoHistoryMessageBlock = React.memo(function ConvoHistoryMessageBlock({ message, canBeSelected, selectionExists, peerId, isDraftHasEditing, isHead, isSelected, withMessageActions, disableReactionAnimations, isWithoutBubblesTheme, normalMessageActions, 
// ConvoHistoryProps
onCallbackButtonClick, onKeyboardSend, isCompactView = false, onScrollToMessage, onOpenMessageInModal, onCloseMessageInModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, onMessageForward, onSelectMessage, messageReactions, onOpenReport, onUnknownReactionClick, entrypoint, shouldHighlight, highlightSearchQuery, onMessageSizeChange, isThemed, isContrastTheme, setReaction, isNavigating, isLinkedWithPrevious, openClipCoOwnersModal, }) {
    const { settings } = useViewer();
    const { lang, analyticsAppName, analyticsOrigin } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const insertIntoCache = useInsertIntoCache();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const author = usePeer(message.authorId);
    const fastActionsTrigger = useFastActionsTrigger();
    const $messageWrapper = useRef(null);
    const $messageBlock = useRef(null);
    const isPostOnly = Message.isPostOnly(message);
    const isClipOnly = Message.isClipOnly(message);
    const getUnreadReactionId = useCallback((unreadReactions) => {
        let reactionId;
        if (featureFlags.vkm_reactions &&
            message.kind === 'Normal' &&
            unreadReactions.has(message.cmid)) {
            reactionId =
                unreadReactions.get(message.cmid) ??
                    [...message.reactions.keys()].pop();
        }
        return reactionId;
    }, [featureFlags.vkm_reactions, message]);
    const memberId = author.kind !== 'Chat' && author.id;
    const getIsAuthorRestrictedToWrite = useCallback((convo) => {
        if (convo.kind !== 'ChatConvo' || !memberId) {
            return false;
        }
        return !!convo.members.members.get(memberId)?.isRestrictedToWrite;
    }, [memberId]);
    const { isIncognito, isMessageUnread, isForbidedWritingForAll, isDisabled, isCasper, isAuthorRestrictedToWrite, canSendReactions, isSendingPostponedAvailable, convoKind, unreadReactionId, isLastMessage, } = useSelectConvo(peerId, useCallback((convo) => {
        const lastMessage = History.lastNode({
            history: convo.history,
            withDeleted: false,
            withPending: true,
            withFailed: true,
        })?.item;
        return {
            isIncognito: convo.kind === 'ChatConvo' && convo.isIncognito,
            isMessageUnread: Convo.isMessageUnread(convo, message),
            isForbidedWritingForAll: Convo.isForbidedWritingForAll(convo),
            isDisabled: Convo.isDisabled(convo),
            isCasper: Convo.isCasper(convo),
            isAuthorRestrictedToWrite: getIsAuthorRestrictedToWrite(convo),
            canSendReactions: Convo.canSendReactions(convo),
            isSendingPostponedAvailable: Convo.postponedMessagingPermissions(convo)
                .isSendingPostponedAvailable,
            convoKind: convo.kind,
            unreadReactionId: getUnreadReactionId(convo.unreadReactions),
            isLastMessage: lastMessage?.cmid === message.cmid,
        };
    }, [message, getUnreadReactionId, getIsAuthorRestrictedToWrite]));
    const isSelectable = selectionExists && canBeSelected;
    /**
     * Нода для точной работы двойного клика, чтобы
     * вызывать нативное контекстное меню только в тех
     * местах, где это необходимо
     */
    const [rightClickElement, setRightClickElement] = useState(null);
    /**
     * Так как контекстное меню открывается с анимацией, контролируем
     * затенение области сообщения, куда кликнули с помощью дополнительного
     * состояния - момента, когда кликнули
     */
    const [isRightClickActive, setRightClickActive] = useState(false);
    const [isReactionPickerExtended, setReactionPickerExtended] = useState(settings.autoExtendReactionPicker);
    const showNativeContextMenu = useMemo(() => {
        return $messageWrapper.current?.contains(rightClickElement);
    }, [rightClickElement]);
    const { isMobileLayout } = useLayoutData();
    const deleteMessageModal = useModal();
    const messageViewersModal = useModal();
    const reactedPeersModal = useModal();
    const confirmPinMessageModal = useModal();
    const postponedCalendarModal = useModal();
    /**
     * Модалка подверждения деанонимизации для инкогнито юзера при постановке реакции
     */
    const incognitoReactionModal = useModal();
    const [incognitoActiveReaction, setIncognitoActiveReaction] = useState();
    const [incogniteReactionSource, setIncognitoReactionSource] = useState(null);
    useEffect(() => {
        if (incognitoActiveReaction && !incognitoReactionModal.isActive) {
            incognitoReactionModal.open();
            return;
        }
        if (!incognitoActiveReaction && incognitoReactionModal.isActive) {
            incognitoReactionModal.close();
            return;
        }
    }, [incognitoActiveReaction, incognitoReactionModal]);
    const canShowReactions = Boolean(featureFlags.vkm_reactions &&
        messageReactions &&
        messageReactions.assets.size > 0 &&
        message.kind === 'Normal' &&
        canSendReactions &&
        Message.isReactionsAvailable(message));
    const handleReactionClick = (reactionId, source) => {
        if (!canShowReactions) {
            return;
        }
        if (!reactionId) {
            onUnknownReactionClick?.();
            return;
        }
        if (isIncognito &&
            message.kind === 'Normal' &&
            message.reactionId !== reactionId) {
            setIncognitoActiveReaction(reactionId);
            setIncognitoReactionSource(source);
            return;
        }
        setReaction?.(reactionId, message, source);
    };
    const handleIncognitoModalClose = () => {
        setIncognitoActiveReaction(null);
        setIncognitoReactionSource(null);
    };
    const handleIncognitoModalSubmit = () => {
        if (!incognitoActiveReaction) {
            return;
        }
        setReaction?.(incognitoActiveReaction, message, incogniteReactionSource || 'nearby_click');
        setIncognitoActiveReaction(null);
        setIncognitoReactionSource(null);
    };
    const handleDeleteMessageModalClose = (event) => {
        event?.stopPropagation();
        deleteMessageModal.close();
    };
    const handleMessageViewersModalClose = (event) => {
        event?.stopPropagation();
        messageViewersModal.close();
    };
    const handleConfirmPinMessageModalClose = (event) => {
        event?.stopPropagation();
        confirmPinMessageModal.close();
    };
    const handlePostponedCalendarModalClose = (event) => {
        event?.stopPropagation();
        postponedCalendarModal.close();
    };
    const handleChangePostponedTime = (date) => {
        if (date && message.kind === 'Normal') {
            dispatch({
                type: 'UserHitEditPostponed',
                peerId,
                cmid: message.cmid,
                text: Message.toPlainText(message, { multiline: true }),
                attaches: message.attaches,
                keepForwarded: true,
                postponedTime: date.getTime(),
            });
        }
        else if (date && message.kind === 'Queued' && message.hasFailed) {
            dispatch({
                type: 'UserHitResendFailedMessage',
                peerId,
                randomId: message.randomId,
                analyticsAppName,
                analyticsOrigin,
                isPostponed: true,
                updatedPostponedTime: date.getTime(),
            });
        }
        postponedCalendarModal.close();
    };
    const toggleContextMenuRef = useRef();
    const onContextMenu = (e) => {
        if (isSelectable) {
            e.preventDefault();
            return;
        }
        if (e.target instanceof HTMLElement) {
            setRightClickElement(e.target);
        }
        toggleContextMenuRef.current?.({
            preventDefault: e.preventDefault.bind(e),
            x: e.clientX,
            y: e.clientY,
        });
    };
    const handleExtendReactionPicker = useCallback(() => {
        setReactionPickerExtended(true);
    }, []);
    const dropdownHandleRef = useRef();
    const onReactionPickerHeightChange = useCallback((value) => {
        if (isMobileLayout) {
            return;
        }
        // Т.к. реакции спозиционированы абсолютно, задаём отрицательный отступ
        // от верхней границы основного контента.
        dropdownHandleRef.current?.setVerticalShift(-Math.abs(value));
    }, [isMobileLayout, dropdownHandleRef]);
    // @TODO юзать здесь useMessageViewers (проблема с дефолтным значением totalCount)
    const [viewersCount, setViewersCount] = useState(undefined);
    const [viewers, setViewers] = useState([]);
    const fetchMessageViewersCount = useCallback(async () => {
        if (convoKind !== 'ChatConvo') {
            return;
        }
        /* Можем видеть просмотревших только для своих сообщений */
        if (!message.isOut) {
            return;
        }
        /* Для непрочитанного сообщения нет смысла запрашивать просмотревших */
        if (isMessageUnread) {
            return;
        }
        if (message.kind !== 'Normal') {
            return;
        }
        try {
            const { total_count, items = [], profiles, groups, } = await apiFetch('messages.getMessageReadPeers', {
                cmid: message.cmid,
                peer_id: message.peerId,
                count: 3,
                extended: 1,
            });
            insertIntoCache({
                profiles,
                groups,
            });
            setViewersCount(total_count);
            setViewers(items.map(Peer.resolveId));
        }
        catch (e) {
            setViewersCount(null);
        }
    }, [convoKind, message, isMessageUnread, apiFetch, insertIntoCache]);
    const [isDropdownOpened, setDropdownOpened] = useState(false);
    const [isContextMenuOpened, setContextMenuOpened] = useState(false);
    const [updateDropdownContent, setUpdateDropdownContent] = useState(true);
    const setOpened = useCallback((actionType, value) => {
        if (actionType === 'dropdown') {
            setDropdownOpened(value);
            if (value) {
                setContextMenuOpened(false);
            }
        }
        if (actionType === 'contextmenu') {
            setContextMenuOpened(value);
            if (!value) {
                setRightClickActive(false);
            }
            else {
                setDropdownOpened(false);
            }
        }
    }, []);
    const onClose = (actionType) => () => {
        setOpened(actionType, false);
        setReactionPickerExtended(settings.autoExtendReactionPicker);
        // Делаем принудительный апдейт содержимого меню,
        // иначе оно может открыть с раскрытым пикером реакций
        setUpdateDropdownContent(true);
    };
    const onOpen = (actionType) => () => {
        fetchMessageViewersCount();
        setOpened(actionType, true);
        setUpdateDropdownContent(false);
    };
    const onMessageReply = () => {
        if (message.kind === 'Normal') {
            /**
             * Нельзя отвечать на отложенное
             */
            if (message.isPostponed) {
                return;
            }
            dispatch({
                type: 'UserChangedComposerDraft',
                kind: 'reply',
                peerId,
                reply: message,
                isPostponed: false,
            });
            dispatch({
                type: 'UserChangedConvo',
                userAction: 'hide_bot_keyboard',
                peerId,
            });
        }
    };
    const isFastActionsAvailable = message.kind === 'Normal' &&
        !(message.isPostponed && !isSendingPostponedAvailable) &&
        !isForbidedWritingForAll &&
        !isDisabled;
    const reactions = useMemo(() => {
        if (!messageReactions) {
            return [];
        }
        const allowedArr = [...messageReactions.allowedIds];
        const reactions = [...messageReactions.assets.values()]
            .filter(({ id }) => messageReactions.allowedIds.has(id))
            .sort((a, b) => {
            return allowedArr.indexOf(a.id) - allowedArr.indexOf(b.id);
        });
        if (message.kind === 'Normal' &&
            message.reactions.size >= Reaction.MAX_MESSAGE_REACTIONS_COUNT) {
            return reactions.filter(({ id }) => message.reactions.has(id));
        }
        return reactions;
    }, [messageReactions, message]);
    const actions = withMessageActions && fastActionsTrigger.button && (React.createElement(MessageActionsDropdown, { handleRef: dropdownHandleRef, message: message, setOpened: setDropdownOpened, open: isDropdownOpened, onOpen: onOpen('dropdown'), onClose: onClose('dropdown'), watchContentChange: canShowReactions, forceUpdateContent: updateDropdownContent, wrapperClassName: cx('ConvoMessage__actions', isWithoutBubblesTheme
            ? 'ConvoMessage__actions--withoutBubbles'
            : fastActionsTrigger.button === 'tap'
                ? 'ConvoMessage__actions--tap'
                : {
                    'ConvoMessage__actions--click': true,
                    'ConvoMessage__actions--compact': isCompactView,
                }), content: React.createElement(MessageActionsContent, { isOpened: isDropdownOpened, viewersCount: viewersCount, viewers: viewers, normalMessageActions: normalMessageActions, peerId: peerId, message: message, onSelect: onSelectMessage, isCompact: isCompactView, onMessageForward: onMessageForward, reactions: reactions, openDeleteMessageModal: deleteMessageModal.open, openMessageViewersModal: messageViewersModal.open, openConfirmPinMessageModal: confirmPinMessageModal.open, openReactedPeersModal: reactedPeersModal.open, onOpenReport: onOpenReport, isReactionsAvailable: canShowReactions, isReactionsPickerExtended: isReactionPickerExtended, onReactionPickerExtend: handleExtendReactionPicker, onReactionClick: handleReactionClick, onMessageReply: onMessageReply, openPostponedCalendarModal: postponedCalendarModal.open, onReactionPickerHeightChange: onReactionPickerHeightChange }), isLastMessage: isLastMessage }, isFastActionsAvailable && (React.createElement(MessageFastActionsButton, { message: message, isDraftHasEditing: isDraftHasEditing, onMessageForward: onMessageForward, isWithoutBubblesTheme: isWithoutBubblesTheme }))));
    const isHighlighted = useMessageBlockHighlight(shouldHighlight);
    useEffect(() => {
        if (message.kind !== 'Queued' || message.errorCode === undefined) {
            return;
        }
        const snackbarMessage = (() => {
            switch (message.errorCode) {
                case API_ERROR_FLOOD:
                case API_ERROR_MESSAGES_SPAM_RESTRICTION:
                    return lang.use('me_message_send_floodcontrol_and_spamblock_error');
                case API_ERROR_MESSAGES_CHAT_FORWARD_DISABLED:
                    return lang.use('me_message_send_forward_disabled_error');
                default:
                    return;
            }
        })();
        if (snackbarMessage) {
            snackbar({
                before: (React.createElement(Icon24ErrorCircleOutline, { color: "var(--vkui--color_text_negative)" })),
                message: snackbarMessage,
            });
        }
        dispatch({
            type: 'UserHitSend_ErrorSnackbarShown',
            peerId,
            randomId: message.randomId,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message]);
    const [isUpdated, setUpdated] = useState(false);
    useDidUpdate(() => setUpdated(true), [message.updatedAt]);
    useEffect(() => {
        if (!isUpdated) {
            return;
        }
        const intervalId = setTimeout(() => {
            setUpdated(false);
        }, UPDATE_DURATION);
        return () => clearTimeout(intervalId);
    }, [isUpdated]);
    const dblClickTimeout = useRef(null);
    const onClick = (e) => {
        const hasTextSelection = !!window.getSelection()?.toString();
        if ((selectionExists || (isWithoutBubblesTheme && !hasTextSelection)) &&
            message &&
            canBeSelected) {
            onSelectMessage(message, undefined, e.shiftKey);
            return;
        }
        /**
         * Определяем dbl click через событие click, так как по клику на аттачи
         * не хотим делать реплай, а в их компонентах прерываем всплытие клика.
         */
        if (dblClickTimeout.current !== null) {
            const selection = document.getSelection();
            if (
            /**
             * Если по повторному клику появилось выделение на странице, (как правило
             * выделение текста), то не делаем реплай.
             */
            (selection === null || selection.isCollapsed) &&
                !message.attaches.finishedCall &&
                !message.attaches.activeCall) {
                onMessageReply();
            }
        }
        dblClickTimeout.current = window.setTimeout(() => {
            dblClickTimeout.current = null;
        }, 500);
    };
    const onMouseDown = (event) => {
        /**
         * Для работы быстрого реплая не выделяем ничего по дабл клику,
         * если он точно был сделан не по текстовому элементу.
         */
        if (event.detail > 1) {
            if (event.target instanceof HTMLElement &&
                ![...event.target.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)) {
                event.preventDefault();
            }
        }
    };
    const getMediaAttachLinkPayloadWrapper = (params) => message.kind === 'Normal'
        ? getMediaAttachLinkPayload(message.cmid, message.peerId, params)
        : undefined;
    const id = useId();
    const previewId = `${id}preview`;
    const { withClipFastReactions, withPostFastReactions } = useMessageFastReactions({
        message,
        isClipOnly,
        isPostOnly,
        isReactionsAvailable: !!reactions,
        canSendReactions,
    });
    const { withClipFastReactionsSuggest, withPostFastReactionsSuggest, disableClipFastReactionsSuggest, disablePostFastReactionsSuggest, } = useMessageFastReactionsSuggest({
        message,
        convoKind,
        peerId,
        withClipFastReactions,
        withPostFastReactions,
        isLastMessage,
    });
    const withLinkToPreviousMessage = featureFlags.vkm_split_msg_with_clip &&
        isLinkedWithPrevious &&
        !isWithoutBubblesTheme &&
        message.kind === 'Normal' &&
        !!message.linkedCmid &&
        !Attach.hasAttaches(message.attaches) &&
        !Attach.hasMediaAttaches(message.attaches);
    return (React.createElement(React.Fragment, null,
        React.createElement("article", { ref: $messageBlock, "aria-labelledby": previewId, tabIndex: -1, className: cx('ConvoHistory__messageBlock', {
                'ConvoHistory__messageBlock--canBeSelected': isSelectable,
                'ConvoHistory__messageBlock--withContextMenu': fastActionsTrigger.rightClick,
                'ConvoHistory__messageBlock--updated': isUpdated,
                ...(isWithoutBubblesTheme
                    ? {
                        'ConvoHistory__messageBlock--withoutBubbles': true,
                        'ConvoHistory__messageBlockHighlighted--withoutBubbles': isHighlighted,
                        'ConvoHistory__messageBlockCanBeSelected--withoutBubbles': canBeSelected,
                        'ConvoHistory__messageBlockSelected--withoutBubbles': isSelected,
                        'ConvoHistory__messageBlockWithContextMenuActive--withoutBubbles': isRightClickActive,
                    }
                    : {
                        'ConvoHistory__messageBlock--out': message.isOut,
                        'ConvoHistory__messageBlock--clipOnly': isClipOnly,
                        'ConvoHistory__messageBlock--linkedWithPrevious': withLinkToPreviousMessage,
                        'ConvoHistory__messageBlock--selected': isSelected,
                        'ConvoHistory__messageBlock--highlighted': isHighlighted,
                        'ConvoHistory__messageBlock--withContextMenuActive': isRightClickActive,
                    }),
                'ConvoHistory__messageBlock--navigating': isNavigating,
            }), onClick: onClick, onContextMenu: onContextMenu, onMouseDown: onMouseDown },
            React.createElement(SelectToggle, { isWithoutBubblesTheme: !!isWithoutBubblesTheme, canBeSelected: canBeSelected, isOut: message.isOut, isSelected: isSelected, selectionExists: selectionExists, isThemed: !!isThemed, convoKind: convoKind, isHead: isHead }),
            React.createElement("div", { ref: $messageWrapper, className: cx('ConvoHistory__messageWrapper', {
                    'ConvoHistory__messageWrapper--withoutBubbles': isWithoutBubblesTheme,
                }) }, isWithoutBubblesTheme ? (React.createElement(ConvoMessageWithoutBubble, { key: featureFlags.vkm_new_bubbles_width_calc
                    ? message.updatedAt
                    : undefined, peerId: peerId, author: author, message: message, isUnread: isMessageUnread, entrypoint: entrypoint, unreadReactionId: unreadReactionId, isHead: isHead, isAuthorRestrictedToWrite: isAuthorRestrictedToWrite, onKeyboardSend: onKeyboardSend, onCallbackButtonClick: onCallbackButtonClick, isCompact: isCompactView, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: onOpenMessageInModal, onOpenForwardedMessageInModal: onOpenForwardedMessageModal, onCloseForwardedMessageInModal: onCloseForwardedMessageModal, isInsideCasper: isCasper, selectionExists: selectionExists, messageReactions: messageReactions?.assets, reactions: reactions, disableReactionAnimations: disableReactionAnimations, onReactionClick: handleReactionClick, canOpenReactedPeers: convoKind === 'ChatConvo', actions: actions, highlightSearchQuery: highlightSearchQuery, getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, id: previewId, isClipOnly: isClipOnly, withPostFastReactions: withPostFastReactions, withPostFastReactionsSuggest: withPostFastReactionsSuggest, disablePostFastReactionsSuggest: disablePostFastReactionsSuggest, withClipFastReactions: withClipFastReactions, withClipFastReactionsSuggest: withClipFastReactionsSuggest, disableClipFastReactionsSuggest: disableClipFastReactionsSuggest, openClipCoOwnersModal: openClipCoOwnersModal })) : (React.createElement(ConvoMessage, { key: featureFlags.vkm_new_bubbles_width_calc
                    ? message.updatedAt
                    : undefined, peerId: peerId, author: author, entrypoint: entrypoint, message: message, isUnread: isMessageUnread, unreadReactionId: unreadReactionId, isHead: isHead, isSelected: isSelected, isAuthorRestrictedToWrite: isAuthorRestrictedToWrite, onKeyboardSend: onKeyboardSend, onCallbackButtonClick: onCallbackButtonClick, isCompact: isCompactView, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: onOpenMessageInModal, onCloseMessageInModal: onCloseMessageInModal, onOpenForwardedMessageInModal: onOpenForwardedMessageModal, onCloseForwardedMessageInModal: onCloseForwardedMessageModal, isInsideCasper: isCasper, selectionExists: selectionExists, messageReactions: messageReactions?.assets, reactions: reactions, disableReactionAnimations: disableReactionAnimations, onReactionClick: handleReactionClick, canOpenReactedPeers: convoKind === 'ChatConvo', actions: actions, highlightSearchQuery: highlightSearchQuery, getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, onSizeChange: onMessageSizeChange, isThemed: isThemed, isContrastTheme: isContrastTheme, id: previewId, isClipOnly: isClipOnly, withPostFastReactions: withPostFastReactions, withPostFastReactionsSuggest: withPostFastReactionsSuggest, disablePostFastReactionsSuggest: disablePostFastReactionsSuggest, withClipFastReactions: withClipFastReactions, withClipFastReactionsSuggest: withClipFastReactionsSuggest, withLinkToPreviousMessage: withLinkToPreviousMessage, disableClipFastReactionsSuggest: disableClipFastReactionsSuggest, openClipCoOwnersModal: openClipCoOwnersModal }))),
            React.createElement(NavigationSelectToggle, { canBeSelected: canBeSelected, isSelected: isSelected, toggleSelect: () => onSelectMessage(message, undefined) }),
            withMessageActions && fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { getToggleOpen: (toggleOpen) => {
                    toggleContextMenuRef.current = toggleOpen;
                }, allowNativeContextMenu: isContextMenuOpened && showNativeContextMenu, open: isContextMenuOpened, onStartOpening: () => setRightClickActive(true), onOpen: onOpen('contextmenu'), onClose: onClose('contextmenu'), forceUpdateContent: updateDropdownContent, content: React.createElement(MessageActionsContent, { classNames: cx({
                        'MesageActionsContent__wrapper--in-contextMenu': canShowReactions,
                    }), normalMessageActions: normalMessageActions, isOpened: isContextMenuOpened, viewersCount: viewersCount, viewers: viewers, peerId: peerId, message: message, onSelect: onSelectMessage, onMessageForward: onMessageForward, reactions: reactions, onMessageReply: onMessageReply, openDeleteMessageModal: deleteMessageModal.open, openMessageViewersModal: messageViewersModal.open, openConfirmPinMessageModal: confirmPinMessageModal.open, openReactedPeersModal: reactedPeersModal.open, openPostponedCalendarModal: postponedCalendarModal.open, isReactionsAvailable: canShowReactions, isReactionsPickerExtended: isReactionPickerExtended, onReactionPickerExtend: handleExtendReactionPicker, onReactionClick: handleReactionClick, onOpenReport: onOpenReport }) }))),
        deleteMessageModal.isActive && message.kind === 'Normal' && (React.createElement(DeleteMessageModal, { peerId: peerId, messages: [message], handleModalClose: handleDeleteMessageModalClose, isPostponed: Boolean(message.isPostponed) })),
        messageViewersModal.isActive && message.kind === 'Normal' && (React.createElement(MessageViewersModal, { message: message, handleModalClose: handleMessageViewersModalClose })),
        confirmPinMessageModal.isActive && message.kind === 'Normal' && (React.createElement(ConfirmPinMessageModal, { peerId: peerId, message: message, handleModalClose: handleConfirmPinMessageModalClose })),
        postponedCalendarModal.isActive && (React.createElement(PostponedMessageCalendarModal, { messageSentAt: message.sentAt, onSave: handleChangePostponedTime, onClose: handlePostponedCalendarModalClose })),
        reactedPeersModal.isActive &&
            message.kind === 'Normal' &&
            messageReactions && (React.createElement(MessageReactedPeersModal, { cmid: message.cmid, peerId: peerId, messageReactions: messageReactions.assets, onClose: reactedPeersModal.close })),
        incognitoReactionModal.isActive && (React.createElement(IncognitoReactionModal, { onClose: handleIncognitoModalClose, onSubmit: handleIncognitoModalSubmit }))));
});
export function getMediaAttachLinkPayload(cmid, peerId, params) {
    return {
        kind: 'message',
        cmid,
        peerId,
        // Для фото и видео аттачей необходим параметр mediaViewerItemPosition для поддержки сквозного просмотра
        ...(params &&
            'mediaViewerItemPosition' in params && {
            mediaViewerItemPosition: params.mediaViewerItemPosition,
        }),
        // Флаг, который сразу открывает клипы по рекомендации с id из клипа, минуя сам клип
        ...(params &&
            'showRecommendations' in params && {
            showRecommendations: params.showRecommendations,
        }),
    };
}
const SelectToggle = ({ isWithoutBubblesTheme, canBeSelected, isOut, isSelected, selectionExists, isThemed, convoKind, isHead, }) => {
    return (React.createElement(DeferredRendering, null,
        !isWithoutBubblesTheme && canBeSelected && (React.createElement("div", { className: cx('ConvoHistory__selectToggler', {
                'ConvoHistory__selectToggler--out': isOut,
                'ConvoHistory__selectToggler--active': isSelected,
                'ConvoHistory__selectToggler--visible': selectionExists,
                'ConvoHistory__selectToggler--themed': isThemed,
                'ConvoHistory__selectToggler--noAuthorAvatar': !isOut && isOneToOneConvo(convoKind),
            }) },
            React.createElement(Icon20CheckCircleOn, { className: "ConvoHistory__selectTogglerIcon" }))),
        isWithoutBubblesTheme && canBeSelected && (React.createElement("div", { className: cx('ConvoHistory__selectToggler--withoutBubbles', {
                'ConvoHistory__selectTogglerActive--withoutBubbles': isSelected,
                'ConvoHistory__selectTogglerInActive--withoutBubbles': !isSelected,
                'ConvoHistory__selectTogglerNoAuthorAvatar--withoutBubbles': !isHead,
            }) },
            React.createElement(Icon20CheckCircleOn, { className: "ConvoHistory__selectTogglerIcon--withoutBubbles" })))));
};
/**
 * Компонент чекбокса выделения сообщения с клавиатуры
 */
const NavigationSelectToggle = ({ canBeSelected, isSelected, toggleSelect }) => {
    const { lang } = useBrowserEnv();
    return (canBeSelected && (React.createElement("div", { className: "ConvoHistory__navigationSelectTogglerContainer" },
        React.createElement(VisuallyHidden, { Component: "input", type: "checkbox", onChange: toggleSelect, checked: isSelected, "aria-label": lang.use('me_aria_select_message'), 
            /**
             * При клавиатурном взаимодействии с инпутом вызывается
             * событие клика, прерываем всплытие, чтобы не вызывался
             * обработчик на контейнере сообщения.
             */
            onClick: (e) => {
                e.stopPropagation();
            } }))));
};
const MessageFastActionsButton = ({ message, isDraftHasEditing, onMessageForward, isWithoutBubblesTheme, }) => {
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const withFastForward = featureFlags.vkm_forward_clean_attachment &&
        !Message.hasText(message) &&
        Message.shouldSendAttachesSeparatelyFromTheText(message);
    const withFastEdit = Message.isEditable(message, Date.now()) && isWithoutBubblesTheme;
    const withFastReply = !isDraftHasEditing &&
        !withFastEdit &&
        !message.isPostponed &&
        !message.attaches.widget &&
        !message.attaches.activeCall &&
        !message.attaches.finishedCall &&
        isWithoutBubblesTheme;
    const onMessageReply = () => {
        /**
         * Нельзя отвечать на отложенное
         */
        if (message.isPostponed) {
            return;
        }
        dispatch({
            type: 'UserChangedComposerDraft',
            kind: 'reply',
            peerId: message.peerId,
            reply: message,
            isPostponed: false,
        });
        dispatch({
            type: 'UserChangedConvo',
            userAction: 'hide_bot_keyboard',
            peerId: message.peerId,
        });
    };
    const onMessageEdit = () => {
        dispatch({
            type: 'UserChangedComposerDraft',
            kind: 'editing',
            editing: message,
            peerId: message.peerId,
            isPostponed: !!message.isPostponed,
        });
    };
    if (!withFastEdit && !withFastReply && !withFastForward) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        withFastEdit && React.createElement(FastEditMessageActionButton, { onClick: onMessageEdit }),
        withFastForward && onMessageForward && (React.createElement(FastForwardMessageActionButton, { onClick: () => onMessageForward(message) })),
        withFastReply && (React.createElement(FastReplyMessageActionButton, { onClick: onMessageReply }))));
};
//# sourceMappingURL=ConvoHistoryMessageBlock.js.map