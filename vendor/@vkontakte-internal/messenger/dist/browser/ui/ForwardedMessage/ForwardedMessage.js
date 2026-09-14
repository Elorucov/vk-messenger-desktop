import '../../ui/ForwardedMessage/ForwardedMessage.css';
import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import { Button, Spinner } from '@vkontakte/vkui';
import { Icon20MessageArrowRightOutline } from '@vkontakte/icons';
import { MAX_MESSAGES_FORWARD_LEVEL } from '../../../core/config/config';
import * as Peer from '../../../core/model/Peer';
import * as Message from '../../../core/model/Message';
import * as Attach from '../../../core/model/Attach';
import { useBrowserEnv, useFeatureFlags, usePeers } from '../../hooks/misc';
import { Avatar } from '../../ui/Avatar/Avatar';
import { MessageText } from '../../ui/MessageText/MessageText';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { AttachVideoMessage } from '../../ui/AttachVideoMessage/AttachVideoMessage';
import { Attachments, MediaAttachments, } from '../../ui/Attachments/Attachments';
import { Link } from '../../ui/Link/Link';
import { AttachGift } from '../../ui/AttachGift/AttachGift';
import { isSameYear } from '../../../core/utils/misc';
import { AttachUGCSticker } from '../../ui/AttachUGCSticker/AttachUGCSticker';
import { ConvoMessageIconButton } from '../../ui/ConvoMessageIconButton/ConvoMessageIconButton';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { useNow } from '../../hooks/useNow';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Time } from '../../ui/Time/Time';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
/**
 * Пересланное сообщение.
 * Умеет рендерить вложенные пересланные сообщения.
 * Используется в том числе для реплаев внутри пересланного сообщения.
 */
