import * as Message from '../../../core/model/Message';
import * as TextChunk from '../../../core/model/TextChunk';
import * as Peer from '../../../core/model/Peer';
import { createEmojiElement } from '../../../shared/emoji';
import { addProtocolToUrl } from '../../../core/utils/misc';
import { escape, unescape } from '@vkontakte/vkjs';
import { getFormattingTagsHashes } from './common';
export function formattedMessageToComposerHtml(chunks, formats, vkm_fix_formatted_link_offset) {
    const chunksEnriched = chunks.map((chunk) => {
        const raw = TextChunk.toRawText([chunk]);
        switch (chunk.kind) {
            case 'Text':
            case 'Code':
            case 'Hashtag':
            case 'HashtagMention':
            case 'Email':
            case 'Url': {
                return {
                    ...chunk,
                    html: raw,
                    length: raw.length,
                };
            }
            case 'LineBreak': {
                return {
                    ...chunk,
                    html: raw,
                    length: raw.length,
                };
            }
            case 'MassMention':
            case 'Mention':
            case 'ScreenNameMention': {
                return {
                    ...chunk,
                    html: raw,
                    length: 1,
                };
            }
            case 'Emoji': {
                return {
                    ...chunk,
                    html: raw,
                    length: vkm_fix_formatted_link_offset ? raw.length : 1,
                };
            }
            default: {
                return chunk;
            }
        }
    });
    const hashes = getFormattingTagsHashes();
    // Идём по всем чанкам
    for (let i = 0; i < chunksEnriched.length; i += 1) {
        const chunk = chunksEnriched[i];
        if (!chunk ||
            (chunk.kind !== 'Text' &&
                chunk.kind !== 'Hashtag' &&
                chunk.kind !== 'HashtagMention' &&
                chunk.kind !== 'Email' &&
                chunk.kind !== 'Url' &&
                chunk.kind !== 'Code' &&
                chunk.kind !== 'Mention' &&
                chunk.kind !== 'ScreenNameMention' &&
                chunk.kind !== 'MassMention')) {
            continue;
        }
        // Вычисляем позицию чанка в тексте сообщения
        const prevChunksLength = chunksEnriched
            .slice(0, i)
            .reduce((acc, item) => acc + item.length, 0);
        const chunkStart = prevChunksLength;
        const chunkEnd = chunkStart + chunk.length;
        // Для каждого чанка находим форматы, которые его касаются, запоминаем их
        let relatedFormats = [];
        formats.forEach((format) => {
            const formatStart = format.offset;
            const formatEnd = format.offset + format.length;
            // P.S.: пояснение в следующем блоке кода
            const isWholeChunkIncluded = formatStart <= chunkStart && formatEnd >= chunkEnd;
            const isChunkWholePartIncluded = formatStart >= chunkStart && formatEnd <= chunkEnd;
            const isChunkStartAffected = formatStart <= chunkStart &&
                formatEnd >= chunkStart &&
                formatEnd <= chunkEnd;
            const isChunkEndAffected = formatStart >= chunkStart &&
                formatStart <= chunkEnd &&
                formatEnd > chunkEnd;
            if (chunk.kind === 'Mention' ||
                chunk.kind === 'ScreenNameMention' ||
                chunk.kind === 'MassMention') {
                if (isWholeChunkIncluded) {
                    relatedFormats.push({
                        ...format,
                    });
                }
            }
            else if (isWholeChunkIncluded || // {chunk}
                isChunkWholePartIncluded || // ch{u}nk
                isChunkStartAffected || // { ... ch}unk
                isChunkEndAffected // ch{unk ... }
            ) {
                relatedFormats.push({
                    ...format,
                });
            }
        });
        // Сортируем форматы чанка в порядке применения по возрастанию
        relatedFormats = relatedFormats.sort((a, b) => {
            if (a.offset !== b.offset) {
                return a.offset - b.offset;
            }
            return b.length - a.length;
        });
        // Выставляем форматам позиции внутри чанка вместо позиций внутри сообщения
        relatedFormats = relatedFormats.map((format) => {
            const formatStart = format.offset;
            const formatEnd = format.offset + format.length;
            const chunkStart = prevChunksLength;
            const formatStartInChunk = Math.max(formatStart - chunkStart, 0);
            const formatEndInChunk = Math.min(formatEnd - chunkStart, chunk.length);
            if (chunk.kind === 'Mention') {
                return {
                    ...format,
                    offset: 0,
                    length: TextChunk.toRawText([
                        {
                            kind: chunk.kind,
                            displayName: chunk.displayName,
                            peerId: Peer.resolveId(+chunk.peerId),
                            type: chunk.type,
                        },
                    ]).length,
                };
            }
            if (chunk.kind === 'ScreenNameMention' || chunk.kind === 'MassMention') {
                return {
                    ...format,
                    offset: 0,
                    length: TextChunk.toRawText([chunk]).length,
                };
            }
            return {
                ...format,
                offset: formatStartInChunk,
                length: formatEndInChunk - formatStartInChunk,
            };
        });
        // Идем по каждому формату чанка, применяя его и делая сдвиги для следующих
        for (let f = 0; f < relatedFormats.length; f += 1) {
            const format = relatedFormats[f];
            if (!format) {
                continue;
            }
            const before = chunk.html.slice(0, format.offset);
            const after = chunk.html.slice(format.offset + format.length);
            const content = chunk.html.slice(format.offset, format.offset + format.length);
            const escapedLinkUrl = escape(format.url || '');
            const openingTag = format.type === Message.FormatKind.URL
                ? `${hashes.url.opening} class="ConvoComposer__textAsLink" data-url="${addProtocolToUrl(escapedLinkUrl)}" href="${escapedLinkUrl}"${hashes.url.bracket}`
                : hashes[format.type].opening;
            const closingTag = hashes[format.type].closing;
            // Вставляем теги формата
            chunk.html = before + openingTag + content + closingTag + after;
            // Сдвигаем позиции следующих форматов согласно длине вставленных тегов
            if (f + 1 < relatedFormats.length) {
                for (let j = f + 1; j < relatedFormats.length; j += 1) {
                    const nextFormat = relatedFormats[j];
                    if (nextFormat) {
                        if (format.offset <= nextFormat.offset) {
                            nextFormat.offset += openingTag.length;
                        }
                        if (format.offset + format.length <=
                            nextFormat.offset - openingTag.length) {
                            nextFormat.offset += closingTag.length;
                        }
                    }
                }
            }
        }
    }
    // Строим html, чтобы отобразить его в композере
    let result = '';
    for (const chunk of chunksEnriched) {
        switch (chunk.kind) {
            case 'Emoji':
                const emoji = createEmojiElement(chunk.text);
                if (__isTextNode(emoji)) {
                    result += emoji.nodeValue;
                }
                else {
                    result +=
                        hashes.emoji.opening +
                            emoji.outerHTML.slice(4, -1) + // отрезаем <img в начале и > в конце
                            hashes.emoji.closing;
                }
                break;
            default:
                result += chunk.html;
                break;
        }
    }
    /** Заменяем обратно хэши на тэги после эскейпа */
    let escapedResult = escape(result)
        .replaceAll(hashes[Message.FormatKind.BOLD].opening, `<${Message.FORMATTING_NODE_NAMES.bold}>`)
        .replaceAll(hashes[Message.FormatKind.BOLD].closing, `</${Message.FORMATTING_NODE_NAMES.bold}>`)
        .replaceAll(hashes[Message.FormatKind.ITALIC].opening, `<${Message.FORMATTING_NODE_NAMES.italic}>`)
        .replaceAll(hashes[Message.FormatKind.ITALIC].closing, `</${Message.FORMATTING_NODE_NAMES.italic}>`)
        .replaceAll(hashes[Message.FormatKind.UNDERLINE].opening, `<${Message.FORMATTING_NODE_NAMES.underline}>`)
        .replaceAll(hashes[Message.FormatKind.UNDERLINE].closing, `</${Message.FORMATTING_NODE_NAMES.underline}>`)
        .replaceAll(hashes.url.closing, `</${Message.FORMATTING_NODE_NAMES.url}>`);
    /** Заменяем хэши урла на тэги */
    const __findUrlOpeningTag = (source) => {
        return source.match(new RegExp(`${hashes.url.opening}.+?${hashes.url.bracket}`));
    };
    let urlMatches = __findUrlOpeningTag(escapedResult);
    while (urlMatches && urlMatches.index !== undefined) {
        const match = urlMatches[0];
        const matchPrepared = unescape(match)
            .replace(hashes.url.opening, `<${Message.FORMATTING_NODE_NAMES.url}`)
            .replace(hashes.url.bracket, '>');
        escapedResult = escapedResult.replace(match, matchPrepared);
        urlMatches = __findUrlOpeningTag(escapedResult);
    }
    /** Заменяем хэши эмодзи на тэги */
    const __findEmojiImageTag = (source) => {
        return source.match(new RegExp(`${hashes.emoji.opening}.+?${hashes.emoji.closing}`));
    };
    let emojiMatches = __findEmojiImageTag(escapedResult);
    while (emojiMatches && emojiMatches.index !== undefined) {
        const match = emojiMatches[0];
        const matchPrepared = unescape(match)
            .replace(hashes.emoji.opening, `<img`)
            .replace(hashes.emoji.closing, '>');
        escapedResult = escapedResult.replace(match, matchPrepared);
        emojiMatches = __findEmojiImageTag(escapedResult);
    }
    return escapedResult;
}
const __isTextNode = (node) => {
    return node.nodeType === Node.TEXT_NODE;
};
//# sourceMappingURL=edit.js.map