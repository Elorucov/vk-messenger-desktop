import { lineBreakStructure } from './misc';
import { RegexElement } from './RegexElement';
/**
 * Переносы строк. Могут выглядеть как br, так и юникод символ \n
 * Ищем любой символ
 */
export const lineBreakRegexElement = new RegexElement(lineBreakStructure, null, (match) => {
    const [fullGroup = ''] = match;
    if (!fullGroup) {
        return;
    }
    return [{ kind: 'LineBreak' }];
});
//# sourceMappingURL=RegexLineBreak.js.map