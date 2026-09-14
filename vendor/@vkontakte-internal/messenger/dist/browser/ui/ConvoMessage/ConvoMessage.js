import '../../ui/ConvoMessage/ConvoMessage.css';
import React, { useLayoutEffect, useRef, useState, } from 'react';
import cx from 'classnames';
import { Icon16Bomb } from '@vkontakte/icons';
import { useBrowserEnv, useOwner, useFeatureFlags, useDispatch, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Message from '../../../core/model/Message';
import { RepliedMessage } from '../../ui/RepliedMessage/RepliedMessage';
import { Attachments, MediaAttachments, } from '../../ui/Attachments/Attachments';
import { MessageText } from '../../ui/MessageText/MessageText';
import { ForwardedMessage } from '../../ui/ForwardedMessage/ForwardedMessage';
import { AttachGift } from '../../ui/AttachGift/AttachGift';
import * as Attach from '../../../core/model/Attach';
import { BotKeyboard } from '../../ui/BotKeyboard/BotKeyboard';
import { ConvoMessageHeader } from '../../ui/ConvoMessageHeader/ConvoMessageHeader';
import { ConvoMessageBottomInfo } from '../../ui/ConvoMessageBottomInfo/ConvoMessageBottomInfo';
import { BotTemplateList } from '../../ui/BotTemplateControls/BotTemplateList';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { AttachVideoMessage } from '../../ui/AttachVideoMessage/AttachVideoMessage';
import { AttachStory } from '../../ui/AttachStory/AttachStory';
import { HIGHLIGHTER_STYLES_TERTIARY, HIGHLIGHTER_STYLES_ACCENT, } from '../../ui/Highlighter/Highlighter';
import { formatDuration, isDev } from '../../../core/utils/misc';
import { AttachUGCSticker } from '../../ui/AttachUGCSticker/AttachUGCSticker';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { isMessageWithStickerWithIcon } from '../../utils/stickers';
import { useNow } from '../../hooks/useNow';
import { ConvoMessageReactions } from '../../ui/ConvoMessage/ConvoMessageReactions';
import { useConvoMessageDatePosition } from '../../ui/ConvoMessage/useConvoMessageDatePosition';
import { Time } from '../../../core/utils/time';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { ForwardedMessagesList } from '../../ui/ForwardedMessagesList/ForwardedMessagesList';
import { useMessageExpectedAttachesWidth } from '../../hooks/useExpectedAttachesWidth';
import { ConvoMessageFastReactionsMenu } from '../../ui/ConvoMessageFastReactionsMenu/ConvoMessageFastReactionsMenu';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
const MIN_MESSAGE_WIDTH = 220;
/**
 * Хоть сообщения и пиры меняются редко, не оптимизируем через React.memo,
 * поскольку основной сценарий использования этого компонента внутри
 * оптимизированного компонента ConvoHistoryMessageBlock, каждый перерендер
 * которого ведет в перерендеру этого компонента.
 */
export const ConvoMessage = function ConvoMessage({ peerId, author, message, rootMessage, isUnread, unreadReactionId, isHead, isSelected, isAuthorRestrictedToWrite, isCompact = false, showSentFrom, messageReactions, onKeyboardSend, onCallbackButtonClick, isInsideCasper, selectionExists, actions, entrypoint, disableReactionAnimations = false, onScrollToMessage, onOpenMessageInModal, onCloseMessageInModal, onOpenForwardedMessageInModal, onCloseForwardedMessageInModal, isForwarded = false, onReactionClick, canOpenReactedPeers, getMediaAttachLinkPayload, highlightSearchQuery, isUsedInModal = false, onSizeChange, isThemed, isContrastTheme, reactions, id: elementId, isClipOnly, withClipFastReactions, withClipFastReactionsSuggest, withPostFastReactions, withPostFastReactionsSuggest, withLinkToPreviousMessage, disableClipFastReactionsSuggest, disablePostFastReactionsSuggest, openClipCoOwnersModal, }) {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const { isMobileLayout } = useLayoutData();
    const featureFlags = useFeatureFlags();
    const dispatch = useDispatch();
    const { isChanging: isMainPanelChanging } = useCollapsibleContainer();
    const scrollToMsg = () => {
        if (message.kind === 'Normal' && message.isPostponed) {
            /**
             * cmid в отложках пересекаются с cmid в обычной истории сообщений.
             */
            return;
        }
        if (!message.cmid) {
            return;
        }
        const isUnavailable = 'isUnavailable' in message ? message.isUnavailable : false;
        onScrollToMessage({
            cmid: message.cmid,
            peerId,
            isUnavailable: isUnavailable,
        });
    };
    /**
     * Отступ от сообщения со стороны опций.
     * Нужен для исчезающих сообщений, чтобы опции не накладывались на бомбочку.
     */
    const [outerMargin, setOuterMargin] = useState(0);
    const id = message.kind === 'Queued' ? message.randomId : message.cmid;
    const hasText = Message.hasText(message);
    const isFavorites = Peer.isFavorites(peerId, owner.id);
    const attaches = message.attaches;
    const hasAttaches = Attach.hasAttaches(message.attaches);
    const hasMediaAttaches = Attach.hasMediaAttaches(message.attaches);
    const lastAttach = Attach.last(attaches);
    const withSticker = attaches.sticker || attaches.ugcSticker;
    const unavailableStory = attaches.story && !attaches.story.available;
    const storyCommentText = attaches.story && hasText;
    const storyCommentSticker = attaches.story && !!withSticker;
    const storyComment = storyCommentText || storyCommentSticker;
    const knownAttachesLength = Object.keys(attaches).filter((key) => key !== 'unknown').length;
    const isEmpty = !hasText && knownAttachesLength === 0 && !message.forwardedMessages;
    const isPublicVideo = !isMobileLayout && Attach.hasPublicVideo(attaches);
    const hasForwardedArticle = message.forwardedMessages?.some((message) => message.attaches.article);
    const hasReactions = !!featureFlags.vkm_reactions &&
        message.kind === 'Normal' &&
        Message.isReactionsAvailable(message) &&
        message.reactions.size > 0 &&
        !!messageReactions;
    const hasKeyboard = message.kind === 'Normal' && !!message.keyboard && !!onCallbackButtonClick;
    const isOut = message.kind !== 'Foreign' && message.isOut;
    const rootMsg = message.kind === 'Foreign' ? rootMessage : message;
    const { smallerDateTopMargin, floatDate, floatDateWithoutBackground, floatDateWithWhiteColor, floatDateWithSmallMargin, } = useConvoMessageDatePosition(message, isCompact, hasReactions, hasKeyboard);
    const hasOnlyOneAudioAttach = attaches.audios && attaches.audios.length === 1;
    const hasOnlyOneNewPlaylistAttach = attaches.audioPlaylists && attaches.audioPlaylists.length === 1;
    const hasOnlyOneNewArtistAttach = attaches.artist;
    const disableBottomInfoContrast = (!hasText &&
        (hasOnlyOneAudioAttach ||
            hasOnlyOneNewPlaylistAttach ||
            hasOnlyOneNewArtistAttach)) ||
        attaches.poll;
    const noBackground = !hasText &&
        !message.replyMessage &&
        !message.forwardedMessages &&
        (knownAttachesLength === 1 || storyCommentSticker) &&
        (withSticker ||
            attaches.poll ||
            attaches.videoMessage ||
            attaches.story ||
            (attaches.videos?.length === 1 &&
                attaches.videos[0].type === 'short_video') ||
            (attaches.widget && featureFlags.vkm_widget_attaches) ||
            hasOnlyOneAudioAttach ||
            hasOnlyOneNewPlaylistAttach ||
            hasOnlyOneNewArtistAttach);
    /**
     * Отображать имя автора в баббле сообщения
     */
    const withAuthorName = showSentFrom ||
        (Peer.isChatPeerId(peerId) &&
            // Не показываем автора для исходящих сообщений
            !isOut &&
            // Показываем автора только для первого сообщения в стеке
            isHead &&
            // Не показываем автора, если сообщение без фона
            !noBackground);
    const ttl = message.expireTTL || (isInsideCasper ? message.deleteTTL : undefined);
    const handleMessagePlayed = (message) => {
        if (message.kind !== 'Normal' ||
            !Message.canChangeMessagePlayedStatus(message)) {
            return;
        }
        dispatch({
            type: 'UserPlayedMessage',
            cmid: message.cmid,
            peerId,
        });
    };
    const highlighterStyles = isOut
        ? HIGHLIGHTER_STYLES_TERTIARY
        : HIGHLIGHTER_STYLES_ACCENT;
    const showDateOutInsidePublicVideo = Boolean(isPublicVideo && !hasReactions && !message.forwardedMessages);
    const [attachWidth, setAttachWidth] = useState(undefined);
    const [useCSSMinContentWidth, setUseCSSMinContentWidth] = useState(false);
    const showInfo = !(unavailableStory && !storyComment);
    const showDate = !isInsideCasper;
    const handleChangeAttachWidth = (width, ignorePrev) => {
        onSizeChange?.();
        if (featureFlags.vkm_new_bubbles_width_calc) {
            setUseCSSMinContentWidth(true);
        }
        else {
            setAttachWidth((prev) => calculateWidth(prev, width, ignorePrev));
        }
    };
    const handleChangeForwardAttachWidth = (width, ignorePrev) => 
    // Отступ слева от форварда - 10px
    handleChangeAttachWidth(width + 10, ignorePrev);
    const expectedAttachesWidth = useMessageExpectedAttachesWidth({
        message,
        rootMessageId: rootMsg?.cmid,
        isCompact,
    });
    const isBigStickerEnabled = !isCompact && !storyCommentSticker;
    const stickerSize = isBigStickerEnabled ? 168 : 128;
    const stickerIconPosition = message.replyMessage || message.forwardedMessages || !isOut
        ? 'rightRelative'
        : 'leftRelative';
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
    let calculatedAttachesWidth = featureFlags.vkm_new_forward
        ? expectedAttachesWidth
        : attachWidth;
    if (featureFlags.vkm_new_bubbles_width_calc) {
        calculatedAttachesWidth = undefined;
    }
    if (!rootMsg) {
        if (isDev) {
            throw Error('[ConvoMessage] Не передан rootMessage');
        }
        return null;
    }
    return (React.createElement(React.Fragment, null,
        storyComment && (React.createElement("div", { className: cx('ConvoMessage__storyWrapper', {
                'ConvoMessage__storyWrapper--out': isOut,
            }) },
            React.createElement("div", { className: "ConvoMessage__story" },
                React.createElement("div", { className: "ConvoMessage__storyInner" },
                    React.createElement(AttachStory, { story: attaches.story, isOut: isOut, isCompact: isCompact, isThemed: isThemed }))))),
        React.createElement("div", { id: elementId, className: cx('ConvoMessage', {
                'ConvoMessage--selected': isSelected,
                'ConvoMessage--expiring': message.kind === 'Normal' && message.expireTTL,
                'ConvoMessage--out MEAppThemeStylesContrastEnable': isOut,
                'ConvoMessage--in': !isOut,
                'ConvoMessage--noBackground': noBackground,
                'ConvoMessage--withReply': message.replyMessage,
                'ConvoMessage--withAttach': hasAttaches,
                'ConvoMessage--withMediaAttach': hasMediaAttaches,
                'ConvoMessage--withText': hasText,
                'ConvoMessage--mediaAttachAtBottom': hasMediaAttaches &&
                    !hasText &&
                    !hasAttaches &&
                    !message.forwardedMessages &&
                    !isPublicVideo &&
                    !hasReactions &&
                    !hasKeyboard,
                'ConvoMessage--withPublicVideo': isPublicVideo,
                'ConvoMessage--withSticker': withSticker,
                'ConvoMessage--withStickerWithIcon': isMessageWithStickerWithIcon(message),
                'ConvoMessage--withStoryComment': storyComment,
                'ConvoMessage--withButtons': attaches.gift,
                'ConvoMessage--withGiftBackground': attaches.gift,
                'ConvoMessage--withLimitedGift': featureFlags.vas_limited_gifts && !!attaches.gift?.rarity,
                'ConvoMessage--withArticle': attaches.article || hasForwardedArticle,
                'ConvoMessage--withAuthorName': withAuthorName,
                'ConvoMessage--withMiniApp': lastAttach &&
                    ['MiniApp', 'MiniAppWidget'].includes(lastAttach.kind) &&
                    Attach.count(attaches) === 1,
                'ConvoMessage--withReactions': hasReactions,
                'ConvoMessage--withWallOrWallReplyOnly': (attaches.wall ||
                    attaches.wallReply ||
                    attaches.channelMessage) &&
                    Attach.count(attaches) === 1,
                'ConvoMessage--tap': isMobileLayout,
                'ConvoMessage--withClipOnly': isClipOnly,
                'ConvoMessage--withClipReactionsTrigger': withClipFastReactions,
                'ConvoMessage--withPostReactionsTrigger': withPostFastReactions,
                'ConvoMessage--linkedWithPrevious': withLinkToPreviousMessage,
                'ConvoMessage--fitMediaAttachesWidth': useCSSMinContentWidth,
                /**
                 * В рамках задачи https://jira.mvk.com/browse/ME-78109 фон бабла сообщения отделился
                 * от класса ConvoMessage и стал существовать отдельно под классом ConvoMessage__background
                 *
                 * Но фича, как и отделение фона бабла, закрыта под ручку vkm_posts_fast_reactions,
                 * так что нужно оставить прежний вариант стилизации фона сообщения. Для этого вводится
                 * класс ConvoMessage--withNativeBackground
                 *
                 * @TODO удалить после полной раскатки vkm_posts_fast_reactions
                 */
                'ConvoMessage--withNativeBackground': !featureFlags.vkm_posts_fast_reactions,
            }), style: {
                '--outerMargin': `${outerMargin}px`,
                '--messageMaxWidth': calculatedAttachesWidth
                    ? `${calculatedAttachesWidth}px`
                    : undefined,
                '--stickerSize': `${stickerSize}px`,
            } },
            !noBackground && featureFlags.vkm_posts_fast_reactions && (React.createElement("div", { className: "ConvoMessage__background" })),
            ttl && (React.createElement(Bomb, { expiresAt: message.sentAt + ttl, showingDuration: isInsideCasper ? Time.Minute : undefined, onWidthChange: setOuterMargin })),
            withPostFastReactions && reactions && message.kind === 'Normal' && (React.createElement(ConvoMessageFastReactionsMenu, { className: "ConvoMessage__postFastReactions", triggerClassName: "ConvoMessage__postFastReactionsTrigger", isDisabled: !!selectionExists, isCompact: isCompact, isPreopened: !!withPostFastReactionsSuggest, reactions: reactions, activeReactionId: message.reactionId, cmid: message.cmid, peerId: peerId, offsetTop: 10, offsetLeft: 8, onReactionClick: onReactionClick, onClose: disablePostFastReactionsSuggest })),
            React.createElement("div", { className: "ConvoMessage__content" },
                withAuthorName ? (React.createElement(ConvoMessageHeader, { className: "ConvoMessage__authorName", author: author, sentFromPeerId: showSentFrom ? peerId : undefined, scrollToMsg: showSentFrom ? scrollToMsg : undefined, isRestrictedToWrite: isAuthorRestrictedToWrite })) : (React.createElement(VisuallyHidden, null,
                    React.createElement(ConvoMessageHeader, { className: "ConvoMessage__authorName", author: author, sentFromPeerId: showSentFrom ? peerId : undefined, scrollToMsg: showSentFrom ? scrollToMsg : undefined, isRestrictedToWrite: isAuthorRestrictedToWrite }))),
                message.replyMessage && (React.createElement(RepliedMessage, { className: "ConvoMessage__reply", rootMessage: rootMsg, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: handleReplyClick, message: message.replyMessage, highlightFuzzySearch: highlightSearchQuery, forceUseModal: isUsedInModal, ...highlighterStyles })),
                attaches.gift && (React.createElement(AttachGift, { message: message, gift: attaches.gift }, hasText && (React.createElement(MessageText, { chunks: message.chunks, kind: message.kind, peerId: message.peerId, allowMentionHighlighting: true, highlightFuzzySearch: highlightSearchQuery, formatData: message.formatData, ...highlighterStyles })))),
                attaches.story && !storyComment && (React.createElement(AttachStory, { story: attaches.story, isOut: isOut, isCompact: isCompact, isThemed: isThemed, onWidthChange: handleChangeAttachWidth })),
                hasMediaAttaches && !isPublicVideo && (React.createElement(MediaAttachments, { className: "ConvoMessage__mediaAttachments", autoplay: !isMainPanelChanging, message: message, peerId: peerId, isInBubble: true, isThemed: isThemed, isClipOnly: isClipOnly, isCompact: isCompact, onWidthChange: handleChangeAttachWidth, getMediaAttachLinkPayload: getMediaAttachLinkPayload, forceAutoPlay: Message.getForceAutoPlay(message), withAuthorName: withAuthorName, onPlayed: handleMessagePlayed, openClipCoOwnersModal: openClipCoOwnersModal, isForwarded: isForwarded })),
                hasText && !attaches.gift && (React.createElement(MessageText, { className: "ConvoMessage__text", chunks: message.chunks, kind: message.kind, peerId: peerId, allowMentionHighlighting: true, highlightFuzzySearch: highlightSearchQuery, underlineLink: isOut && isThemed, formatData: message.formatData, ...highlighterStyles })),
                isEmpty && (React.createElement("span", { className: "ConvoMessage__text ConvoMessage__empty" }, lang.use('me_attach_deleted'))),
                attaches.sticker && (React.createElement(AttachSticker, { openStickerPackOnClick: !isUsedInModal, size: stickerSize, sticker: attaches.sticker, iconPosition: attaches.sticker.item.popup && stickerIconPosition, forceBorder: isThemed, message: message })),
                attaches.ugcSticker && (React.createElement(AttachUGCSticker, { openStickerPackOnClick: !isUsedInModal, size: stickerSize, ugcSticker: attaches.ugcSticker, iconPosition: stickerIconPosition })),
                attaches.videoMessage &&
                    // Сейчас видеосообщение может быть только входящим, мы не отправляем
                    message.kind !== 'Queued' &&
                    (Peer.isUserPeerId(message.authorId) ||
                        Peer.isGroupPeerId(message.authorId)) && (React.createElement(AttachVideoMessage, { message: message, isFavorites: isFavorites, isOut: isOut, isUnread: isUnread, isWithoutBubblesTheme: false, isInBubble: false, videoMessage: attaches.videoMessage, convoPeerId: peerId, messageAuthorId: message.authorId, messageSentAt: message.sentAt, rootMessageId: Message.resolveCmid(id), onPlayed: handleMessagePlayed })),
                hasAttaches && (React.createElement(Attachments, { className: cx('ConvoMessage__attachments', {
                        'ConvoMessage__attachments--withoutMarginTop': featureFlags.vkm_forward_attach_margin_fix && !hasText,
                    }), autoplay: !isMainPanelChanging, entrypoint: entrypoint, message: message, peerId: peerId, isFavorites: isFavorites, isInBubble: true, isCompact: isCompact, isThemed: isThemed, isInModal: isUsedInModal, isClipOnly: isClipOnly, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onPlayed: handleMessagePlayed, onWidthChange: handleChangeAttachWidth })),
                hasMediaAttaches && isPublicVideo && (React.createElement(MediaAttachments, { className: "ConvoMessage__mediaAttachments", autoplay: !isMainPanelChanging, message: message, peerId: peerId, isInBubble: true, isThemed: isThemed, isClipOnly: isClipOnly, showDateOutInsidePublicVideo: showDateOutInsidePublicVideo, isUnread: isUnread, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: handleChangeAttachWidth, forceAutoPlay: Message.getForceAutoPlay(message), withAuthorName: withAuthorName, openClipCoOwnersModal: openClipCoOwnersModal, onPlayed: handleMessagePlayed, isForwarded: isForwarded })),
                message.forwardedMessages && featureFlags.vkm_new_forward && (React.createElement("div", { className: cx('ConvoMessage__forwardedMessages ConvoMessage__forwardedMessages--new', {
                        'ConvoMessage__forwardedMessages--withMargin': hasText ||
                            hasMediaAttaches ||
                            hasAttaches ||
                            withAuthorName,
                    }) },
                    React.createElement(ForwardedMessagesList, { message: message, rootMessage: rootMsg, isCompact: isCompact, onScrollToMessage: onScrollToMessage, onOpenMessageInModal: onOpenForwardedMessageInModal, onCloseMessageInModal: onCloseForwardedMessageInModal, openClipCoOwnersModal: openClipCoOwnersModal, highlightFuzzySearch: highlightSearchQuery, handleChangeAttachWidth: handleChangeForwardAttachWidth, getMediaAttachLinkPayload: getMediaAttachLinkPayload, isThemed: isThemed, isContrastTheme: isContrastTheme, isUsedInModal: isUsedInModal, ...highlighterStyles }))),
                message.forwardedMessages && !featureFlags.vkm_new_forward && (
                // Используем в качестве ключа индекс, потому что у форварда может не быть ID
                React.createElement("div", { className: "ConvoMessage__forwardedMessages" }, message.forwardedMessages.map((forwarded, i) => (React.createElement(ForwardedMessage, { key: i, rootMessage: rootMsg, message: forwarded, isCompact: isCompact, onScrollToMessage: onScrollToMessage, totalForwardedMessageCount: message.forwardedMessages?.length, onOpenMessageInModal: onOpenMessageInModal, openClipCoOwnersModal: openClipCoOwnersModal, onCloseMessageInModal: onCloseMessageInModal, usedInModal: isUsedInModal ? 'as-message' : undefined, highlightFuzzySearch: highlightSearchQuery, handleChangeAttachWidth: handleChangeForwardAttachWidth, getMediaAttachLinkPayload: getMediaAttachLinkPayload, isThemed: isThemed, ...highlighterStyles }))))),
                (floatDate || !hasReactions) &&
                    showInfo &&
                    !attaches.videoMessage &&
                    !showDateOutInsidePublicVideo && (React.createElement(ConvoMessageBottomInfo, { className: cx('ConvoMessage__info', {
                        'ConvoMessage__info--smallerTopMargin': smallerDateTopMargin,
                        'ConvoMessage__info--float': floatDate,
                        'ConvoMessage__info--floatWithoutBackground': floatDateWithoutBackground,
                        'ConvoMessage__info--floatWithWhiteColor': floatDateWithWhiteColor,
                        'ConvoMessage__info--floatWithSmallMargin': floatDateWithSmallMargin,
                    }), dateClassName: "ConvoMessage__date", message: message, isUnread: isUnread, showDate: showDate, 
                    /**
                     * cmid в отложках пересекаются с cmid в обычной истории сообщений.
                     */
                    onClick: message.kind === 'Normal' && message.isPostponed
                        ? undefined
                        : scrollToMsg })),
                actions && noBackground && actions,
                withClipFastReactions &&
                    reactions &&
                    message.kind === 'Normal' && (React.createElement(ConvoMessageFastReactionsMenu, { className: "ConvoMessage__clipFastReactions", triggerClassName: "ConvoMessage__clipFastReactionsTrigger", isDisabled: !!selectionExists, isCompact: isCompact, isPreopened: !!withClipFastReactionsSuggest, reactions: reactions, activeReactionId: message.reactionId, cmid: message.cmid, peerId: peerId, offsetTop: 10, offsetLeft: 8, onReactionClick: onReactionClick, onClose: disableClipFastReactionsSuggest }))),
            hasReactions && (React.createElement("div", { className: "ConvoMessage__footer", style: { maxWidth: attachWidth } },
                React.createElement(ConvoMessageReactions, { message: message, messageReactions: messageReactions, onReactionClick: (reactionId) => onReactionClick?.(reactionId, 'nearby_click'), unreadReactionId: unreadReactionId, canOpenReactedPeers: canOpenReactedPeers, disableAnimations: disableReactionAnimations, reactionChipTheme: noBackground ? 'background' : isOut ? 'outgoing' : 'incoming' }),
                !floatDate && showInfo && (React.createElement(ConvoMessageBottomInfo, { className: cx('ConvoMessage__info', 'ConvoMessage__info--withReactions', {
                        MEAppThemeStylesContrastDisable: disableBottomInfoContrast,
                    }), dateClassName: "ConvoMessage__date", message: message, isUnread: isUnread, showDate: showDate, 
                    /**
                     * cmid в отложках пересекаются с cmid в обычной истории сообщений.
                     */
                    onClick: message.kind === 'Normal' && message.isPostponed
                        ? undefined
                        : scrollToMsg })))),
            actions && !noBackground && actions,
            hasKeyboard && (React.createElement(BotKeyboard
            // Ключ сбрасывает загрузку у callback-кнопок при смене клавы: ME-47984
            , { 
                // Ключ сбрасывает загрузку у callback-кнопок при смене клавы: ME-47984
                key: message.updatedAt, inline: true, cmid: message.cmid, keyboard: message.keyboard, onButtonClick: onKeyboardSend, onCallbackButtonClick: onCallbackButtonClick, isCompact: isCompact }))),
        message.kind === 'Normal' &&
            message.template &&
            message.template.kind === 'Carousel' &&
            onCallbackButtonClick && (React.createElement(BotTemplateList, { authorId: message.authorId, cmid: message.cmid, elements: message.template.elements, onClick: onKeyboardSend, onCallbackButtonClick: onCallbackButtonClick, isCompact: isCompact }))));
};
/**
 * Вынесено в отдельный компонент ради оптимизации подписки на текущее время.
 * Мы не хотим каждую секунду ререндерить все сообщение.
 */
const Bomb = ({ expiresAt, showingDuration, onWidthChange }) => {
    const { isMobileLayout } = useLayoutData();
    const [isTimeShown, setIsTimeShown] = useState(false);
    const now = useNow(1000);
    const ref = useRef(null);
    const delta = Math.max(expiresAt - now, 0);
    const shouldShow = showingDuration === undefined || delta <= showingDuration;
    useLayoutEffect(() => {
        if (shouldShow && ref.current && isMobileLayout) {
            // 4 - подобранная константа, чтобы отступ не был слишком большим
            onWidthChange(ref.current.offsetWidth - 4);
        }
    }, [shouldShow, isTimeShown, isMobileLayout, onWidthChange]);
    if (!shouldShow) {
        return null;
    }
    const formattedTime = isTimeShown
        ? formatDuration(Math.floor(delta / 1000))
        : '';
    return (React.createElement("button", { className: cx('ConvoMessage__bomb', {
            'ConvoMessage__bomb--dynamic': !isMobileLayout,
            'ConvoMessage__bomb--soon': delta <= Time.Minute,
            'ConvoMessage__bomb--blink': delta <= 10 * 1000,
        }), ref: ref, onClick: (event) => {
            event.stopPropagation(); // Отменяем выделение сообщения
            setIsTimeShown(!isTimeShown);
        } }, !isTimeShown ? React.createElement(Icon16Bomb, null) : formattedTime));
};
export function calculateWidth(prev, width, ignorePrev) {
    /**
     * Если не передан ignorePrev, то пытаемся подстроиться под максимальную ширину, так как при динамическом изменении контента, не знаем какая ширина придет раньше.
     * Передаем ignorePrev, если это поведение не нужно, и мы точно уверены в ширине, которую хотим установить.
     */
    const attachWidth = ignorePrev ? width : Math.max(width, prev || 0);
    if (attachWidth) {
        return Math.max(attachWidth, MIN_MESSAGE_WIDTH);
    }
    return undefined;
}
//# sourceMappingURL=ConvoMessage.js.map