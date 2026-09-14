import React, { useCallback } from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Message from '../../../core/model/Message';
import * as Attach from '../../../core/model/Attach';
import './ForwardedMessageNew.css';
import { useBrowserEnv, usePeers, useFeatureFlags } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Attachments, MediaAttachments, } from '../../ui/Attachments/Attachments';
import { AttachGift } from '../../ui/AttachGift/AttachGift';
import { MessageText } from '../../ui/MessageText/MessageText';
import { AttachUGCSticker } from '../../ui/AttachUGCSticker/AttachUGCSticker';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { AttachVideoMessage } from '../../ui/AttachVideoMessage/AttachVideoMessage';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { useFormattedDate } from '../../hooks/useFormattedDate';
import { NestedForwardedMessageButton } from '../../ui/NestedForwardedMessageButton/NestedForwardedMessageButton';
import { RepliedMessage } from '../../ui/RepliedMessage/RepliedMessage';
import { classNames as cx } from '@vkontakte/vkjs';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Icon20MessageArrowRightOutline } from '@vkontakte/icons';
import { useNow } from '../../hooks/useNow';
import { isSameYear } from '../../../core/utils/misc';
import { Time } from '../../ui/Time/Time';
export const ForwardedMessageNew = ({ rootMessage, message, isCompact = false, onScrollToMessage, onOpenMessageInModal, onCloseMessageInModal, highlightFuzzySearch, highlightColor, highlightColorOpacity, handleChangeAttachWidth, getMediaAttachLinkPayload, isThemed, isContrastTheme, isUsedInModal, openClipCoOwnersModal, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const now = useNow();
    const featureFlags = useFeatureFlags();
    const author = Peer.safeGet(peers, message.authorId);
    const attaches = message.attaches;
    const hasAttaches = Attach.hasAttaches(message.attaches) || attaches.story;
    const hasMediaAttaches = Attach.hasMediaAttaches(message.attaches);
    const hasText = Message.hasText(message);
    const isEmpty = !hasText &&
        !Object.keys(attaches).find((key) => key !== 'unknown') &&
        !message.forwardedMessages;
    /**
     * Для публичных видео
     */
    const isPublicVideo = Attach.hasPublicVideo(attaches);
    const authorTo = {
        kind: 'PeerPanel',
        peerId: author.id,
        screenName: Peer.screenName(author),
    };
    const [formattedDate, ariaVersionFormattedDate] = useFormattedDate(message.sentAt);
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const stickerSize = isCompact ? 128 : 168;
    const onWidthChange = useCallback((width, ignorePrev) => {
        handleChangeAttachWidth?.(width + 48, ignorePrev);
    }, [handleChangeAttachWidth]);
    const handleMoreClick = useCallback((forwardedMessage) => {
        onOpenMessageInModal?.({ message: forwardedMessage, rootMessage });
    }, [onOpenMessageInModal, rootMessage]);
    const handleReplyClick = useCallback(() => {
        onOpenMessageInModal?.({ message, rootMessage });
    }, [message, onOpenMessageInModal, rootMessage]);
    const preventFocus = useCallback((e) => e.preventDefault(), []);
    const handleScrollToMessage = useCallback((e) => {
        e.stopPropagation();
        if (onScrollToMessage !== undefined && message.peerId !== undefined) {
            onScrollToMessage({
                cmid: message.cmid,
                peerId: message.peerId,
                rootCmid: 'rootCmid' in message ? message.rootCmid : undefined,
                entrypoint: 'go_to_source_message',
            });
        }
    }, [onScrollToMessage, message]);
    const hasContrastThemeGiftClassname = rootMessage.isOut &&
        isContrastTheme &&
        !isUsedInModal &&
        !isWithoutBubblesTheme;
    return (React.createElement("article", { className: cx('ForwardedMessageNew', {
            'ForwardedMessageNew--withTopPadding': Boolean(attaches.videoMessage || attaches.gift),
            'ForwardedMessageNew--themed': isThemed,
        }) },
        React.createElement("div", { className: "ForwardedMessageNew__avatar" },
            React.createElement(Link, { to: authorTo, tabIndex: -1, "aria-hidden": true },
                React.createElement(Avatar, { size: 24, peer: author }))),
        React.createElement("div", { className: "ForwardedMessageNew__main" },
            React.createElement("header", { className: cx('ForwardedMessageNew__header', featureFlags.vkm_new_bubbles_width_calc &&
                    'ForwardedMessageNew__headerRefactored') },
                React.createElement(Link, { className: "ForwardedMessageNew__userName", to: authorTo }, Peer.name(author)),
                React.createElement("span", { className: "ForwardedMessageNew__info" },
                    formattedDate && ariaVersionFormattedDate && (React.createElement(Tooltip, { position: "top", align: "center", content: lang.use(isSameYear(now, message.sentAt)
                            ? 'global_short_date_time'
                            : 'global_date_year_time', {
                            now,
                            date: message.sentAt,
                        }) },
                        React.createElement(Time, { ariaVersionFormattedDate: ariaVersionFormattedDate, formattedDate: formattedDate }))),
                    message.updatedAt &&
                        ` · ${lang.use('me_message_edited_label_short')}`),
                !message.isUnavailable && !isCompact && (React.createElement("div", { className: cx('ForwardedMessageNew__goToMessage', {
                        'ForwardedMessageNew__goToMessage--withoutBubbles': isWithoutBubblesTheme,
                    }) },
                    React.createElement(Tooltip, { content: lang.use('me_go_to_forwarded_message'), delay: 500, position: "top", align: "right", arrowOffset: { x: -3 }, tooltipOffset: { y: 4, x: 7 }, vkuiStyle: true },
                        React.createElement("button", { className: "ForwardedMessageNew__goToMessageBtn", onClick: handleScrollToMessage, onMouseDown: preventFocus, "aria-label": lang.use('me_go_to_forwarded_message') },
                            React.createElement(Icon20MessageArrowRightOutline, null)))))),
            React.createElement("div", { className: "ForwardedMessageNew__content" },
                attaches.gift && (React.createElement("div", { className: cx('ForwardedMessageNew__gift', {
                        'ForwardedMessageNew__gift--limited': featureFlags.vas_limited_gifts && !!attaches.gift.rarity,
                        'ForwardedMessageNew__gift--withoutBubble': isWithoutBubblesTheme,
                        'ForwardedMessageNew__gift--out': rootMessage.isOut,
                    }) },
                    React.createElement(AttachGift, { message: message, gift: attaches.gift, isContrastTheme: hasContrastThemeGiftClassname }, hasText && (React.createElement(MessageText, { chunks: message.chunks, peerId: rootMessage.peerId, className: "ForwardedMessageNew__text", formatData: message.formatData, allowMentionHighlighting: true, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, underlineLink: isThemed && rootMessage.isOut }))))),
                message.replyMessage &&
                    message.replyMessage.kind !== 'ForeignExpired' && (React.createElement(RepliedMessage, { rootMessage: rootMessage, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: handleReplyClick, forceUseModal: true, message: message.replyMessage, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity })),
                hasMediaAttaches && !isPublicVideo && (React.createElement("div", { className: "ForwardedMessageNew__mediaAttachments" },
                    React.createElement(MediaAttachments, { forwardLevel: 1, message: message, peerId: rootMessage.peerId, isInBubble: true, isThemed: isThemed, isForwarded: true, rootIsOut: rootMessage.isOut, isCompact: isCompact, forceAutoPlay: Message.getForceAutoPlay(message), getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: onWidthChange, openClipCoOwnersModal: openClipCoOwnersModal }))),
                !attaches.gift && (React.createElement(MessageText, { chunks: message.chunks, peerId: rootMessage.peerId, className: "ForwardedMessageNew__text", formatData: message.formatData, allowMentionHighlighting: true, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, underlineLink: isThemed && rootMessage.isOut })),
                hasMediaAttaches && isPublicVideo && (React.createElement("div", { className: "ForwardedMessageNew__mediaAttachments" },
                    React.createElement(MediaAttachments, { message: message, peerId: rootMessage.peerId, isInBubble: true, isThemed: isThemed, isForwarded: true, rootIsOut: rootMessage.isOut, forceAutoPlay: Message.getForceAutoPlay(message), getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: onWidthChange, forwardLevel: 1, openClipCoOwnersModal: openClipCoOwnersModal }))),
                attaches.ugcSticker && (React.createElement(AttachUGCSticker, { size: stickerSize, ugcSticker: attaches.ugcSticker, forwarded: message.peerId === message.rootPeerId ? 'same_peer' : true, iconPosition: "rightRelative" })),
                attaches.sticker && (React.createElement(AttachSticker, { size: stickerSize, sticker: attaches.sticker, iconPosition: "rightRelative", forceBorder: isThemed, message: message, openStickerPackOnClick: !isUsedInModal })),
                attaches.videoMessage &&
                    // Сейчас отправлять видеосообщения могут только юзеры
                    Peer.isUserPeerId(message.authorId) &&
                    'rootCmid' in message && (React.createElement(AttachVideoMessage, { message: message, isFavorites: false, isOut: false, isWithoutBubblesTheme: isWithoutBubblesTheme, isInBubble: !isWithoutBubblesTheme, convoPeerId: rootMessage.peerId, videoMessage: attaches.videoMessage, rootMessageId: message.rootCmid, messageAuthorId: message.authorId, messageSentAt: message.sentAt, 
                    // В форвардах нельзя проиграть аттачи
                    onPlayed: () => { } })),
                hasAttaches && (React.createElement("div", { className: "ForwardedMessageNew__attachments" },
                    React.createElement(Attachments, { forwardLevel: 1, message: message, peerId: rootMessage.peerId, isInBubble: true, isThemed: isThemed, isCompact: isCompact, isForwarded: true, rootIsOut: rootMessage.isOut, onWidthChange: onWidthChange, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onCloseMessageInModal: onCloseMessageInModal, 
                        // В форвардах нельзя проиграть аттачи
                        onPlayed: () => { }, isInModal: isUsedInModal, withStory: true }))),
                message.forwardedMessages && (React.createElement("div", { className: "ForwardedMessageNew__forward" },
                    React.createElement(NestedForwardedMessageButton, { message: message, onMoreClick: handleMoreClick }))),
                isEmpty && (React.createElement("span", { className: "ForwardedMessage__empty" }, lang.use('me_empty_message')))))));
};
//# sourceMappingURL=ForwardedMessageNew.js.map