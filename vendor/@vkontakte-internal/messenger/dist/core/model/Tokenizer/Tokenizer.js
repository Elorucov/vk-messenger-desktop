import { massMentionRegexElement } from './RegexMassMention';
import { aliasMentionRegexElement } from './RegexAliasMention';
import { squareBracketsRegexElement } from './RegexSquareBrackets';
import { lineBreakRegexElement } from './RegexLineBreak';
import { hashtagRegexElement } from './RegexHashtag';
import { makeTokensStrict, mergeTokens } from './misc';
import { urlRegexElement } from './RegexURL';
import { emojiRegexElement } from './RegexEmoji';
/**
 * Регулярки. Порядок строго фиксирован, @see Tokenizer.md
 */
const expressions = [
    urlRegexElement, // 1
    lineBreakRegexElement, // 2
    emojiRegexElement, // 3
    massMentionRegexElement, // 4
    aliasMentionRegexElement, // 5
    squareBracketsRegexElement, // 6
    hashtagRegexElement, // 7
];
/**
 * Регулярка текстового поиска
 */
const fullRegex = new RegExp(expressions
    .map((exp) => `(${[exp.startSymbolExpression, exp.expression].join('')})`)
    .join('|'), 'iu');
/**
 * Получение текста от начала строки до подобранного регекс элемента, включая его первый символ
 */
const getTextBeforeExpression = (rawText, leftOffset, match, withFirstSymbol) => {
    const matchIndex = leftOffset + (match.index ?? 0);
    /**
     * Конструктор в RegexElement подразумаевает, что в первой группе всегда будет описание первого символа в регексе: чаще всего это "^| "
     * Нам нужно учитывать этот параметр и его длину в заполнении промежутков между результатами матча
     */
    const fixedFirstIndex = withFirstSymbol
        ? matchIndex + 1 // потому что всегда 1 символ
        : matchIndex;
    const haveTextBetweenMatches = fixedFirstIndex - leftOffset > 0;
    if (!haveTextBetweenMatches) {
        return;
    }
    // Текст между текущим и предыдущим match
    return {
        kind: 'Text',
        text: rawText.slice(leftOffset, fixedFirstIndex),
    };
};
/**
 * Подбор регекс элемента под конкретный группу в match и получение результатов парсинга
 */
const matchExpression = (match) => {
    /**
     * Отслеживание скобок, чтобы регекс элемент получил только свою часть match'a
     * от общего массива. Для этого мы заранее посчитали сколько у него внутри скобок
     */
    let parenthesesCursor = 1;
    for (let index = 0; index < expressions.length; index++) {
        const expression = expressions[index];
        if (expression) {
            const expressionParentesesCount = expression.parenthesesCount + 1;
            const chunks = expression.generate(match.slice(parenthesesCursor, parenthesesCursor + expressionParentesesCount));
            if (chunks) {
                return {
                    chunks,
                    withFirstSymbol: Boolean(expression.startSymbolExpression && match[parenthesesCursor + 1]),
                };
            }
            parenthesesCursor += expressionParentesesCount;
        }
    }
};
/**
 * Основной алгоритм парсера
 * @see Tokenizer.md
 */
const tokenize = (rawText, mode = 'client') => {
    fullRegex.lastIndex = 0;
    let leftOffset = 0;
    let match;
    let raw = rawText;
    const chunks = [];
    while ((match = fullRegex.exec(raw))) {
        const lastSymbolIndex = (match.index ?? 0) + match[0].length;
        const expressionResult = matchExpression(match);
        const textBeforeChunk = getTextBeforeExpression(rawText, leftOffset, match, Boolean(expressionResult?.withFirstSymbol));
        if (textBeforeChunk) {
            chunks.push(textBeforeChunk);
        }
        if (expressionResult) {
            chunks.push(...expressionResult.chunks);
        }
        else {
            // Если не нашли парсер, то пушим всю строку
            chunks.push({
                kind: 'Text',
                text: match[0],
            });
        }
        raw = raw.substr(lastSymbolIndex);
        leftOffset += lastSymbolIndex;
    }
    if (raw) {
        /**
         * Если завершили ходить по строке, а строка не пустая, то закидываем её в конец в качестве текста
         */
        chunks.push({ kind: 'Text', text: raw });
    }
    return makeTokensStrict(mergeTokens(chunks), mode);
};
export function fromServerText(text) {
    return tokenize(text, 'serverSide');
}
export function fromTrustedServerText(text) {
    return tokenize(text, 'safe');
}
export function fromClientText(text) {
    return tokenize(text, 'client');
}
//# sourceMappingURL=Tokenizer.js.map