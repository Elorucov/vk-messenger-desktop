import '../../ui/ImportantMessagesList/ImportantMessagesList.css';
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useState, } from 'react';
import * as Peer from '../../../core/model/Peer';
import { ConvoMessage } from '../../ui/ConvoMessage/ConvoMessage';
import { BrowserEnvProvider, useBrowserEnv, useDispatch, useFeatureFlags, useOwner, usePeers, useViewer, } from '../../hooks/misc';
import { ConvoStack } from '../../ui/ConvoStack/ConvoStack';
import { Icon16Favorite, Icon16FavoriteOutline, Icon56FavoriteOutline, } from '@vkontakte/icons';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { Spinner } from '@vkontakte/vkui';
import cx from 'classnames';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { MEAppVideoMessagePlayer } from '../../env/MEAppPlayers';
import { MEAppMediaMediator } from '../../env/MEAppMediaMediator';
import { useRouter } from '../../ui/Router/Router';
import { MessageReactionAnimationProvider, } from '../../hooks/useMessageReactionAnimation';
import { getMediaAttachLinkPayload } from '../../ui/ConvoHistoryMessageBlock/ConvoHistoryMessageBlock';
import { isMessageWithStickerWithIcon } from '../../utils/stickers';
import { isSameDate } from '../../../core/utils/misc';
import { DateSeparator } from '../../ui/DateSeparator/DateSeparator';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
const ImportantMessagesList = ({ importantMessages, goToMessage, onOpenMessageInModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, openClipCoOwnersModal, }) => {
    const peers = usePeers();
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const loadMore = useCallback(() => {
        dispatch({
            type: 'LoadImportantMessages',
        });
    }, [dispatch]);
    useLayoutEffect(() => {
        loadMore();
        return () => {
            dispatch({
                type: 'UserClosedImportantMessages',
            });
        };
    }, [loadMore, dispatch]);
    const handleImportantIconClick = useCallback((message, markImportant) => {
        dispatch({
            type: 'UserChangedMessage',
            userAction: markImportant ? 'mark_important' : 'unmark_important',
            cmids: [message.cmid],
            peerId: message.peerId,
        });
    }, [dispatch]);
    const listRenderer = useMemo(() => {
        let stack = [];
        return [...importantMessages.messages.values()].reduce((result, message, index, arr) => {
            const author = Peer.safeGet(peers, message.authorId);
            const getMediaAttachLinkPayloadWrapper = (params) => ({
                ...getMediaAttachLinkPayload(message.cmid, message.peerId, params),
                // В важных не поддерживаем сквозной просмотр
                mediaViewerItemPosition: undefined,
            });
            stack.push(React.createElement(ConvoStack, { key: `${message.peerId}_${message.cmid}`, peerId: author.id, isOut: false, isCentered: false, isOneToOneConvo: false, selected: [], className: cx('ImportantMessagesList__flowStack', vkm_new_bubbles_width_calc &&
                    'ImportantMessagesList__flowStackRefactored') },
                React.createElement(ConvoMessage, { isHead: true, showSentFrom: true, isSelected: false, peerId: message.peerId, author: author, message: message, isUnread: false, unreadReactionId: undefined, onScrollToMessage: ({ peerId, cmid }) => goToMessage({ peerId, entrypoint: 'important_messages', cmid }), onKeyboardSend: () => { }, isInsideCasper: false, onOpenMessageInModal: onOpenMessageInModal, getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, onOpenForwardedMessageInModal: onOpenForwardedMessageModal, onCloseForwardedMessageInModal: onCloseForwardedMessageModal, openClipCoOwnersModal: openClipCoOwnersModal, isUsedInModal: true }),
                React.createElement(Tooltip, { position: "top", align: "center", content: message.isImportant
                        ? lang.use('me_message_action_mark_unimportant')
                        : lang.use('me_message_action_mark_important'), tooltipClassName: "ImportantMessagesList__markActionTooltip" },
                    React.createElement("button", { type: "button", "aria-label": message.isImportant
                            ? lang.use('me_message_action_mark_unimportant')
                            : lang.use('me_message_action_mark_important'), onClick: (event) => {
                            event.stopPropagation();
                            handleImportantIconClick(message, !message.isImportant);
                        }, className: cx('ImportantMessagesList__importantButton', {
                            'ImportantMessagesList__importantButton--inactive': !message.isImportant,
                        }), style: {
                            '--important-button-absolute-right-margin': !message.isOut &&
                                !message.replyMessage &&
                                isMessageWithStickerWithIcon(message)
                                ? '-32px'
                                : '-22px',
                        } }, message.isImportant ? (React.createElement(Icon16Favorite, null)) : (React.createElement(Icon16FavoriteOutline, null))))));
            const nextMessage = arr[index + 1];
            if (!nextMessage || !isSameDate(nextMessage.sentAt, message.sentAt)) {
                result.push(React.createElement("div", null,
                    React.createElement("div", { role: "presentation", className: "StickyDateSeparator" },
                        React.createElement(DateSeparator, { date: message.sentAt, isActive: true, isVisible: true })),
                    stack));
                stack = [];
            }
            return result;
        }, []);
    }, [
        importantMessages.messages,
        peers,
        onOpenMessageInModal,
        goToMessage,
        onOpenForwardedMessageModal,
        onCloseForwardedMessageModal,
        lang,
        handleImportantIconClick,
        vkm_new_bubbles_width_calc,
        openClipCoOwnersModal,
    ]);
    if (importantMessages.messages.size === 0) {
        return (React.createElement("div", { className: "ImportantMessagesList_emptyWrapper" }, importantMessages.hasMore ? (React.createElement(Spinner, { size: "s" })) : (React.createElement(React.Fragment, null,
            React.createElement(Icon56FavoriteOutline, null),
            lang.use('me_important_messages_modal_empty')))));
    }
    return (React.createElement(ScrollbarProvider, { overflowX: "hidden", forceVisible: "y", scrollableProps: {
            style: isMobileLayout
                ? undefined
                : { maxHeight: 'calc(100vh - 300px)' },
        } },
        React.createElement("div", { className: "ImportantMessagesList" },
            listRenderer,
            importantMessages.hasMore && (React.createElement("div", { className: "ImportantMessagesList__loaderWrapper" },
                React.createElement(OptimizedSpinner, { size: "m", key: "loader", className: "ImportantMessagesList__loader", onIntersection: loadMore }))))));
};
export const ImportantMessagesModal = ({ importantMessages, goToMessage, onOpenMessageInModal, onOpenForwardedMessageModal, onCloseForwardedMessageModal, openClipCoOwnersModal, }) => {
    const { pop } = useRouter();
    const { storage } = useBrowserEnv();
    const viewer = useViewer();
    const owner = useOwner();
    const viewerId = viewer.id;
    const ownerId = owner.id;
    // Создаем отдельный инстанс видеоплеера, чтобы он не конфликтовал с видеоплеером в ConvoHistory
    const videoMessagePlayer = useMemo(() => {
        const mediaMediator = new MEAppMediaMediator(ownerId || viewerId);
        return new MEAppVideoMessagePlayer(mediaMediator, storage);
    }, [ownerId, storage, viewerId]);
    const modalTitleId = useId();
    useEffect(() => () => {
        videoMessagePlayer.dispose();
    }, [videoMessagePlayer]);
    const browserEnv = {
        ...useBrowserEnv(),
        videoMessagePlayer,
    };
    const { lang } = browserEnv;
    const [activeAnimations, setActiveAnimations] = useState([]);
    const activeAnimationsContextValue = useMemo(() => ({ activeAnimations, setActiveAnimations }), [activeAnimations]);
    return (React.createElement(BrowserEnvProvider, { value: browserEnv },
        React.createElement(MessageReactionAnimationProvider, { value: activeAnimationsContextValue },
            React.createElement(ModalView, { onEscape: pop },
                React.createElement(ModalBackdrop, { onClick: pop, isBodyScrollDisabled: true, stickersPopupRootContainerId: "popup-sticker-important-messages-list-container" },
                    React.createElement(ModalPanel, { className: "ImportantMessagesList__modal", ariaLabelledby: modalTitleId },
                        React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: pop, title: lang.use('me_important_messages_modal_title'), titleId: modalTitleId }),
                        React.createElement(ModalBody, { withCustomLayout: true },
                            React.createElement(ImportantMessagesList, { importantMessages: importantMessages, goToMessage: goToMessage, onOpenMessageInModal: onOpenMessageInModal, onOpenForwardedMessageModal: onOpenForwardedMessageModal, onCloseForwardedMessageModal: onCloseForwardedMessageModal, openClipCoOwnersModal: openClipCoOwnersModal }))))))));
};
//# sourceMappingURL=ImportantMessagesList.js.map