import { hashTagStrucutre } from './misc';
import { RegexElement } from './RegexElement';
/**
 * Парсим хештеги для сообщества
 * Пример: #reforged
 * HashtagMention не парсим, он появится самостоятельно при появлении подряд
 * HashTag + ScreenNameMention, например, #reforged@durov
 */
export const hashtagRegexElement = new RegexElement(hashTagStrucutre, null, (match) => {
    const [fullGroup = '', tag = ''] = match;
    if (!fullGroup) {
        return;
    }
    return [{ kind: 'Hashtag', tag }];
});
//# sourceMappingURL=RegexHashtag.js.map