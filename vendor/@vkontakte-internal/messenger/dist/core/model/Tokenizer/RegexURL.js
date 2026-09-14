import { urlRegexStructure } from './misc';
import { RegexElement } from './RegexElement';
import { tlds } from './tlds';
/**
 * Пользователь может оборачивать текст в скобки, но скобки также являются валидными
 * символами в урле. Мы должны проверить их баланс
 */
const fixBrackets = (url) => {
    const openBracketsCount = (url.match(/\(/g) || []).length;
    let closeBracketsCount = (url.match(/\)/g) || []).length;
    // Удаляем лишние закрывающие скобки справа
    while (closeBracketsCount > openBracketsCount && url.endsWith(')')) {
        url = url.slice(0, -1);
        closeBracketsCount--;
    }
    // Проверка наличия лишних открывающих скобок слева (редкий случай, но теоретически возможен)
    if (openBracketsCount > closeBracketsCount) {
        const diff = openBracketsCount - closeBracketsCount;
        for (let i = 0; i < diff; i++) {
            url = url.replace(/^[(]/, ''); // удаляем одну левую скобку
        }
    }
    return url;
};
/**
 * Регекс элемент для парсинга урлов. Ищем в любом месте текста
 * Парсим: урлы, имейлы, ipv4 адреса
 * Не парсим: localhost и урлы с невалидным TLD
 *
 * Дополнительно: нам важно, чтобы пользователи могли ставить точки в конце выражений и парсер их не захватывал.
 * То же относится и к урлам в скобках
 */
export const urlRegexElement = new RegexElement(urlRegexStructure, null, (match) => {
    const [fullGroup = '', protocolPart = '', emailPrePart = '', _hostnamePart, _preTldPart, tldPart = '',] = match;
    if (!fullGroup) {
        return;
    }
    const trimmed = fullGroup.trim();
    if (emailPrePart) {
        return [
            {
                kind: 'Email',
                email: trimmed,
            },
        ];
    }
    /**
     * Далее можем оказаться только если есть top level domain, либо это айпи адрес
     */
    if (tldPart && tlds.indexOf(tldPart.toLowerCase()) < 0) {
        return;
    }
    // для айпи не выставляем https
    const forceSecure = Boolean(tldPart) && !protocolPart;
    // const fixedUrl = trimmed
    const fixedUrl = fixBrackets(trimmed);
    const prependText = [];
    const appendText = [];
    if (trimmed !== fixedUrl) {
        // удаленные скобки поместим как обычный текст
        const startIndex = trimmed.indexOf(fixedUrl);
        const endIndex = startIndex + fixedUrl.length;
        if (startIndex > 0) {
            // если они были до
            prependText.push({ kind: 'Text', text: trimmed.slice(0, startIndex) });
        }
        if (endIndex < trimmed.length) {
            // если они были после
            appendText.push({
                kind: 'Text',
                text: trimmed.slice(startIndex + fixedUrl.length),
            });
        }
    }
    return [
        ...prependText,
        {
            kind: 'Url',
            href: forceSecure ? 'https://' + fixedUrl : fixedUrl,
            caption: fixedUrl,
            text: fixedUrl,
        },
        ...appendText,
    ];
});
//# sourceMappingURL=RegexURL.js.map