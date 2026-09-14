import { mentionPrefixStructure } from './misc';
import { RegexElement } from './RegexElement';
/**
 * Поиск масс меншенов. У них странные правила вызова, поэтому нужно обрабатывать вообще все включения и отдельно
 * от алиас меншенов
 * @all, @everyone, @все, @online, @here, @здесь, @тут
 * Пример странных мешенов: #regorged@all , @all
 */
export const massMentionRegexElement = new RegexElement(
// https://gitlab.mvk.com/vkcom/vkcom/-/blob/master/www/VK/Messages/Services/Mentions.php#L63
// мы не можем заменить начало на ((?<=\\S)|^|\\s), потому что старые сафари это не поддерживают
`(?!,|;|:|\\.|\\s|<br ?\\/?>|"|\\(|\\)|\\[|\\]|!|\\?)((?:${mentionPrefixStructure})(?:all|everyone|все|online|here|здесь|тут))(?=$|,|;|:|\\.(?![a-z0-9_\\-])|\\s|<br ?\\/?>|"|\\(|\\)|\\[|\\]|!|\\?)`, '(^|\\s)?', // жесткий костыль, чтобы регулярка имела приоритет выше roundBracketsRegexElement
(match) => {
    const [fullGroup, _firstSymbol, displayName] = match;
    if (!fullGroup || !displayName) {
        return;
    }
    return [
        {
            kind: 'MassMention',
            displayName,
        },
    ];
});
//# sourceMappingURL=RegexMassMention.js.map