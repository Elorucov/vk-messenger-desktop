import * as Peer from '../model/Peer';
import * as P from 'parsimmon';
import { decodeHTMLEntities, unescape } from '@vkontakte/vkjs';
import { exhaustivenessCheck, safeDecodeURI } from '../utils/misc';
import * as Tokenizer from '../model/Tokenizer/Tokenizer';
export let PARSER_VERSION = 0;
export const MASS_MENTIONS = [
    { variant: 'all', mentions: ['all', 'everyone', 'все'] },
    { variant: 'online', mentions: ['online', 'here', 'тут', 'здесь'] },
];
/**
 * @deprecated
 *
 * Это исключительно временная функция, которая существует только для того,
 * чтобы не передавать фичефлаги по всему проекту с целью включить новый парсер.
 */
export function dontUse__enableNewParser__hack(version) {
    PARSER_VERSION = version;
}
/**
 * Функция разбиение текста на понятные типизированные кусочки,
 * с которым потом можно работать для формирования представления.
 */
export function fromServerText(text) {
    if (PARSER_VERSION === 1) {
        return Tokenizer.fromServerText(text).reduce((acc, chunk) => compactChunks(acc, chunk), []);
    }
    return fromText(parser.ServerChunks, text);
}
export function fromEngineText(text) {
    // лонгполл, в отличие от апи, возвращает текст с закодированными символами
    // & < > ' ", которые функция unescape и декодирует.
    // Так же лонгполл возвращает переносы строк br'ами
    return fromServerText(unescape(text.replace(/<br\s*\/?>/gi, '\n')));
}
export function fromClientText(text) {
    // decodeHTMLEntities декодирует только &#num; символы, потому что
    // только такие символы декодируются на бэкенде
    if (PARSER_VERSION === 1) {
        return Tokenizer.fromClientText(decodeHTMLEntities(text, {})).reduce((acc, chunk) => compactChunks(acc, chunk), []);
    }
    return fromText(parser.ClientChunks, decodeHTMLEntities(text, {}));
}
function fromText(parser, text) {
    if (text.length === 0) {
        return [];
    }
    try {
        return parser.tryParse(text).reduce(compactChunks, []);
    }
    catch (e) {
        console.error(e);
        return [];
    }
}
/**
 * Функция разбиение доверенного текста на понятные типизированные кусочки,
 * с которым потом можно работать для формирования представления.
 * Нужно для обработки кусков текста на подобии причины бана, где могут
 * быть форматированные ссылки на внешние ресурсы
 */
export function fromTrustedServerText(text) {
    if (PARSER_VERSION === 1) {
        return Tokenizer.fromTrustedServerText(text);
    }
    return fromText(parser.ServerTrustedChunks, text);
}
function compactChunks(acc, chunk) {
    if (chunk.kind === 'Text') {
        const last = acc[acc.length - 1];
        if (last?.kind === 'Text') {
            last.text += chunk.text;
        }
        else {
            acc.push({
                kind: 'Text',
                text: chunk.text,
            });
        }
    }
    else {
        acc.push(chunk);
    }
    return acc;
}
/**
 * Трансформирование токенов в текст
 * !! Возвращает в человекочитаемый, а не исходный
 */
export function transformChunkToPlainText(chunk, opts) {
    switch (chunk.kind) {
        case 'Text':
        case 'Emoji':
            return chunk.text;
        case 'Code':
            return opts?.multiline ? chunk.text : chunk.text.replace(/\n/g, ' ');
        case 'Mention':
        case 'MassMention':
        case 'ScreenNameMention':
            return chunk.displayName;
        case 'Email':
            return chunk.email;
        case 'Url':
            return chunk.caption;
        case 'Hashtag':
            return chunk.tag;
        case 'HashtagMention':
            return chunk.tag + `@${chunk.screenName}`;
        case 'LineBreak':
            return opts?.multiline ? '\n' : ' ';
        default:
            return exhaustivenessCheck(chunk);
    }
}
/**
 * Возвращает превью для сообщения
 */
export function toPlainText(chunks, opts) {
    return chunks.reduce((acc, chunk) => acc + transformChunkToPlainText(chunk, opts), '');
}
/**
 * Возвращает сырое или оригинальное представление сообщения.
 * В таком же виде сообщения возвращаются из АПИ
 */
