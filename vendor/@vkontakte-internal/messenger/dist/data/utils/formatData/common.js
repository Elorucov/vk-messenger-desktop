import * as Message from '../../../core/model/Message';
import emojiRegex from 'emoji-regex-xs';
import { nanoid } from 'nanoid';
/**
 * Функция для отбрасывания невалидных объектов стилей
 * */
export function getFormatItemsValidated(formats) {
    return formats.filter((format) => format.offset >= 0 && format.length > 0);
}
/**
 * Функция возвращает самый левый меншен в тексте сообщения
 */
export function getFirstMention(text) {
    /** test cases
     * [id260337194|seokky]
     * [id260337194|@seokky]
     * [id260337194|*seokky]
     * [id260337194|*seokky (test)]
     * @seokky (test)
     * @seokky ([id260337194|seokky])
     * @seokky ([id260337194|@seokky])
     * @seokky
     * *seokky
     */
    return ([
        text.match(SQUARE_BRACKETS_MENTION_REGEX),
        text.match(ROUND_BRACKETS_MENTION_REGEX),
        text.match(SHORT_MENTION_REGEX),
    ]
        .filter((m) => !!m)
        .sort((a, b) => (a.index || 0) - (b.index || 0))[0] || null);
}
/**
 * Генерирует хеши, соответствующие каждому тегу оформления
 * Подробнее см. комментарий в build.ts/__buildDirtyFormatData()
 */
export function getFormattingTagsHashes() {
    const hashesCount = 11;
    const hashes = new Array(hashesCount).fill(null);
    function generateTagHash(existingTags) {
        const hash = nanoid(15);
        return existingTags.includes(hash) ? generateTagHash(existingTags) : hash;
    }
    for (let i = 0; i < hashesCount; i += 1) {
        hashes[i] = generateTagHash(hashes);
    }
    return {
        [Message.FormatKind.BOLD]: {
            opening: hashes[0],
            closing: hashes[1],
        },
        [Message.FormatKind.ITALIC]: {
            opening: hashes[2],
            closing: hashes[3],
        },
        [Message.FormatKind.UNDERLINE]: {
            opening: hashes[4],
            closing: hashes[5],
        },
        [Message.FormatKind.URL]: {
            opening: hashes[6],
            closing: hashes[7],
            bracket: hashes[8],
        },
        emoji: {
            opening: hashes[9],
            closing: hashes[10],
        },
    };
}
export function addCommaAndSpace(str, trim = false) {
    // Если строка не начинается с ", " (запятая и пробел)
    if (!/^, /.test(str)) {
        // Если начинается только с запятой, добавляем пробел
        if (/^,/.test(str)) {
            return str.replace(/^,/, ', ');
        }
        // Если не начинается ни с запятой, ни с пробела, добавляем ", "
        return ', ' + str;
    }
    // Если параметр trim активирован, убираем лишние пробелы между запятой и текстом
    if (trim) {
        return str.replace(/^, +/, ', ');
    }
    return str; // Если строка уже начинается с ", ", возвращаем без изменений
}
// [id260337194|seokky]
export const SQUARE_BRACKETS_MENTION_REGEX = /\B\[((id|club|event|public)\d+|[A-Za-z0-9_.]{2,32})\|[^\]\n<]+\]/;
// @seokky (test)
export const ROUND_BRACKETS_MENTION_REGEX = (() => {
    // Safari до 16.4 не поддерживает lookbehind ?<= https://jira.mvk.com/browse/ME-69936
    try {
        return new RegExp(`\\B(?<=^|[\\s.,:'"«»;>)([\\]])(\\*|@)([A-Za-z0-9_.]{2,32})\\s*\\((.+?)\\)`);
    }
    catch {
        return /\B[@*](((id|club|event|public)\d+)|[a-z_\-\d]+)\s*\(.+\)/;
    }
})();
// @seokky, *seokky
export const SHORT_MENTION_REGEX = (() => {
    // Safari до 16.4 не поддерживает lookbehind ?<= https://jira.mvk.com/browse/ME-69936
    try {
        return new RegExp(`\\B(?<=^|[\\s.,:'"«»;>)([\\]])(\\*|@)([A-Za-z0-9_.]{2,32})(?=$|[\\s.,:'"«»&;?<)(])`);
    }
    catch {
        return /\B[@*](((id|club|event|public)\d+)|[a-z_\-\d]+)/;
    }
})();
export const EMOJI_REGEX_GLOBAL = new RegExp(emojiRegex(), 'ug');
//# sourceMappingURL=common.js.map