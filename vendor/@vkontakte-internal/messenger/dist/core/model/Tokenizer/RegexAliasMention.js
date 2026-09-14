import { brakeReplacement, displayNameRegexpStructure, mentionPrefixStructure, mentionStartStructure, shortNameRegexpStructure, } from './misc';
import { RegexElement } from './RegexElement';
/**
 * Алиас меншены. Живут только на клиентах и нужны, чтобы показывать контент прежде чем придет ответ с бэка
 * Строится по структуре [*|@](validShortName) (displayName)?
 * Примеры @durov, @id1, @club400 и их варианты с displayName: @durov (Durov), @id1 (Durov), @club400 (Community)
 */
export const aliasMentionRegexElement = new RegexElement(
// https://gitlab.mvk.com/vkcom/vkcom/-/blob/master/www/lib/wall.lib.php#L2801
`(${mentionPrefixStructure})(${shortNameRegexpStructure}${brakeReplacement})(?:${displayNameRegexpStructure})?`, `(^|${mentionStartStructure})`, (match) => {
    const [fullGroup = '', _firstSymbol, prefix = '', screenName = '', displayName = '',] = match;
    if (!fullGroup.length) {
        return;
    }
    return [
        {
            kind: 'ScreenNameMention',
            screenName,
            displayName: displayName || prefix + screenName,
        },
    ];
});
//# sourceMappingURL=RegexAliasMention.js.map