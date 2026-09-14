import '../../ui/ConvoMessage/ConvoMessageWithoutBubble.css';
import React from 'react';
import cx from 'classnames';
import { useBrowserEnv, useOwner, useFeatureFlags, useDispatch, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Message from '../../../core/model/Message';
import { RepliedMessage } from '../../ui/RepliedMessage/RepliedMessage';
import { Attachments, MediaAttachments, } from '../../ui/Attachments/Attachments';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { MessageText } from '../../ui/MessageText/MessageText';
import { ForwardedMessage } from '../../ui/ForwardedMessage/ForwardedMessage';
import { AttachGift } from '../../ui/AttachGift/AttachGift';
import * as Attach from '../../../core/model/Attach';
import { BotKeyboard } from '../../ui/BotKeyboard/BotKeyboard';
import { BotTemplateList } from '../../ui/BotTemplateControls/BotTemplateList';
import { AttachVideoMessage } from '../../ui/AttachVideoMessage/AttachVideoMessage';
import { AttachStory } from '../../ui/AttachStory/AttachStory';
import { AttachUGCSticker } from '../../ui/AttachUGCSticker/AttachUGCSticker';
import { HIGHLIGHTER_STYLES_ACCENT } from '../../ui/Highlighter/Highlighter';
import { Avatar } from '../../ui/Avatar/Avatar';
import { ConvoMessageInfoWithoutBubblesTheme } from '../../ui/ConvoMessageInfoWithoutBubblesTheme/ConvoMessageInfoWithoutBubblesTheme';
import { ConvoMessageHeader } from '../../ui/ConvoMessageHeader/ConvoMessageHeader';
import { Time } from '../../../core/utils/time';
import { Link } from '../../ui/Link/Link';
import { ConvoMessageReactions } from '../../ui/ConvoMessage/ConvoMessageReactions';
import { ConvoMessageEditedTimeTooltip } from '../../ui/ConvoMessageEditedTimeTooltip/ConvoMessageEditedTimeTooltip';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { ForwardedMessagesList } from '../../ui/ForwardedMessagesList/ForwardedMessagesList';
import { isDev } from '../../../core/utils/misc';
import { ConvoMessageFastReactionsMenu } from '../../ui/ConvoMessageFastReactionsMenu/ConvoMessageFastReactionsMenu';
/**
 * Хоть сообщения и пиры меняются редко, не оптимизируем через React.memo,
 * поскольку основной сценарий использования этого компонента внутри
 * оптимизированного компонента ConvoHistoryMessageBlock, каждый перерендер
 * которого ведет в перерендеру этого компонента.
 */
export const ConvoMessageWithoutBubble = function ConvoMessageWithoutBubble({ peerId, author, message, rootMessage, isUnread, unreadReactionId, isHead, isAuthorRestrictedToWrite, isCompact = false, showSentFrom, messageReactions, reactions, onKeyboardSend, onCallbackButtonClick, isInsideCasper, selectionExists, actions, disableReactionAnimations = false, onScrollToMessage, onOpenMessageInModal, onOpenForwardedMessageInModal, onCloseForwardedMessageInModal, onReactionClick, canOpenReactedPeers, entrypoint, highlightSearchQuery, isUsedInModal = false, getMediaAttachLinkPayload, id: elementId, isClipOnly, withClipFastReactions, withClipFastReactionsSuggest, withPostFastReactions, withPostFastReactionsSuggest, disableClipFastReactionsSuggest, disablePostFastReactionsSuggest, openClipCoOwnersModal, isForwarded, }) {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const featureFlags = useFeatureFlags();
    const dispatch = useDispatch();
    const { isChanging: isMainPanelChanging } = useCollapsibleContainer();
    const id = message.kind === 'Queued' ? message.randomId : message.cmid;
    const scrollToMsg = () => {
        if (!message.cmid) {
            return;
        }
        if (message.kind === 'Normal' && message.isPostponed) {
            /**
             * cmid в отложках пересекаются с cmid в обычной истории сообщений.
             */
            return;
        }
        const isUnavailable = 'isUnavailable' in message ? message.isUnavailable : false;
        onScrollToMessage({
            cmid: message.cmid,
            peerId,
            isUnavailable,
        });
    };
    const attaches = message.attaches;
    const hasText = Message.hasText(message);
    const withSticker = attaches.sticker || attaches.ugcSticker;
    const storyCommentText = attaches.story && hasText;
    const storyCommentSticker = attaches.story && !!withSticker;
    const storyComment = storyCommentText || storyCommentSticker;
    const hasForwardedMessages = message.forwardedMessages && message.forwardedMessages.length > 0;
    const knownAttachesLength = Object.keys(attaches).filter((key) => key !== 'unknown').length;
    const isEmpty = !hasText && knownAttachesLength === 0 && !hasForwardedMessages;
    const isFavorites = Peer.isFavorites(peerId, owner.id);
    const hasAttaches = Attach.hasAttaches(message.attaches);
    const isOut = message.kind !== 'Foreign' && message.isOut;
    const rootMsg = message.kind === 'Foreign' ? rootMessage : message;
    /**
     * Для публичных видео
     */
    const isPublicVideo = Attach.hasPublicVideo(message.attaches);
    const hasMediaAttaches = Attach.hasMediaAttaches(message.attaches);
    const showDate = !isInsideCasper;
    /**
     * Отображать имя автора в баббле сообщения
     */
    const withAuthorName = showSentFrom || isHead;
    const ttl = message.expireTTL || (isInsideCasper ? message.deleteTTL : undefined);
    const handleMessagePlayed = (message) => {
        if (message.kind !== 'Normal' ||
            !Message.canChangeMessagePlayedStatus(message)) {
            return;
        }
        dispatch({
            type: 'UserPlayedMessage',
            cmid: message.cmid,
            peerId: message.peerId,
        });
    };
    const highlighterStyles = HIGHLIGHTER_STYLES_ACCENT;
    const hasReactions = !!featureFlags.vkm_reactions &&
        message.kind === 'Normal' &&
        Message.isReactionsAvailable(message) &&
        message.reactions.size > 0 &&
        !!messageReactions;
    const isBigStickerEnabled = !isCompact && !storyCommentSticker;
    const stickerSize = isBigStickerEnabled ? 168 : 128;
    const isEdited = message.kind !== 'Foreign' && Message.isMessageEdited(message);
    const getEditedLabel = () => (React.createElement(ConvoMessageEditedTimeTooltip, { message: message },
        React.createElement("span", { className: "ConvoMessageWithoutBubble__editedLabel" },
            ' ',
            "(",
            lang.use('me_message_edited_label_short'),
            ")")));
    const handleReplyClick = () => {
        if (!rootMsg || message.replyMessage?.kind !== 'Foreign') {
            return;
        }
        if (featureFlags.vkm_new_forward && onOpenForwardedMessageInModal) {
            onOpenForwardedMessageInModal({
                message: message,
                rootMessage: rootMsg,
            });
        }
        else {
            onOpenMessageInModal?.({
                message: message.replyMessage,
                rootMessage: rootMsg,
            });
        }
    };
    if (!rootMsg) {
        if (isDev) {
            throw Error('[ConvoMessageWithoutBubble] Не передан rootMessage');
        }
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { id: elementId, className: cx('ConvoMessageWithoutBubble', {
                'ConvoMessageWithoutBubble--withReply': message.replyMessage,
                'ConvoMessageWithoutBubble--withStoryComment': storyComment,
                'ConvoMessageWithoutBubble--withClipOnly': isClipOnly,
                'ConvoMessageWithoutBubble--withClipReactionsTrigger': withClipFastReactions,
                'ConvoMessageWithoutBubble--withReactions': hasReactions,
            }) },
            isHead && (React.createElement(Link, { to: {
                    kind: 'PeerPanel',
                    peerId: author.id,
                    screenName: Peer.screenName(author),
                }, className: "ConvoMessageWithoutBubble__avatar", "aria-hidden": true, tabIndex: -1 },
                React.createElement(Avatar, { peer: author, size: 36 }))),
            React.createElement("div", { className: "ConvoMessageWithoutBubble__wrapper" },
                React.createElement("div", { className: "ConvoMessageWithoutBubble__content" },
                    withAuthorName && (React.createElement(ConvoMessageHeader, { author: author, sentFromPeerId: showSentFrom ? peerId : undefined, scrollToMsg: showSentFrom ? scrollToMsg : undefined, isRestrictedToWrite: isAuthorRestrictedToWrite })),
                    message.replyMessage && (React.createElement("div", { className: "ConvoMessageWithoutBubble__reply" },
                        React.createElement(RepliedMessage, { rootMessage: rootMsg, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: handleReplyClick, message: message.replyMessage, highlightFuzzySearch: highlightSearchQuery, forceUseModal: isUsedInModal, ...highlighterStyles }))),
                    attaches.story && (React.createElement(AttachStory, { story: attaches.story, isOut: isOut, isCompact: isCompact })),
                    attaches.gift && (React.createElement("div", { className: cx('ConvoMessageWithoutBubble__gift', {
                            'ConvoMessageWithoutBubble__gift--limited': featureFlags.vas_limited_gifts && !!attaches.gift.rarity,
                        }) },
                        React.createElement(AttachGift, { message: message, gift: attaches.gift }, hasText && (React.createElement(MessageText, { chunks: message.chunks, kind: message.kind, peerId: message.peerId, allowMentionHighlighting: true, highlightFuzzySearch: highlightSearchQuery, formatData: message.formatData, ...highlighterStyles }))))),
                    hasMediaAttaches && !isPublicVideo && (React.createElement("div", { className: "ConvoMessageWithoutBubble__mediaAttachments" },
                        React.createElement(MediaAttachments, { autoplay: !isMainPanelChanging, message: message, peerId: peerId, isInBubble: false, isCompact: isCompact, isClipOnly: isClipOnly, forceAutoPlay: Message.getForceAutoPlay(message), getMediaAttachLinkPayload: getMediaAttachLinkPayload, withAuthorName: withAuthorName, openClipCoOwnersModal: openClipCoOwnersModal, isForwarded: isForwarded, onPlayed: handleMessagePlayed }))),
                    hasText && !attaches.gift && (React.createElement("span", { className: "ConvoMessageWithoutBubble__text" },
                        React.createElement(MessageText, { chunks: message.chunks, kind: message.kind, peerId: message.peerId, allowMentionHighlighting: true, highlightFuzzySearch: highlightSearchQuery, formatData: message.formatData, ...highlighterStyles }),
                        isEdited && getEditedLabel())),
                    withSticker && (React.createElement("span", { className: "ConvoMessageWithoutBubble__sticker" },
                        attaches.sticker && (React.createElement(AttachSticker, { size: stickerSize, sticker: attaches.sticker, openStickerPackOnClick: !isUsedInModal, message: message })),
                        attaches.ugcSticker && (React.createElement(AttachUGCSticker, { ugcSticker: attaches.ugcSticker, size: stickerSize, openStickerPackOnClick: !isUsedInModal, iconPosition: "rightAbsolute" })))),
                    attaches.videoMessage &&
                        // Сейчас видеосообщение может быть только входящим, мы не отправляем
                        message.kind !== 'Queued' &&
                        (Peer.isUserPeerId(message.authorId) ||
                            Peer.isGroupPeerId(message.authorId)) && (React.createElement("div", { className: "ConvoMessageWithoutBubble__videoMessage" },
                        React.createElement(AttachVideoMessage, { message: message, isFavorites: isFavorites, isOut: isOut, isUnread: isUnread, isWithoutBubblesTheme: true, videoMessage: attaches.videoMessage, convoPeerId: peerId, messageAuthorId: message.authorId, messageSentAt: message.sentAt, rootMessageId: Message.resolveCmid(id), onPlayed: handleMessagePlayed }))),
                    hasAttaches && (React.createElement("div", { className: "ConvoMessageWithoutBubble__attachments" },
                        React.createElement(Attachments, { autoplay: !isMainPanelChanging, message: message, entrypoint: entrypoint, peerId: peerId, isFavorites: isFavorites, isInBubble: true, isCompact: isCompact, isClipOnly: isClipOnly, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onPlayed: handleMessagePlayed, isInModal: isUsedInModal }))),
                    isPublicVideo && (React.createElement("div", { className: "ConvoMessageWithoutBubble__publicVideo" },
                        React.createElement(MediaAttachments, { message: message, autoplay: !isMainPanelChanging, peerId: peerId, isInBubble: false, isUnread: isUnread, isClipOnly: isClipOnly, forceAutoPlay: Message.getForceAutoPlay(message), getMediaAttachLinkPayload: getMediaAttachLinkPayload, withAuthorName: withAuthorName, showDateOutInsidePublicVideo: false, onPlayed: handleMessagePlayed, openClipCoOwnersModal: openClipCoOwnersModal, isForwarded: isForwarded }))),
                    isEmpty && (React.createElement("span", { className: "ConvoMessageWithoutBubble__empty" }, lang.use('me_attach_deleted'))),
                    message.forwardedMessages && featureFlags.vkm_new_forward && (React.createElement("div", { className: cx('ConvoMessageWithoutBubble__forwardedMessages ConvoMessageWithoutBubble__forwardedMessages--new', {
                            'ConvoMessageWithoutBubble__forwardedMessages--withMargin': hasText ||
                                hasMediaAttaches ||
                                hasAttaches ||
                                withAuthorName,
                        }) },
                        React.createElement(ForwardedMessagesList, { message: message, rootMessage: rootMsg, isCompact: isCompact, onScrollToMessage: onScrollToMessage, openClipCoOwnersModal: openClipCoOwnersModal, onOpenMessageInModal: onOpenForwardedMessageInModal, onCloseMessageInModal: onCloseForwardedMessageInModal, highlightFuzzySearch: highlightSearchQuery, getMediaAttachLinkPayload: getMediaAttachLinkPayload, isUsedInModal: isUsedInModal, ...highlighterStyles }))),
                    message.forwardedMessages && !featureFlags.vkm_new_forward && (
                    // Используем в качестве ключа индекс, потому что у форварда может не быть ID
                    React.createElement("div", { className: "ConvoMessageWithoutBubble__forwardedMessages" }, message.forwardedMessages.map((forwarded, i) => (React.createElement(ForwardedMessage, { key: i, rootMessage: rootMsg, message: forwarded, isCompact: isCompact, onScrollToMessage: onScrollToMessage, openClipCoOwnersModal: openClipCoOwnersModal, totalForwardedMessageCount: message.forwardedMessages?.length, onOpenMessageInModal: onOpenMessageInModal, usedInModal: isUsedInModal ? 'as-message' : undefined, highlightFuzzySearch: highlightSearchQuery, getMediaAttachLinkPayload: getMediaAttachLinkPayload, ...highlighterStyles }))))),
                    !hasText && isEdited && getEditedLabel()),
                React.createElement(ConvoMessageInfoWithoutBubblesTheme, { className: withAuthorName
                        ? undefined
                        : 'ConvoMessageWithoutBubble__info--withoutAuthor', isUnread: isUnread, message: message, expiresAt: ttl ? message.sentAt + ttl : undefined, expiresButtonShowDuration: isInsideCasper ? Time.Minute : undefined, 
                    /**
                     * cmid в отложках пересекаются с cmid в обычной истории сообщений.
                     */
                    onClick: message.kind === 'Normal' && message.isPostponed
                        ? undefined
                        : scrollToMsg, showDate: showDate })),
            (hasReactions || (withPostFastReactions && reactions)) && (React.createElement("div", { className: "ConvoMessageWithoutBubble__reactions" },
                hasReactions && (React.createElement(ConvoMessageReactions, { message: message, messageReactions: messageReactions, onReactionClick: (reactionId) => onReactionClick?.(reactionId, 'nearby_click'), unreadReactionId: unreadReactionId, canOpenReactedPeers: canOpenReactedPeers, disableAnimations: disableReactionAnimations, reactionChipTheme: message.isOut ? 'outgoing' : 'incoming' })),
                withPostFastReactions &&
                    reactions &&
                    message.kind === 'Normal' && (React.createElement(ConvoMessageFastReactionsMenu, { className: "ConvoMessageWithoutBubble__postFastReactions", triggerClassName: "ConvoMessageWithoutBubble__postFastReactionsTrigger", isDisabled: !!selectionExists, isCompact: isCompact, isPreopened: !!withPostFastReactionsSuggest, reactions: reactions, activeReactionId: message.reactionId, cmid: message.cmid, peerId: peerId, offsetTop: 20, offsetLeft: 8, onReactionClick: onReactionClick, onClose: disablePostFastReactionsSuggest })))),
            actions,
            withClipFastReactions && reactions && message.kind === 'Normal' && (React.createElement(ConvoMessageFastReactionsMenu, { className: "ConvoMessageWithoutBubble__clipFastReactions", triggerClassName: "ConvoMessageWithoutBubble__clipFastReactionsTrigger", isDisabled: !!selectionExists, isCompact: isCompact, isPreopened: !!withClipFastReactionsSuggest, reactions: reactions, activeReactionId: message.reactionId, cmid: message.cmid, peerId: peerId, offsetTop: 10, offsetLeft: 8, onReactionClick: onReactionClick, onClose: disableClipFastReactionsSuggest })),
            message.kind === 'Normal' &&
                message.keyboard &&
                onCallbackButtonClick && (React.createElement("div", { className: "ConvoMessageWithoutBubble__botKeyboard" },
                React.createElement(BotKeyboard
                // Ключ сбрасывает загрузку у callback-кнопок при смене клавы: ME-58527
                , { 
                    // Ключ сбрасывает загрузку у callback-кнопок при смене клавы: ME-58527
                    key: message.updatedAt, inline: true, cmid: message.cmid, keyboard: message.keyboard, onButtonClick: onKeyboardSend, onCallbackButtonClick: onCallbackButtonClick, isCompact: isCompact })))),
        message.kind === 'Normal' &&
            message.template &&
            message.template.kind === 'Carousel' &&
            onCallbackButtonClick && (React.createElement(BotTemplateList, { authorId: message.authorId, cmid: message.cmid, elements: message.template.elements, onClick: onKeyboardSend, onCallbackButtonClick: onCallbackButtonClick, isCompact: isCompact }))));
};
//# sourceMappingURL=ConvoMessageWithoutBubble.js.map