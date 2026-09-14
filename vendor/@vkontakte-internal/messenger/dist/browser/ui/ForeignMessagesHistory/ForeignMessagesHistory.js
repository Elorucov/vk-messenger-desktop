import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useBrowserEnv, useConvo, usePeer, usePeers, useViewer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { getMediaAttachLinkPayload } from '../../ui/ConvoHistoryMessageBlock/ConvoHistoryMessageBlock';
import { ConvoStack } from '../../ui/ConvoStack/ConvoStack';
import { ConvoMessage } from '../../ui/ConvoMessage/ConvoMessage';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import { StickyDateSeparator } from '../../ui/DateSeparator/DateSeparator';
import { useStickyDates } from '../../hooks/useStickyDates';
import { isSameDate, noop, noopArray } from '../../../core/utils/misc';
import './ForeignMessagesHistory.css';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ConvoMessageWithoutBubble } from '../../ui/ConvoMessage/ConvoMessageWithoutBubble';
import { classNames as cx } from '@vkontakte/vkjs';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { MessageActionsDropdown } from '../../ui/MessageActionsDropdown/MessageActionsDropdown';
import { ContextMenu, } from '../../ui/ContextMenu/ContextMenu';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { CommonCopyMessageTextAction } from '../../ui/MessageActionsMenu/CommonCopyMessageTextAction';
import { Icon20MessageArrowRightOutline } from '@vkontakte/icons';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import * as ThemeStyle from '../../../core/model/ThemeStyle';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { Spinner, Footnote, Flex, Button } from '@vkontakte-internal/vkcom-kit';
export const ForeignMessagesHistory = ({ message, rootMessage, isCompact = false, onOpen, onBack, onGoToMessage, onClose, openClipCoOwnersModal, isLoading, isError, refetchFullMessage, }) => {
    const [container, setContainer] = useState(null);
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const { registerStickyDate } = useStickyDates({
        container,
    });
    const { settings } = useViewer();
    const convo = useConvo(rootMessage.peerId);
    const { isThemed, themeAppearance, themeBackground } = useCurrentThemeStyle({
        forceThemeStyleId: convo?.styleId !== ThemeStyle.SYSTEM_STYLE_ID && settings.showThemeStyles
            ? convo?.styleId
            : undefined,
    });
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    const list = useMemo(() => {
        const foreignMessages = [...(message.forwardedMessages ?? [])];
        if (message.replyMessage && message.replyMessage.kind === 'Foreign') {
            foreignMessages.push(message.replyMessage);
        }
        return foreignMessages
            .sort((a, b) => a.sentAt - b.sentAt)
            .reduce((result, msg, index, arr) => {
            if (!isSameDate(arr[index - 1]?.sentAt || 0, msg.sentAt)) {
                result.push(React.createElement("div", { key: `date-${msg.sentAt}` },
                    React.createElement(StickyDateSeparator, { date: msg.sentAt, registerStickyDate: registerStickyDate, forcedIsVisible: true, isThemed: isThemed })));
            }
            result.push(React.createElement("div", { key: `msg-${msg.rootPeerId}_${msg.cmid}`, className: "ForeignMessagesHistory__messageBlock" },
                React.createElement(MessageBlock, { message: msg, rootMessage: rootMessage, onOpenForwardedMessageModal: onOpen, onCloseForwardedMessageModal: onClose, onScrollToMessage: onGoToMessage, openClipCoOwnersModal: openClipCoOwnersModal, isCompact: isCompact })));
            return result;
        }, []);
    }, [
        isCompact,
        message.forwardedMessages,
        message.replyMessage,
        onClose,
        onGoToMessage,
        onOpen,
        openClipCoOwnersModal,
        registerStickyDate,
        rootMessage,
        isThemed,
    ]);
    const scrollableProps = useMemo(() => ({
        ref: setContainer,
    }), []);
    const messageWidthStyle = (isWithoutBubblesTheme
        ? {
            '--maxMessageWidth': '100%',
        }
        : {});
    return (React.createElement("div", { className: "ForeignMessagesHistory__main", style: themeAppearanceStyles },
        React.createElement(Header, { message: message, onClick: onBack }),
        React.createElement("div", { className: cx('ForeignMessagesHistory__themeWrapper', {
                MEAppThemeStylesContrastEnable: isThemed,
            }) },
            themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
            React.createElement(ScrollbarProvider, { overflowX: "hidden", className: "ForeignMessagesHistory__body", scrollableProps: scrollableProps },
                React.createElement("div", { className: "ForeignMessagesHistory__content", style: messageWidthStyle },
                    list,
                    isLoading && (React.createElement(Spinner, { className: "ForeignMessagesHistory__spinner" })),
                    isError && (React.createElement(FetchFullMessageError, { refetchFullMessage: refetchFullMessage })))))));
};
export const ForeignMessagesHistoryModal = ({ message, rootMessage, onClose, onBack, onOpen, onGoToMessage, openClipCoOwnersModal, isCompact, isBackVisible = false, isLoading, isError, refetchFullMessage, }) => {
    const { lang, videoMessagePlayer } = useBrowserEnv();
    const onModalClose = useCallback(() => {
        onClose();
        videoMessagePlayer.stop();
    }, [onClose, videoMessagePlayer]);
    return (React.createElement(ModalView, { onEscape: onModalClose, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: onModalClose, stickersPopupRootContainerId: "popup-sticker-messages-history-modal-container" },
            React.createElement(ModalPanel, { className: "ForeignMessagesHistory" },
                React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: onModalClose, onBack: isBackVisible ? onBack : undefined, backLabel: lang.use('me_back'), title: lang.use('me_view_message') }),
                React.createElement("div", { className: "ForeignMessagesHistory__modalWrapper" },
                    React.createElement(ForeignMessagesHistory, { message: message, rootMessage: rootMessage, onBack: onBack, onClose: onClose, onOpen: onOpen, onGoToMessage: onGoToMessage, openClipCoOwnersModal: openClipCoOwnersModal, isCompact: isCompact, isLoading: isLoading, isError: isError, refetchFullMessage: refetchFullMessage }))))));
};
const Header = ({ message, onClick }) => {
    const peers = usePeers();
    const author = Peer.safeGet(peers, message.authorId);
    return (React.createElement("div", { className: "ForeignMessagesHistory__top", tabIndex: 0, role: "button", onClick: onClick },
        React.createElement("div", { className: "ForeignMessagesHistory__topAuthor" }, Peer.name(author)),
        React.createElement("div", { className: "ForeignMessagesHistory__topMessage" },
            React.createElement(MessagePreview, { message: message }))));
};
const MessageBlock = ({ message, rootMessage, isCompact, onOpenForwardedMessageModal, onCloseForwardedMessageModal, onScrollToMessage, openClipCoOwnersModal, }) => {
    const author = usePeer(message.authorId);
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const fastActionsTrigger = useFastActionsTrigger();
    const peerId = rootMessage.peerId;
    const $messageWrapper = useRef(null);
    const [isDropdownOpened, setDropdownOpened] = useState(false);
    const [isContextMenuOpened, setContextMenuOpened] = useState(false);
    const [rightClickElement, setRightClickElement] = useState(null);
    const showNativeContextMenu = useMemo(() => {
        return $messageWrapper.current?.contains(rightClickElement);
    }, [rightClickElement]);
    const toggleContextMenuRef = useRef();
    const onContextMenu = useCallback((e) => {
        if (e.target instanceof HTMLElement) {
            setRightClickElement(e.target);
        }
        toggleContextMenuRef.current?.({
            preventDefault: e.preventDefault.bind(e),
            x: e.clientX,
            y: e.clientY,
        });
    }, []);
    const setOpened = useCallback((actionType, value) => {
        if (actionType === 'dropdown') {
            setDropdownOpened(value);
            if (value) {
                setContextMenuOpened(false);
            }
        }
        if (actionType === 'contextmenu') {
            setContextMenuOpened(value);
            if (value) {
                setDropdownOpened(false);
            }
        }
    }, []);
    const onClose = useCallback((actionType) => () => {
        setOpened(actionType, false);
    }, [setOpened]);
    const onOpen = useCallback((actionType) => () => {
        setOpened(actionType, true);
    }, [setOpened]);
    const getMediaAttachLinkPayloadWrapper = useCallback((params) => 'rootCmid' in message
        ? getMediaAttachLinkPayload(message.rootCmid, message.rootPeerId, params)
        : undefined, [message]);
    const handleGoToMessage = useCallback(({ cmid, peerId }) => {
        onCloseForwardedMessageModal();
        onScrollToMessage({ peerId, entrypoint: 'go_to_source_message', cmid });
    }, [onCloseForwardedMessageModal, onScrollToMessage]);
    const hasMenu = (!message.isUnavailable && !isCompact) || message.chunks.length > 0;
    const actions = useMemo(() => fastActionsTrigger.button && (React.createElement(MessageActionsDropdown, { message: message, setOpened: setDropdownOpened, open: isDropdownOpened, onOpen: onOpen('dropdown'), onClose: onClose('dropdown'), wrapperClassName: cx('ConvoMessage__actions', isWithoutBubblesTheme
            ? 'ConvoMessage__actions--withoutBubbles'
            : fastActionsTrigger.button === 'tap'
                ? 'ConvoMessage__actions--tap'
                : {
                    'ConvoMessage__actions--click': true,
                }), content: React.createElement(ForwardedMessageActions, { message: message, isCompact: isCompact, onGoToMessage: handleGoToMessage }) })), [
        fastActionsTrigger,
        handleGoToMessage,
        isCompact,
        isDropdownOpened,
        isWithoutBubblesTheme,
        message,
        onClose,
        onOpen,
    ]);
    return (React.createElement("div", { ref: $messageWrapper, onContextMenu: onContextMenu },
        isWithoutBubblesTheme && !isCompact ? (React.createElement(ConvoMessageWithoutBubble, { isHead: true, peerId: peerId, author: author, message: message, rootMessage: rootMessage, isUnread: false, unreadReactionId: undefined, onScrollToMessage: handleGoToMessage, onKeyboardSend: noop, isInsideCasper: false, onOpenForwardedMessageInModal: onOpenForwardedMessageModal, onCloseForwardedMessageInModal: onCloseForwardedMessageModal, onOpenMessageInModal: onOpenForwardedMessageModal, openClipCoOwnersModal: openClipCoOwnersModal, getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, isUsedInModal: true, isCompact: isCompact, entrypoint: "forward_messages_target", actions: hasMenu ? actions : null, isForwarded: true })) : (React.createElement(ConvoStack, { key: `${message.peerId}_${message.cmid}`, peerId: author.id, isOut: false, isCentered: false, isOneToOneConvo: false, selected: noopArray, className: "ForeignMessagesHistory__flowStack" },
            React.createElement("div", { className: "ForeignMessagesHistory__messageWrapper" },
                React.createElement(ConvoMessage, { isHead: true, isSelected: false, peerId: peerId, author: author, message: message, rootMessage: rootMessage, isUnread: false, unreadReactionId: undefined, onScrollToMessage: handleGoToMessage, onKeyboardSend: noop, isInsideCasper: false, onOpenForwardedMessageInModal: onOpenForwardedMessageModal, onCloseForwardedMessageInModal: onCloseForwardedMessageModal, onOpenMessageInModal: onOpenForwardedMessageModal, onCloseMessageInModal: onCloseForwardedMessageModal, getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, isUsedInModal: true, isCompact: isCompact, entrypoint: "forward_messages_target", actions: hasMenu ? actions : null, openClipCoOwnersModal: openClipCoOwnersModal, isForwarded: true })))),
        fastActionsTrigger.rightClick && hasMenu && (React.createElement(ContextMenu, { getToggleOpen: (toggleOpen) => {
                toggleContextMenuRef.current = toggleOpen;
            }, allowNativeContextMenu: isContextMenuOpened && showNativeContextMenu, open: isContextMenuOpened, onOpen: onOpen('contextmenu'), onClose: onClose('contextmenu'), content: React.createElement(ForwardedMessageActions, { isCompact: isCompact, message: message, onGoToMessage: handleGoToMessage }) }))));
};
const ForwardedMessageActions = ({ message, isCompact, onGoToMessage, }) => {
    const { lang } = useBrowserEnv();
    const peerId = message.peerId;
    const actionsList = useMemo(() => {
        return [
            React.createElement(CommonCopyMessageTextAction, { chunks: message.chunks, key: "copy-text" }),
            !message.isUnavailable && !isCompact && peerId && (React.createElement(ActionsMenuAction, { key: "go-to", leftIcon: React.createElement(Icon20MessageArrowRightOutline, null), title: lang.use('me_go_to_message'), onClick: () => onGoToMessage({ peerId, cmid: message.cmid }), type: "secondary" })),
        ];
    }, [
        isCompact,
        lang,
        message.chunks,
        message.cmid,
        message.isUnavailable,
        onGoToMessage,
        peerId,
    ]);
    return React.createElement(ActionsMenu, null, actionsList);
};
const FetchFullMessageError = ({ refetchFullMessage, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Flex, { align: "center", direction: "column" },
        React.createElement(Footnote, { className: "FetchFullMessageError_text" }, lang.use('me_full_message_fetch_error')),
        React.createElement(Button, { size: "s", mode: "tertiary", onClick: refetchFullMessage }, lang.use('me_error_repeat_button'))));
};
//# sourceMappingURL=ForeignMessagesHistory.js.map