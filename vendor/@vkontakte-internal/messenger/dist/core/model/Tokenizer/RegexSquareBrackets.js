import * as Peer from '../../model/Peer';
import { bracketMentionRegexpStructure, getTrustedUrlToken, mentionStartStructure, } from './misc';
import { RegexElement } from './RegexElement';
import { urlRegexElement } from './RegexURL';
const urlStrictRegexp = new RegExp(`^${urlRegexElement.expression}$`, 'i');
/**
 * Серверный меншен и урл алиас
 * Парсим любой текст, заключенный в квадратный скобки вида [someThing|displayName]
 * Если на первом месте находится урл, то мы разрешаем только доверенные домены
 * Примеры: [id1|durov], [club400|community], [vk.com|VK]
 * У серверных меншенов запрещены любые структуры, кроме id и club
 * Исключения: разрешаем находится сразу после скобки
 */
export const squareBracketsRegexElement = new RegexElement(
// https://gitlab.mvk.com/vkcom/vkcom/-/blob/master/www/lib/wall.lib.php#L2853
bracketMentionRegexpStructure, `(^|${mentionStartStructure})`, (match) => {
    const [_fullGroup = '', _firstSymbol, text = '', maybePrefix = '', // id|club префикс
    displayName = '',] = match;
    if (!_fullGroup) {
        return;
    }
    const fullGroup = _fullGroup.startsWith('[')
        ? _fullGroup
        : _fullGroup.slice(1);
    if (maybePrefix) {
        const maybePeerId = text.slice(maybePrefix.length);
        // кастим с надеждой на регекс
        const type = maybePrefix;
        const id = Number(maybePeerId) || 0;
        let peerId;
        if (type === 'club') {
            peerId = Peer.resolveId(-id);
        }
        else {
            // @id0 является валидным упоминанием, которое ведет на страницу
            // того, кто нажал на это упоминание
            if (id === 0) {
                peerId = Peer.resolveId();
            }
            else {
                peerId = Peer.resolveId(id);
            }
        }
        return [
            {
                kind: 'Mention',
                type,
                peerId,
                displayName,
            },
        ];
    }
    const urlChunk = getTrustedUrlToken(text, displayName, fullGroup.trim());
    if (urlChunk) {
        return [urlChunk];
    }
    // В этом месте проверять может бы не сильно производительно, но не так уж часто сюда будем заходить
    urlStrictRegexp.lastIndex = 0;
    const urlMatch = urlStrictRegexp.exec(text);
    if (urlMatch) {
        const chunks = urlRegexElement.generate(urlMatch);
        if (chunks) {
            const urlIndex = fullGroup.indexOf(urlMatch[0]);
            return [
                {
                    kind: 'Text',
                    text: fullGroup.slice(0, urlIndex),
                },
                ...chunks,
                {
                    kind: 'Text',
                    text: fullGroup.slice(urlIndex + urlMatch[0].length),
                },
            ];
        }
    }
    return;
});
//# sourceMappingURL=RegexSquareBrackets.js.map