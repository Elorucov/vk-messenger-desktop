import '../../ui/SearchMessageResult/SearchMessageResult.css';
import React from 'react';
import cx from 'classnames';
import { useBrowserEnv, useCommunityMessagingWithToggle, useMessageAuthor, useOwner, usePeers, useViewer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import { Avatar } from '../../ui/Avatar/Avatar';
import * as Message from '../../../core/model/Message';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { FormattedDate } from '../../ui/Time/Time';
import { Highlighter, HighlighterRenderer, } from '../../ui/Highlighter/Highlighter';
import { applyCombinedFuzzyAndExactSearch, applyPreviewMode, getMatchesCount, } from '../../ui/Highlighter/search';
import { getAttachmentPreview } from '../../ui/MessagePreview/MessagePreview';
import { CasperIcon } from '../../ui/CasperIcon/CasperIcon';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
export const SearchMessageResult = React.memo(({ message, isSelected, onClick, peer, convo, searchQuery, className }) => {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const { author, adminAuthor } = useMessageAuthor(message);
    const isFavorites = convo && Peer.isFavorites(convo.peerId, owner.id);
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const title = isFavorites ? lang.use('me_favorites') : Peer.name(peer);
    const onKeyDownHandler = (keyCombo, event) => {
        if (keyCombo === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            onClick(message);
        }
    };
    return (React.createElement("article", { className: cx('SearchMessageResult', className, {
            'SearchMessageResult--selected': isSelected,
        }), role: "menuitem", tabIndex: isSelected ? 0 : -1, onClick: () => onClick(message), onKeyDown: onElementKeyDownFactory(onKeyDownHandler) },
        React.createElement("div", { className: "SearchMessageResult__avatar" }, isFavorites ? (React.createElement(AvatarFavorites, { size: 40 })) : (React.createElement(Avatar, { peer: peer, size: 40, withBirthday: true }))),
        React.createElement("header", { className: "SearchMessageResult__header" },
            React.createElement("div", { className: "SearchMessageResult__titleWithIcon" },
                React.createElement("h3", { className: "SearchMessageResult__title" },
                    React.createElement(Highlighter, { search: searchQuery, text: title, strategy: "fuzzy" })),
                convo && Convo.isCasper(convo) && (React.createElement(CasperIcon, { className: "SearchMessageResult__icon" }))),
            React.createElement(FormattedDate, { timestamp: message.sentAt, variant: "time", className: "SearchMessageResult__date" })),
        React.createElement("div", { className: "SearchMessageResult__message" },
            React.createElement(SearchMessagePreview, { message: message, searchQuery: searchQuery, lang: lang, author: author, adminAuthor: isCommunityMessaging ? adminAuthor : undefined }))));
});
function SearchMessagePreview({ message, searchQuery, lang, author, adminAuthor, }) {
    const peers = usePeers();
    let defaultPreviewText = '';
    // Автор исходного сообщения в реплае / форварде
    let replyForwardAuthor = undefined;
    const messagesToSearch = [{ message, type: 'normal' }];
    flattenForeignMessages(messagesToSearch, [message]);
    let searchResult = null;
    for (const messageToSearch of messagesToSearch) {
        const text = Message.toPlainText(messageToSearch.message, {
            multiline: false,
        });
        if (messageToSearch.message === message) {
            // Если не найдем совпадений ни в одном из сообщений, то покажем превью основного сообщения
            defaultPreviewText = text;
        }
        const result = applyCombinedFuzzyAndExactSearch(text, searchQuery);
        const matchesCount = getMatchesCount(result);
        if (matchesCount > 0) {
            const previewOffsets = matchesCount > 1
                ? // Константы ниже выведены эмпирическим путем
                    {
                        left: 20,
                        right: 20,
                    }
                : { left: 40, right: Infinity };
            searchResult = {
                result: applyPreviewMode(result, previewOffsets.left, previewOffsets.right),
                type: messageToSearch.type,
            };
            replyForwardAuthor = Peer.safeGet(peers, messageToSearch.message.authorId);
            break;
        }
    }
    /**
     * Если совпадение с запросом найдено в одном из пересланных сообщений,
     * то будем отображать превью этого пересланного сообщения, поэтому в таком
     * случае не показываем надпись для пересланных сообщений.
     */
    const showForwardsAsAttach = searchResult?.type !== 'forwarded';
    const attachmentPreview = getAttachmentPreview(message, lang, showForwardsAsAttach);
    const attachOrDefaultText = defaultPreviewText ? (React.createElement("span", { className: "SearchMessageResult__normalPreview" }, defaultPreviewText)) : (attachmentPreview && (React.createElement("span", { className: "SearchMessageResult__attachPreview" }, attachmentPreview)));
    const firstPhotoUrl = message.attaches.photos?.[0].sizes.get('s')?.url;
    if (searchResult !== null) {
        const isForwardOrReply = searchResult.type === 'reply' || searchResult.type === 'forwarded';
        const isAttachPreviewAfterText = !isForwardOrReply || defaultPreviewText;
        return (React.createElement(React.Fragment, null,
            replyForwardAuthor && isForwardOrReply && (React.createElement("div", { className: "SearchMessageResult__preview" },
                React.createElement(SearchMessageResultText, { author: replyForwardAuthor, adminAuthor: adminAuthor, withLine: true },
                    React.createElement("span", { className: cx({
                            SearchMessageResult__replyPreview: searchResult.type === 'reply',
                            SearchMessageResult__forwardedPreview: searchResult.type === 'forwarded',
                        }) },
                        React.createElement(HighlighterRenderer, { searchResult: searchResult.result }))))),
            React.createElement("div", { className: "SearchMessageResult__preview" },
                React.createElement("div", null,
                    React.createElement(SearchMessageResultText, { author: author, adminAuthor: adminAuthor },
                        React.createElement("span", { className: "SearchMessageResult__normalPreview" },
                            isForwardOrReply && attachOrDefaultText,
                            !isForwardOrReply && (React.createElement(HighlighterRenderer, { searchResult: searchResult.result })))),
                    isAttachPreviewAfterText && attachmentPreview && (React.createElement("div", { className: "SearchMessageResult__attachPreview" }, attachmentPreview))),
                firstPhotoUrl && (React.createElement("div", { className: "SearchMessageResult__picture" },
                    React.createElement("img", { className: "SearchMessageResult__pictureImg", alt: "", src: firstPhotoUrl }))))));
    }
    return (React.createElement("div", { className: "SearchMessageResult__preview" },
        React.createElement("div", null,
            React.createElement(SearchMessageResultText, { author: author, adminAuthor: adminAuthor }, attachOrDefaultText),
            defaultPreviewText && attachmentPreview && (React.createElement("div", { className: "SearchMessageResult__attachPreview" }, attachmentPreview))),
        firstPhotoUrl && (React.createElement("div", { className: "SearchMessageResult__picture" },
            React.createElement("img", { className: "SearchMessageResult__pictureImg", alt: "", src: firstPhotoUrl })))));
}
function SearchMessageResultText({ author, adminAuthor, children, withLine, }) {
    const owner = useOwner();
    const viewer = useViewer();
    const { lang } = useBrowserEnv();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const getAuthorName = () => {
        if (author === undefined) {
            return null;
        }
        if (isCommunityMessaging && adminAuthor) {
            return adminAuthor.id === viewer.viewer.id
                ? // Вы:
                    lang.use('me_convo_list_author_you')
                : // Имя другого админа
                    lang.use('me_convo_list_author_name', {
                        values: { name: Peer.shortName(adminAuthor, 'nom', false) },
                    });
        }
        if (isCommunityMessaging && author.id === owner.id) {
            // "Сообщество:"
            return lang.use('me_convo_list_author_community');
        }
        return author.id === owner.id
            ? // Вы:
                lang.use('me_convo_list_author_you')
            : // или имя пользователя
                lang.use('me_convo_list_author_name', {
                    values: { name: Peer.shortName(author, 'nom', false) },
                });
    };
    const authorName = getAuthorName();
    return (React.createElement("span", { className: cx('SearchMessageResult__text', {
            SearchMessageResult__textWithLine: withLine,
        }) },
        author !== undefined && (React.createElement("span", { className: "SearchMessageResult__author" },
            authorName,
            " ")),
        children));
}
function flattenForeignMessages(result, messages) {
    if (messages.length === 0) {
        return;
    }
    messages.forEach((message) => {
        const foreigns = [];
        const { replyMessage, forwardedMessages } = message;
        if (replyMessage && replyMessage.kind !== 'ForeignExpired') {
            foreigns.push({
                message: replyMessage,
                type: 'reply',
            });
        }
        if (forwardedMessages) {
            forwardedMessages.forEach((message) => {
                foreigns.push({
                    message,
                    type: 'forwarded',
                });
            });
        }
        result.push(...foreigns);
    });
}
//# sourceMappingURL=SearchMessageResult.js.map