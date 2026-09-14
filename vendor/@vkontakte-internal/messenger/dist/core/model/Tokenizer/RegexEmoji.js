import emojiRegex from 'emoji-regex-xs';
import { RegexElement } from './RegexElement';
/**
 * Для единообразия эмоджи в ВК мы проверяем можем ли мы заменить его на спрайтовый аналог
 * Надеемся и верим, что регекс избавляет нас от необходимости фильтровать результат
 */
export const emojiRegexElement = new RegexElement(emojiRegex().source, null, (match) => {
    const [fullGroup] = match;
    if (!fullGroup) {
        return;
    }
    return [{ kind: 'Emoji', text: fullGroup }];
});
//# sourceMappingURL=RegexEmoji.js.map