export function toRawText(chunks) {
    return chunks.reduce((acc, chunk) => {
        switch (chunk.kind) {
            case 'Text':
            case 'Emoji':
            case 'Url':
                return acc + chunk.text;
            case 'Code':
                return acc + '```' + chunk.text + '```';
            case 'Mention': {
                const realId = Peer.toRealId(chunk.peerId);
                return acc + `[${chunk.type}${realId}|${chunk.displayName}]`;
            }
            case 'MassMention':
                return acc + chunk.displayName;
            case 'ScreenNameMention':
                return (acc +
                    (chunk.displayName.slice(1) === chunk.screenName
                        ? chunk.displayName
                        : `@${chunk.screenName} (${chunk.displayName})`));
            case 'Email':
                return acc + chunk.email;
            case 'Hashtag':
                return acc + chunk.tag;
            case 'HashtagMention':
                return acc + chunk.tag + `@${chunk.screenName}`;
            case 'LineBreak':
                return acc + '\n';
            default:
                return exhaustivenessCheck(chunk);
        }
    }, '');
}
const parser = P.createLanguage({
    ClientChunks: (r) => P.alt(r.LineBreak, r.Email, r.Url, r.HashtagMention, r.Hashtag, r.MassMention, r.Mention, r.ScreenNameMention, r.Text).many(),
    ServerChunks: (r) => P.alt(r.LineBreak, r.Email, r.Url, r.HashtagMention, r.Hashtag, r.MassMention, r.Mention, r.Text).many(),
    ServerTrustedChunks: (r) => P.alt(r.LineBreak, r.Email, r.TrustedUrl, r.Text).many(),
    LineBreak: () => P.regexp(/\n|<br ?\/?>/).map(() => ({ kind: 'LineBreak' })),
    ScreenName: () => P.seqObj(['prefix', P.oneOf('@*')], [
        'handle',
        P.alt(P.digit, P.letter, P.string('_'))
            .atLeast(2)
            .map((letters) => letters.join('')),
    ]),
    MassMention: () => P.regexp(/(?!,|;|:|\.|\s|\n|"|\(|\)|\[|\]|!|\?)([*@](all|everyone|все|online|here|здесь|тут))(?=$|,|;|:|<br ?\/?>|\.(?![a-z0-9_-])|\s|\n|"|\(|\)|\[|\]|!|\?)/i, 1).map((displayName) => ({ kind: 'MassMention', displayName })),
    Mention: () => P.seqObj(P.string('['), ['type', P.alt(P.string('id'), P.string('club'))], ['peerId', P.digit.atLeast(1).map((digits) => +digits.join(''))], ['displayName', P.regexp(/\|(.+?)]/, 1)]).map((value) => {
        let peerId;
        if (value.type === 'club') {
            peerId = Peer.resolveId(-value.peerId);
        }
        else {
            // @id0 является валидным упоминанием, которое ведет на страницу
            // того, кто нажал на это упоминание
            if (value.peerId === 0) {
                peerId = Peer.resolveId();
            }
            else {
                peerId = Peer.resolveId(value.peerId);
            }
        }
        return {
            kind: 'Mention',
            type: value.type,
            peerId,
            displayName: value.displayName,
        };
    }),
    ScreenNameMention: (r) => P.seqObj(['screenName', r.ScreenName], [
        'displayName',
        P.alt(P.seq(P.whitespace, P.regexp(/\((.+?)\)/, 1)).map(([, displayName]) => displayName), P.succeed(undefined)),
    ]).map((value) => {
        return {
            kind: 'ScreenNameMention',
            screenName: value.screenName.handle,
            displayName: value.displayName ||
                `${value.screenName.prefix}${value.screenName.handle}`,
        };
    }),
    /**
     * Обрабатывает ссылки в тексте от пользователей
     * Содержит в себе два парсера разом для пользовательских ссылок:
     * aliasedUrl для [vk.com/feed|новости]
     * plainUrl для vk.com/feed
     * и маппит их к одному типу Url
     */
    Url: () => {
        const aliasedUrl = P.seqObj(P.string('['), ['protocol', P.regexp(new RegExp(RE_URL_PROTOCOL, 'i'))], [
            'fullDomain',
            P.regexp(new RegExp('vk\\.com|vk\\.ru|vk\\.me|web\\.vk\\.me|vkvideo\\.ru', 'i')),
        ], 
        // запрещаем пути, начинающиеся на /away.php
        P.regexp(new RegExp('(?!/away\\.php)', 'i')), ['query', P.regexp(new RegExp(RE_URL_QUERY_ESC))], ['displayName', P.regexp(/\|(.+?)]/, 1)]).map((value) => {
            const { protocol, fullDomain, query, displayName } = value;
            const normalized = `${protocol || 'https://'}${fullDomain}${query}`;
            const original = `[${protocol}${fullDomain}${query}|${displayName}]`;
            return {
                kind: 'Url',
                caption: displayName,
                href: normalized,
                text: original,
            };
        });
        const plainUrl = P.seq(P.regexp(new RegExp(RE_URL_PROTOCOL, 'i')), P.regexp(new RegExp(RE_URL_DOMAIN_NAME)), P.regexp(new RegExp(RE_URL_DOMAIN_TOP)), P.regexp(new RegExp(RE_URL_PORT)), P.regexp(new RegExp(RE_URL_QUERY_ESC))).map((value) => {
            // при ссылке 'sub.vk.com': domainName = 'sub.vk.', domain = 'com'
            const [protocol, domainName, domain, port, query] = value;
            const normalized = `${protocol || 'https://'}${domainName}${domain}${port}${query}`;
            const full = value.join('');
            if (domain.length <= MAX_DOMAIN_LENGTH &&
                TOP_DOMAINS.has(domain.toLowerCase())) {
                return {
                    kind: 'Url',
                    caption: safeDecodeURI(full),
                    href: normalized,
                    text: full,
                };
            }
            return {
                kind: 'Text',
                text: full,
            };
        });
        return P.alt(aliasedUrl, plainUrl);
    },
    /**
     * Обрабатывает ссылки в тексте, которому мы доверям(написан нашими модераторами или админами)
     * Содержит в себе два парсера разом для пользовательских ссылок:
     * aliasedUrl для [vk.com/feed|новости]
     * plainUrl для vk.com/feed
     * и маппит их к одному типу Url
     */
    TrustedUrl: () => {
        const aliasedUrl = P.seqObj(P.string('['), ['protocol', P.regexp(new RegExp(RE_URL_PROTOCOL, 'i'))], [
            'fullDomain',
            P.regexp(new RegExp(RE_URL_DOMAIN_NAME + RE_URL_DOMAIN_TOP + RE_URL_PORT)),
        ], ['query', P.regexp(new RegExp(RE_URL_QUERY_ESC))], ['displayName', P.regexp(/\|(.+?)]/, 1)]).map((value) => {
            const { protocol, fullDomain, query, displayName } = value;
            const normalized = `${protocol || 'https://'}${fullDomain}${query}`;
            const original = `[${protocol}${fullDomain}${query}|${displayName}]`;
            return {
                kind: 'Url',
                caption: displayName,
                href: normalized,
                text: original,
            };
        });
        const plainUrl = P.seq(P.regexp(new RegExp(RE_URL_PROTOCOL, 'i')), P.regexp(new RegExp(RE_URL_DOMAIN_NAME)), P.regexp(new RegExp(RE_URL_DOMAIN_TOP)), P.regexp(new RegExp(RE_URL_PORT)), P.regexp(new RegExp(RE_URL_QUERY_ESC))).map((value) => {
            // при ссылке 'sub.vk.com': domainName = 'sub.vk.', domain = 'com'
            const [protocol, domainName, domain, port, query] = value;
            const normalized = `${protocol || 'https://'}${domainName}${domain}${port}${query}`;
            const full = value.join('');
            if (domain.length <= MAX_DOMAIN_LENGTH &&
                TOP_DOMAINS.has(domain.toLowerCase())) {
                return {
                    kind: 'Url',
                    caption: safeDecodeURI(full),
                    href: normalized,
                    text: full,
                };
            }
            return {
                kind: 'Text',
                text: full,
            };
        });
        return P.alt(aliasedUrl, plainUrl);
    },
    Hashtag: () => P.regexp(new RegExp(`#${HASHTAG_STRING_NUM}{0,100}${HASHTAG_STRING}${HASHTAG_STRING_NUM}{0,100}`, 'u')).map((tag) => ({ kind: 'Hashtag', tag })),
    HashtagMention: (r) => P.seqObj([
        'tag',
        P.regexp(new RegExp(`#${HASHTAG_STRING_NUM}{0,100}${HASHTAG_STRING}${HASHTAG_STRING_NUM}{0,100}`)),
    ], ['screenName', r.ScreenName]).map((value) => {
        return {
            kind: 'HashtagMention',
            tag: value.tag,
            screenName: value.screenName.handle,
        };
    }),
    Email: () => P.regexp(new RegExp('([a-zA-Zа-яА-Я\\-_\\.0-9\\+]+@(' +
        RE_URL_DOMAIN_NAME +
        RE_URL_DOMAIN_TOP +
        '))', 'i')).map((email) => ({ kind: 'Email', email })),
    Text: () => P.any.map((text) => ({ kind: 'Text', text })),
});
// Добавили символ: % для парсинга заенкоженных кириллических символов
export const RE_URL_DOMAIN_CHARS = '\\w\\$А-Яа-яёЁєЄҐґЇїІіЈј%';
export const RE_URL_PROTOCOL = '(https?:\\/\\/)?';
export const RE_URL_DOMAIN_NAME = '((?:[' + RE_URL_DOMAIN_CHARS + '—\\-_]+\\.){1,5})';
export const RE_URL_DOMAIN_TOP = '([A-Za-zа-яА-Я\\-\\d]{2,22})';
export const RE_URL_PORT = '(?:\\:(\\d{2,5}))?';
export const RE_URL_QUERY_SPLIT = '([\\/?#])';
export const URL_LETTERS = '\\wА-Яа-я\\xa8\\xb8\\xc0-\\xffєЄҐґЇїІіЈј';
export const INTERNATIONAL_LETTERS = '\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC'; // eslint-disable-line max-len
export const CHINESE_PUNCTUATION = '\u3000-\u303F\uFF00-\uFFEF';
export const RE_URL_RESERVED = "\\—\\-\\_@#%?+\\/\\$~=;:'*";
/*
 * Символы, на которые не может оканчиваться query-часть ссылки.
 * Нужно следить за тем, чтобы этих символов не было в RE_URL_ALL_POSITIONS_QUERY_CHAR.
 */