export const ForwardedMessage = ({ rootMessage, message, level = 1, isCompact = false, totalForwardedMessageCount, onScrollToMessage, usedInModal, onOpenMessageInModal, onCloseMessageInModal, openClipCoOwnersModal, highlightFuzzySearch, highlightColor, highlightColorOpacity, handleChangeAttachWidth, getMediaAttachLinkPayload, isThemed, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const { vkm_new_remove_empty_forwards } = useFeatureFlags();
    const { isChanging: isMainPanelChanging } = useCollapsibleContainer();
    /**
     * Если передан проп usedInModal, значит сообщение отображается
     * в модалке в бабле.
     */
    const isWithoutBubblesTheme = useWithoutBubblesTheme() && !usedInModal;
    const author = Peer.safeGet(peers, message.authorId);
    const attaches = message.attaches;
    const hasAttaches = Attach.hasAttaches(message.attaches) || attaches.story;
    const hasMediaAttaches = Attach.hasMediaAttaches(message.attaches);
    /**
     * Для публичных видео
     */
    const isPublicVideo = Attach.hasPublicVideo(attaches);
    const hasText = Message.hasText(message);
    const isEmpty = !hasText &&
        !Object.keys(attaches).find((key) => key !== 'unknown') &&
        !message.forwardedMessages;
    const openMessageInModal = useCallback((e) => {
        e.stopPropagation();
        onOpenMessageInModal?.({ message: rootMessage, rootMessage });
    }, [onOpenMessageInModal, rootMessage]);
    const [isScrolling, setScrolling] = useState(false);
    const handleScrollToMessage = useCallback(async (e) => {
        e.stopPropagation();
        if (isScrolling) {
            return;
        }
        if (onScrollToMessage !== undefined && message.peerId !== undefined) {
            setScrolling(true);
            await onScrollToMessage({
                cmid: message.cmid,
                peerId: message.peerId,
                rootCmid: 'rootCmid' in message ? message.rootCmid : undefined,
                entrypoint: 'go_to_source_message',
            });
            setScrolling(false);
        }
    }, [isScrolling, onScrollToMessage, message]);
    const preventFocus = useCallback((e) => e.preventDefault(), []);
    const stickerSize = isCompact ? 128 : 168;
    // схлопываем "пустые" пересланные (нет текста, нет аттачей, есть пересланные)
    if (
    // После раскатки vkm_new_remove_empty_forwards, этот блок кода удалится, пустые форварды будут вырезаться бэкендом
    !vkm_new_remove_empty_forwards &&
        !message.chunks.length &&
        !Object.entries(attaches).length &&
        message.forwardedMessages?.length) {
        return (React.createElement(React.Fragment, null, message.forwardedMessages.map((forwarded, i) => (React.createElement(ForwardedMessage, { rootMessage: rootMessage, message: forwarded, key: i, level: level, totalForwardedMessageCount: totalForwardedMessageCount, onOpenMessageInModal: onOpenMessageInModal, onCloseMessageInModal: onCloseMessageInModal, openClipCoOwnersModal: openClipCoOwnersModal, isCompact: isCompact, usedInModal: usedInModal, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, getMediaAttachLinkPayload: getMediaAttachLinkPayload, handleChangeAttachWidth: handleChangeAttachWidth })))));
    }
    return (React.createElement("div", { className: cx('ForwardedMessage', {
            'ForwardedMessage--withGift': attaches.gift,
            'ForwardedMessage--withoutBubble': isWithoutBubblesTheme,
            'ForwardedMessage--withText': hasText,
        }) },
        React.createElement("header", { className: "ForwardedMessage__header" },
            React.createElement(Link, { className: "ForwardedMessage__avatarLink", to: {
                    kind: 'PeerPanel',
                    peerId: author.id,
                    screenName: Peer.screenName(author),
                }, "aria-hidden": true, tabIndex: -1 },
                React.createElement(Avatar, { peer: author, size: 32 })),
            React.createElement("div", { className: "ForwardedMessage__userInfo" },
                (author.kind === 'User' || author.kind === 'Group') && (React.createElement(Link, { to: {
                        kind: 'PeerPanel',
                        peerId: author.id,
                        screenName: Peer.screenName(author),
                    }, className: "ForwardedMessage__link" }, Peer.name(author))),
                React.createElement(ForwardedMessageSentDate, { sentAt: message.sentAt })),
            !message.isUnavailable && !usedInModal && !isCompact && (React.createElement("div", { className: isWithoutBubblesTheme
                    ? 'ForwardedMessage__goToMessageBtn--withoutBubbles'
                    : 'ForwardedMessage__goToMessageBtn' }, isScrolling ? (React.createElement(ConvoMessageIconButton, { onMouseDown: preventFocus, icon: React.createElement("div", { className: "ForwardedMessage__goToMessageBtnSpinner" },
                    React.createElement(Spinner, { size: "s" })), "aria-label": lang.use('me_go_to_forwarded_message') })) : (React.createElement(Tooltip, { content: lang.use('me_go_to_forwarded_message'), delay: 500, position: "top", align: "right", arrowOffset: { x: -3 }, tooltipOffset: { y: 4 }, vkuiStyle: true },
                React.createElement("span", null,
                    React.createElement(ConvoMessageIconButton, { onClick: handleScrollToMessage, onMouseDown: preventFocus, icon: React.createElement(Icon20MessageArrowRightOutline, null), "aria-label": lang.use('me_go_to_forwarded_message') }))))))),
        attaches.gift && (React.createElement("div", { className: cx('ForwardedMessage__gift') },
            React.createElement(AttachGift, { message: message, gift: attaches.gift }, hasText && (React.createElement(MessageText, { chunks: message.chunks, peerId: rootMessage.peerId, className: "ForwardedMessage__text", allowMentionHighlighting: true, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, underlineLink: isThemed && rootMessage.isOut }))))),
        hasMediaAttaches && !isPublicVideo && (React.createElement("div", { className: "ForwardedMessage__mediaAttachments" },
            React.createElement(MediaAttachments, { autoplay: !isMainPanelChanging, message: message, peerId: rootMessage.peerId, isInBubble: true, isForwarded: true, rootIsOut: rootMessage.isOut, isCompact: isCompact, forceAutoPlay: Message.getForceAutoPlay(message), forwardLevel: level, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: handleChangeAttachWidth, openClipCoOwnersModal: openClipCoOwnersModal }))),
        !attaches.gift && (React.createElement(MessageText, { chunks: message.chunks, peerId: rootMessage.peerId, className: "ForwardedMessage__text", allowMentionHighlighting: true, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, underlineLink: isThemed && rootMessage.isOut })),
        hasMediaAttaches && isPublicVideo && (React.createElement("div", { className: "ForwardedMessage__mediaAttachments" },
            React.createElement(MediaAttachments, { autoplay: !isMainPanelChanging, message: message, peerId: rootMessage.peerId, isInBubble: true, isForwarded: true, rootIsOut: rootMessage.isOut, forceAutoPlay: Message.getForceAutoPlay(message), forwardLevel: level, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: handleChangeAttachWidth, openClipCoOwnersModal: openClipCoOwnersModal }))),
        attaches.ugcSticker && (React.createElement(AttachUGCSticker, { size: stickerSize, ugcSticker: attaches.ugcSticker, forwarded: message.peerId === message.rootPeerId ? 'same_peer' : true, openStickerPackOnClick: !usedInModal, iconPosition: "rightRelative" })),
        attaches.sticker && (React.createElement(AttachSticker, { size: stickerSize, sticker: attaches.sticker, openStickerPackOnClick: !usedInModal, iconPosition: "rightRelative", forceBorder: isThemed, message: message })),
        attaches.videoMessage &&
            // Сейчас отправлять видеосообщения могут только юзеры
            Peer.isUserPeerId(message.authorId) &&
            'rootCmid' in message && (React.createElement(AttachVideoMessage, { message: message, isFavorites: false, isOut: rootMessage.isOut, isWithoutBubblesTheme: isWithoutBubblesTheme, isInBubble: !isWithoutBubblesTheme, forwardLevel: level, convoPeerId: rootMessage.peerId, videoMessage: attaches.videoMessage, rootMessageId: message.rootCmid, messageAuthorId: message.authorId, messageSentAt: message.sentAt, 
            // В форвардах нельзя проиграть аттачи
            onPlayed: () => { } })),
        hasAttaches && (React.createElement("div", { className: "ForwardedMessage__attachments" },
            React.createElement(Attachments, { autoplay: !isMainPanelChanging, message: message, peerId: rootMessage.peerId, isInBubble: true, forwardLevel: level, isCompact: isCompact, isForwarded: true, rootIsOut: rootMessage.isOut, onWidthChange: handleChangeAttachWidth, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onCloseMessageInModal: onCloseMessageInModal, totalForwardedMessageCount: totalForwardedMessageCount, 
                // В форвардах нельзя проиграть аттачи
                onPlayed: () => { }, withStory: true }))),
        message.forwardedMessages &&
            message.forwardedMessages.length > 0 &&
            (level + 1 < MAX_MESSAGES_FORWARD_LEVEL ||
                usedInModal === 'as-message' ? (
            // Используем в качестве ключа индекс, потому что у форварда может не быть ID
            message.forwardedMessages.map((forwarded, i) => (React.createElement(ForwardedMessage, { rootMessage: rootMessage, message: forwarded, key: i, level: level + 1, totalForwardedMessageCount: totalForwardedMessageCount, usedInModal: usedInModal, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, getMediaAttachLinkPayload: getMediaAttachLinkPayload, handleChangeAttachWidth: handleChangeAttachWidth, onCloseMessageInModal: onCloseMessageInModal, openClipCoOwnersModal: openClipCoOwnersModal })))) : (React.createElement("div", null,
                React.createElement(Button, { mode: "link", appearance: "accent-invariable", onClick: openMessageInModal }, lang.use('me_forwarded_messages', {
                    num: message.forwardedMessages.length,
                }))))),
        message.replyMessage &&
            message.replyMessage.kind !== 'ForeignExpired' &&
            (level + 1 < MAX_MESSAGES_FORWARD_LEVEL ||
                usedInModal === 'as-message' ? (React.createElement(ForwardedMessage, { rootMessage: rootMessage, message: message.replyMessage, level: level + 1, usedInModal: usedInModal, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, getMediaAttachLinkPayload: getMediaAttachLinkPayload, handleChangeAttachWidth: handleChangeAttachWidth, onCloseMessageInModal: onCloseMessageInModal, openClipCoOwnersModal: openClipCoOwnersModal })) : (React.createElement("div", null,
                React.createElement(Button, { mode: "link", appearance: "accent-invariable", onClick: openMessageInModal }, lang.use('me_with_reply'))))),
        isEmpty && (React.createElement("span", { className: "ForwardedMessage__empty" }, lang.use('me_empty_message')))));
};
const ForwardedMessageSentDate = ({ sentAt, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const formattedDate = lang.use(isSameYear(now, sentAt)
        ? 'global_short_date_time'
        : 'global_date_year_time', {
        now,
        date: sentAt,
    });
    return (React.createElement(Time, { ariaVersionFormattedDate: formattedDate, formattedDate: formattedDate, className: "ForwardedMessage__date" }));
};
//# sourceMappingURL=ForwardedMessage.js.map