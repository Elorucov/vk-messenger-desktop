import '../../ui/MessagePreview/MessagePreview.css';
import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import * as Message from '../../../core/model/Message';
import * as Attach from '../../../core/model/Attach';
import { ServiceMessagePreview } from '../../ui/ServiceMessagePreview/ServiceMessagePreview';
import { getAttachText } from '../../ui/AttachText/AttachText';
import { PlainText } from '../../ui/PlainText/PlainText';
import { HighlighterRenderer, } from '../../ui/Highlighter/Highlighter';
import { applyCombinedFuzzyAndExactSearch, applyPreviewMode, isMatchFound, } from '../../ui/Highlighter/search';
export const MessagePreview = React.memo(function MessagePreview({ message, attachPreviewBrackets = false, highlightFuzzySearch, highlightColor, highlightColorOpacity, withFormatting, }) {
    const { lang } = useBrowserEnv();
    if (message.kind === 'Service') {
        return React.createElement(ServiceMessagePreview, { message: message });
    }
    if (message.kind === 'Expired' || message.kind === 'ForeignExpired') {
        return (React.createElement("span", { className: "MessagePreview" }, lang.use('me_message_expired', { num: 1 })));
    }
    const messageText = Message.toPlainText(message, { multiline: false });
    const attachmentPreview = getAttachmentPreview(message, lang);
    const brackets = attachPreviewBrackets && message.chunks.length > 0;
    if (!messageText && !attachmentPreview) {
        return (React.createElement("span", { className: "MessagePreview" }, lang.use('me_empty_message')));
    }
    const textContent = getHighlightedTextContent(messageText, { highlightColor, highlightColorOpacity }, highlightFuzzySearch) ?? (React.createElement(PlainText, { chunks: message.chunks, multiline: false, formatData: withFormatting ? message.formatData : undefined }));
    return (React.createElement("span", { className: "MessagePreview" },
        textContent,
        attachmentPreview && (React.createElement("span", { className: "MessagePreview__attach" },
            ' ',
            brackets && '[',
            attachmentPreview,
            brackets && ']'))));
});
function getHighlightedTextContent(messageText, highlightStyle, highlightFuzzySearch) {
    if (!highlightFuzzySearch) {
        return;
    }
    const searchResult = applyCombinedFuzzyAndExactSearch(messageText, highlightFuzzySearch);
    if (!isMatchFound(searchResult)) {
        return;
    }
    const searchResultPreview = applyPreviewMode(searchResult, 30, Infinity);
    return (React.createElement(HighlighterRenderer, { searchResult: searchResultPreview, ...highlightStyle }));
}
export function getAttachmentPreview(message, lang, withForwarded = true, withReply = true) {
    const attachmentKindsCount = Attach.kindsCount(message.attaches);
    const attachmentsCount = Attach.count(message.attaches);
    if (attachmentKindsCount === 2 &&
        message.attaches.story &&
        (message.attaches.sticker || message.attaches.ugcSticker)) {
        return lang.use('me_attaches_story_reaction');
    }
    if (attachmentKindsCount > 1) {
        // X вложений
        return lang.use('me_attaches_attaches', {
            num: attachmentsCount,
        });
    }
    const attach = Object.values(message.attaches)[0];
    if (attach) {
        return getAttachText(attach, lang);
    }
    if (withForwarded &&
        message.forwardedMessages &&
        message.forwardedMessages.length > 0) {
        // X сообщений
        return lang.use('me_attaches_messages', {
            num: message.forwardedMessages.length,
        });
    }
    if (withReply && message.replyMessage) {
        return lang.use('me_attaches_messages', {
            num: 1,
        });
    }
    return null;
}
//# sourceMappingURL=MessagePreview.js.map