const RE_URL_NOT_LAST_QUERY_CHAR = '.';
/*
 * Символы, которые могут находиться в любом месте query-части ссылки.
 */
const RE_URL_ALL_POSITIONS_QUERY_CHAR = URL_LETTERS + RE_URL_RESERVED + INTERNATIONAL_LETTERS + CHINESE_PUNCTUATION;
const RE_URL_QUERY_CHAR = '(?:[' +
    RE_URL_ALL_POSITIONS_QUERY_CHAR +
    ']|[' +
    RE_URL_NOT_LAST_QUERY_CHAR +
    '](?!\\s|$|[^' +
    RE_URL_NOT_LAST_QUERY_CHAR +
    RE_URL_ALL_POSITIONS_QUERY_CHAR +
    ']))';
const RE_URL_GROUPED = '(?:\\(|\\[)[' + RE_URL_DOMAIN_CHARS + '\\d&#%;,]+(?:\\)|\\])';
const RE_URL_QUERY_ESC = '(' +
    RE_URL_QUERY_SPLIT +
    '(?:\\&amp;|\\&|\\&#\\d{2,6};|,[_%]|!|,*' +
    RE_URL_QUERY_CHAR +
    '+|' +
    RE_URL_GROUPED +
    '){0,200})?';
const ENGLISH_DOMAINS = 'aaa,aarp,abarth,abb,abbott,abbvie,abc,able,abogado,abudhabi,ac,academy,accenture,accountant,accountants,aco,active,actor,ad,adac,ads,adult,ae,aeg,aero,aetna,af,afamilycompany,afl,africa,ag,agakhan,agency,ai,aig,aigo,airbus,airforce,airtel,akdn,al,alfaromeo,alibaba,alipay,allfinanz,allstate,ally,alsace,alstom,am,americanexpress,americanfamily,amex,amfam,amica,amsterdam,an,analytics,android,anquan,anz,ao,aol,apartments,app,apple,aq,aquarelle,ar,aramco,archi,army,arpa,art,arte,as,asda,asia,associates,at,athleta,attorney,au,auction,audi,audible,audio,auspost,author,auto,autos,avianca,aw,aws,ax,axa,az,azure,ba,baby,baidu,banamex,bananarepublic,band,bank,bar,barcelona,barclaycard,barclays,barefoot,bargains,baseball,basketball,bauhaus,bayern,bb,bbc,bbt,bbva,bcg,bcn,bd,be,beats,beauty,beer,bentley,berlin,best,bestbuy,bet,bf,bg,bh,bharti,bi,bible,bid,bike,bing,bingo,bio,biz,bj,bl,black,blackfriday,blanco,blockbuster,blog,bloomberg,blue,bm,bms,bmw,bn,bnl,bnpparibas,bo,boats,boehringer,bofa,bom,bond,boo,book,booking,boots,bosch,bostik,boston,bot,boutique,box,bq,br,bradesco,bridgestone,broadway,broker,brother,brussels,bs,bt,budapest,bugatti,build,builders,business,buy,buzz,bv,bw,by,bz,bzh,ca,cab,cafe,cal,call,calvinklein,cam,camera,camp,cancerresearch,canon,capetown,capital,capitalone,car,caravan,cards,care,career,careers,cars,cartier,casa,case,caseih,cash,casino,cat,catering,catholic,cba,cbn,cbre,cbs,cc,cd,ceb,center,ceo,cern,cf,cfa,cfd,cg,ch,chanel,channel,chase,chat,cheap,chintai,chloe,christmas,chrome,chrysler,church,ci,cipriani,circle,cisco,citadel,citi,citic,city,cityeats,ck,cl,claims,cleaning,click,clinic,clinique,clothing,cloud,club,clubmed,cm,cn,co,coach,codes,coffee,college,cologne,com,comcast,commbank,community,company,compare,computer,comsec,condos,construction,consulting,contact,contractors,cooking,cookingchannel,cool,coop,corsica,country,coupon,coupons,courses,cr,credit,creditcard,creditunion,cricket,crown,crs,cruise,cruises,csc,cu,cuisinella,cv,cw,cx,cy,cymru,cyou,cz,dabur,dad,dance,data,date,dating,datsun,day,dclk,dds,de,deal,dealer,deals,degree,delivery,dell,deloitte,delta,democrat,dental,dentist,desi,design,dev,dhl,diamonds,diet,digital,direct,directory,discount,discover,dish,diy,dj,dk,dm,dnp,do,docs,doctor,dodge,dog,doha,domains,dot,download,drive,dtv,dubai,duck,dunlop,duns,dupont,durban,dvag,dvr,dz,earth,eat,ec,eco,edeka,edu,education,ee,eg,eh,email,emerck,energy,engineer,engineering,enterprises,epost,epson,equipment,er,ericsson,erni,es,esq,estate,esurance,et,eu,eurovision,eus,events,everbank,exchange,expert,exposed,express,extraspace,fage,fail,fairwinds,faith,family,fan,fans,farm,farmers,fashion,fast,fedex,feedback,ferrari,ferrero,fi,fiat,fidelity,fido,film,final,finance,financial,fire,firestone,firmdale,fish,fishing,fit,fitness,fj,fk,flickr,flights,flir,florist,flowers,fly,fm,fo,foo,food,foodnetwork,football,ford,forex,forsale,forum,foundation,fox,fr,free,fresenius,frl,frogans,frontdoor,frontier,ftr,fujitsu,fujixerox,fun,fund,furniture,futbol,fyi,ga,gal,gallery,gallo,gallup,game,games,gap,garden,gb,gbiz,gd,gdn,ge,gea,gent,genting,george,gf,gg,ggee,gh,gi,gift,gifts,gives,giving,gl,glade,glass,gle,global,globo,gm,gmail,gmbh,gmo,gmx,gn,godaddy,gold,goldpoint,golf,goo,goodhands,goodyear,goog,google,gop,got,gov,gp,gq,gr,grainger,graphics,gratis,green,gripe,group,gs,gt,gu,guardian,gucci,guge,guide,guitars,guru,gw,gy,hair,hamburg,hangout,haus,hbo,hdfc,hdfcbank,health,healthcare,help,helsinki,here,hermes,hgtv,hiphop,hisamitsu,hitachi,hiv,hk,hkt,hm,hn,hockey,holdings,holiday,homedepot,homegoods,homes,homesense,honda,honeywell,horse,hospital,host,hosting,hot,hoteles,hotmail,house,how,hr,hsbc,ht,htc,hu,hughes,hyatt,hyundai,ibm,icbc,ice,icu,id,ie,ieee,ifm,ikano,il,im,imamat,imdb,immo,immobilien,in,industries,infiniti,info,ing,ink,institute,insurance,insure,int,intel,international,intuit,investments,io,ipiranga,iq,ir,irish,is,iselect,ismaili,ist,istanbul,it,itau,itv,iveco,iwc,jaguar,java,jcb,jcp,je,jeep,jetzt,jewelry,jio,jlc,jll,jm,jmp,jnj,jo,jobs,joburg,jot,joy,jp,jpmorgan,jprs,juegos,juniper,kaufen,kddi,ke,kerryhotels,kerrylogistics,kerryproperties,kfh,kg,kh,ki,kia,kim,kinder,kindle,kitchen,kiwi,km,kn,koeln,komatsu,kosher,kp,kpmg,kpn,kr,krd,kred,kuokgroup,kw,ky,kyoto,kz,la,lacaixa,ladbrokes,lamborghini,lamer,lancaster,lancia,lancome,land,landrover,lanxess,lasalle,lat,latino,latrobe,law,lawyer,lb,lc,lds,lease,leclerc,lefrak,legal,lego,lexus,lgbt,li,liaison,lidl,life,lifeinsurance,lifestyle,lighting,like,lilly,limited,limo,lincoln,linde,link,lipsy,live,living,lixil,lk,loan,loans,local,locker,locus,loft,lol,london,lotte,lotto,love,lpl,lplfinancial,lr,ls,lt,ltd,ltda,lu,lundbeck,lupin,luxe,luxury,lv,ly,ma,macys,madrid,maif,maison,makeup,man,management,mango,market,marketing,markets,marriott,marshalls,maserati,mattel,mba,mc,mcd,mcdonalds,mckinsey,md,me,med,media,meet,melbourne,meme,memorial,men,menu,meo,metlife,mf,mg,mh,miami,microsoft,mil,mini,mint,mit,mitsubishi,mk,ml,mlb,mls,mm,mma,mn,mo,mobi,mobile,mobily,moda,moe,moi,mom,monash,money,monster,montblanc,mopar,mormon,mortgage,moscow,moto,motorcycles,mov,movie,movistar,mp,mq,mr,ms,msd,mt,mtn,mtpc,mtr,mu,museum,mutual,mv,mw,mx,my,mz,na,nab,nadex,nagoya,name,nationwide,natura,navy,nba,nc,ne,nec,net,netbank,netflix,network,neustar,new,newholland,news,next,nextdirect,nexus,nf,nfl,ng,ngo,nhk,ni,nico,nike,nikon,ninja,nissan,nissay,nl,no,nokia,northwesternmutual,norton,now,nowruz,nowtv,np,nr,nra,nrw,ntt,nu,nyc,nz,obi,observer,off,office,okinawa,olayan,olayangroup,oldnavy,ollo,om,omega,one,ong,onl,online,onyourside,ooo,open,oracle,orange,org,organic,orientexpress,origins,osaka,otsuka,ott,ovh,pa,page,pamperedchef,panasonic,panerai,paris,pars,partners,parts,party,passagens,pay,pccw,pe,pet,pf,pfizer,pg,ph,pharmacy,philips,phone,photo,photography,photos,physio,piaget,pics,pictet,pictures,pid,pin,ping,pink,pioneer,pizza,pk,pl,place,play,playstation,plumbing,plus,pm,pn,pnc,pohl,poker,politie,porn,post,pr,pramerica,praxi,press,prime,pro,prod,productions,prof,progressive,promo,properties,property,protection,pru,prudential,ps,pt,pub,pw,pwc,py,qa,qpon,quebec,quest,qvc,racing,radio,raid,re,read,realestate,realtor,realty,recipes,red,redstone,redumbrella,rehab,reise,reisen,reit,reliance,ren,rent,rentals,repair,report,republican,rest,restaurant,review,reviews,rexroth,rich,richardli,ricoh,rightathome,ril,rio,rip,rmit,ro,rocher,rocks,rodeo,rogers,room,rs,rsvp,ru,ruhr,run,rw,rwe,ryukyu,sa,saarland,safe,safety,sakura,sale,salon,samsclub,samsung,sandvik,sandvikcoromant,sanofi,sap,sapo,sarl,sas,save,saxo,sb,sbi,sbs,sc,sca,scb,schaeffler,schmidt,scholarships,school,schule,schwarz,science,scjohnson,scor,scot,sd,se,seat,secure,security,seek,select,sener,services,ses,seven,sew,sex,sexy,sfr,sg,sh,shangrila,sharp,shaw,shell,shia,shiksha,shoes,shop,shopping,shouji,show,showtime,shriram,si,silk,sina,singles,site,sj,sk,ski,skin,sky,skype,sl,sling,sm,smart,smile,sn,sncf,so,soccer,social,softbank,software,sohu,solar,solutions,song,sony,soy,space,spiegel,spot,spreadbetting,sr,srl,srt,ss,st,stada,staples,star,starhub,statebank,statefarm,statoil,stc,stcgroup,stockholm,storage,store,stream,studio,study,style,su,sucks,supplies,supply,support,surf,surgery,suzuki,sv,swatch,swiftcover,swiss,sx,sy,sydney,symantec,systems,sz,tab,taipei,talk,taobao,target,tatamotors,tatar,tattoo,tax,taxi,tc,tci,td,tdk,team,tech,technology,tel,telecity,telefonica,temasek,tennis,teva,tf,tg,th,thd,theater,theatre,tiaa,tickets,tienda,tiffany,tips,tires,tirol,tj,tjmaxx,tjx,tk,tkmaxx,tl,tm,tmall,tn,to,today,tokyo,tools,top,toray,toshiba,total,tours,town,toyota,toys,tp,tr,trade,trading,training,travel,travelchannel,travelers,travelersinsurance,trust,trv,tt,tube,tui,tunes,tushu,tv,tvs,tw,tz,ua,ubank,ubs,uconnect,ug,uk,um,unicom,university,uno,uol,ups,us,uy,uz,va,vacations,vana,vanguard,vc,ve,vegas,ventures,verisign,vermögensberater,vermögensberatung,versicherung,vet,vg,vi,viajes,video,vig,viking,villas,vin,vip,virgin,visa,vision,vista,vistaprint,viva,vivo,vlaanderen,vn,vodka,volkswagen,volvo,vote,voting,voto,voyage,vu,vuelos,wales,walmart,walter,wang,wanggou,warman,watch,watches,weather,weatherchannel,webcam,weber,website,wed,wedding,weibo,weir,wf,whoswho,wien,wiki,williamhill,win,windows,wine,winners,wme,wolterskluwer,woodside,work,works,world,wow,ws,wtc,wtf,xbox,xerox,xfinity,xihuan,xin,xperia,xxx,xyz,yachts,yahoo,yamaxun,yandex,ye,yodobashi,yoga,yokohama,you,youtube,yt,yu,yun,za,zappos,zara,zero,zip,zippo,zm,zone,zuerich,zw';
// not implemented on server: қаз,ελ,հայ,קום,ابوظبي,ارامكو,الاردن,الجزائر,السعودية,العليان,المغرب,اليمن,امارات,ایران,بارت,بازار,بيتك,بھارت,تونس,سودان,سورية,شبكة,عراق,عمان,فلسطين,قطر,كاثوليك,كوم,مصر,مليسيا,موبايلي,موقع,همراه,پاکستان,ڀارت,कॉम,नेट,भारत,भारतम्,भारोत,संगठन,বাংলা,ভারত,ভাৰত,ਭਾਰਤ,ભારત,ଭାରତ,இந்தியா,இலங்கை,சிங்கப்பூர்,భారత్,ಭಾರತ,ഭാരതം,ලංකා,คอม,ไทย,გე,みんな,クラウド,グーグル,コム,ストア,セール,ファッション,ポイント,世界,中信,中国,中國,中文网,企业,佛山,信息,健康,八卦,公司,公益,台湾,台灣,商城,商店,商标,嘉里,嘉里大酒店,在线,大众汽车,大拿,天主教,娱乐,家電,工行,广东,微博,慈善,我爱你,手机,手表,政务,政府,新加坡,新闻,时尚,書籍,机构,淡马锡,游戏,澳門,澳门,点看,珠宝,移动,组织机构,网址,网店,网站,网络,联通,诺基亚,谷歌,购物,通販,集团,電訊盈科,飞利浦,食品,餐厅,香格里拉,香港,닷넷,닷컴,삼성,한국
const IDN = 'бг,бел,дети,ею,католик,ком,мкд,мон,москва,онлайн,орг,рус,рф,сайт,срб,укр';
const PUNYCODED_IDN = 'qxam,90ae,90ais,d1acj3b,e1a4c,80aqecdr1a,j1aef,d1alf,l1acc,80adxhks,80asehdb,c1avg,p1acf,p1ai,80aswg,90a3ac,j1amh,80ao21a,y9a3aq,9dbq2a,mgbca7dzdo,mgba3a3ejt,mgbayh7gpa,lgbbat1ad8j,mgberp4a5d4ar,mgba7c0bbn0a,mgbc0a9azcg,mgb2ddes,mgbaam7a8h,mgba3a4f16a,mgbbh1a,mgbab2bd,ngbe9e0a,mgbbh1a71e,pgbs0dh,mgbpl2fh,ogbpf8fl,ngbc5azd,mgbtx2b,mgb9awbf,ygbi2ammx,wgbl6a,mgbi4ecexp,fhbei,wgbh1c,mgbx4cd0ab,mgbb9fbpob,4gbrim,mgbt3dhd,mgbai9azgqp6j,mgbgu82a,11b4c3d,c2br7g,h2brj9c,h2breg3eve,h2brj9c8c,i1b6b1a6a2e,54b7fta0cc,45brj9c,45br5cyl,s9brj9c,gecrj9c,3hcrj9c,xkc2dl3a5ee0h,xkc2al3hye2a,clchc0ea0b2g2a9gcd,fpcrj9c3d,2scrj9c,rvc1e0am3e,fzc2c9e2c,42c2d9a,o3cw4h,node,q9jyb4c,gckr3f0f,qcka1pmc,tckwe,cck2b3b,1ck2e1b,bck1b9a5dre4c,eckvdtc9d,rhqv96g,fiq64b,fiqs8s,fiqz9s,fiq228c5hs,vhquv,1qqw23a,vuq861b,nyqy26a,45q11c,55qx5d,55qw42g,kprw13d,kpry57d,czru2d,czrs0t,czr694b,w4rs40l,w4r85el8fhu5dnra,3ds443g,3oq18vl8pn36a,pssy2u,tiq49xqyj,fjq720a,fct429k,estv75g,xhq521b,9krt00a,30rr7y,6qq986b3xl,kput3i,kpu716f,zfr164b,mxtq1m,yfro4i67o,efvy88h,9et52u,rovu88b,nqv7f,b4w605ferd,unup4y,mix891f,mix082f,3pxu8k,pbt977c,6frz82g,nqv7fs00ema,ses554g,hxt814e,5tzm5g,io0a7i,8y0a063a,jlq61u9w7b,flw351e,g2xx48c,gk3at1e,3bst00m,fzys8d69uvgm,kcrx77d1x4a,jvr189m,imr513n,5su34j936bgsg,j6w193g,t60b56a,mk1bu44c,cg4bki,3e0b707e';
export const TOP_DOMAINS = new Set([
    ...ENGLISH_DOMAINS.split(','),
    ...IDN.split(','),
    ...PUNYCODED_IDN.split(',').map((s) => 'xn--' + s),
]);
export const MAX_DOMAIN_LENGTH = [...TOP_DOMAINS].reduce((acc, item) => Math.max(acc, item.length), 0);
const HASHTAG_CHARS = `${INTERNATIONAL_LETTERS}a-zA-Zа-яА-ЯёіјєїґўЁІЈЄЇҐЎ’`;
const HASHTAG_ENTITIES = '(?:&#(?:19[2-9]|(?:[2-9]|1[0-3])[0-9][0-9]);?)';
export const HASHTAG_STRING = `(?:[${HASHTAG_CHARS}]|${HASHTAG_ENTITIES})`;
export const HASHTAG_STRING_NUM = `(?:[${HASHTAG_CHARS}_\\d]|${HASHTAG_ENTITIES})`;
//# sourceMappingURL=TextChunk.js.map