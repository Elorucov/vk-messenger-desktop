import React from 'react';
import '../../ui/PostText/PostText.css';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import { ExternalLink } from '../../ui/Link/Link';
import { Highlighter, } from '../../ui/Highlighter/Highlighter';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { LinkRenderer, MentionRenderer, } from '../../ui/MessageText/MessageText';
import { useFeatureFlags, usePeers, useViewer } from '../../hooks/misc';
import { Emoji } from '../../ui/Emoji/Emoji';
import { useRouter } from '../../ui/Router/Router';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
export const PostText = React.forwardRef(({ chunks, channelId, className, multiline = true, isFocused, searchQueryToHighlight, isCommunityChannel, highlightColor, highlightColorOpacity, }, ref) => {
    const { viewer } = useViewer();
    const { screenRoute, navigate } = useRouter();
    const peers = usePeers();
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const getHighlightedText = (text) => isFocused && searchQueryToHighlight ? (React.createElement(Highlighter, { search: searchQueryToHighlight, text: text, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity })) : (text);
    const onHashtagClickHandler = (tag) => {
        if (screenRoute.kind !== 'ChannelRoute') {
            return;
        }
        if (isCommunityChannel) {
            // ME-73024 Временно выключаем хэштеги в новых каналах
            return;
        }
        navigate({
            ...screenRoute,
            kind: 'ChannelRoute',
            channelId: channelId,
            search: tag,
        });
    };
    if (chunks.length === 0) {
        return null;
    }
    const getHashTagContent = (chunk) => {
        const screenName = chunk.kind === 'HashtagMention' ? `@${chunk.screenName}` : '';
        return (React.createElement("span", { onClick: () => onHashtagClickHandler(chunk.tag), role: "button", className: 
            // ME-73024 Временно выключаем хэштеги в новых каналах
            isCommunityChannel ? '' : 'MessageText__link PostText__hashtag', tabIndex: 0 }, `${chunk.tag}${screenName}`));
    };
    return (React.createElement("span", { ref: ref, className: cx('PostText', vkm_new_bubbles_width_calc && 'PostText__refactored', className) }, chunks.map((chunk, i) => {
        switch (chunk.kind) {
            case 'Text':
                return (React.createElement(React.Fragment, { key: i }, getHighlightedText(chunk.text)));
            case 'Emoji':
                return React.createElement(Emoji, { emoji: chunk.text, key: i });
            case 'Code':
                return React.createElement(CodeBlock, { code: chunk, key: i });
            case 'Email':
                return (React.createElement(ExternalLink, { key: i, href: `mailto:${chunk.email}`, className: "MessageText__link", onClick: () => { } }, getHighlightedText(chunk.email)));
            case 'Url':
                return (React.createElement(LinkRenderer, { key: i, href: chunk.href, displayName: getHighlightedText(chunk.caption), className: "MessageText__link" }));
            case 'Hashtag':
            case 'HashtagMention':
                return (React.createElement(React.Fragment, { key: i }, getHashTagContent(chunk)));
            case 'Mention':
                // Обрабатываем @id0, показывая вьювера
                const mentionedPeerId = chunk.peerId === 0 ? viewer.id : chunk.peerId;
                const mentionedPeer = peers.get(mentionedPeerId);
                return (React.createElement(MentionRenderer, { key: i, peerId: mentionedPeerId, screenName: mentionedPeer && Peer.screenName(mentionedPeer), displayName: chunk.displayName }));
            case 'ScreenNameMention':
                return (React.createElement(MentionRenderer, { key: i, url: `/${chunk.screenName}`, displayName: chunk.displayName }));
            case 'MassMention':
                return (React.createElement(React.Fragment, { key: i }, chunk.displayName));
            case 'LineBreak':
                return multiline ? React.createElement("br", { key: i }) : ' ';
            default:
                return exhaustivenessCheck(chunk);
        }
    })));
});
//# sourceMappingURL=PostText.js.map