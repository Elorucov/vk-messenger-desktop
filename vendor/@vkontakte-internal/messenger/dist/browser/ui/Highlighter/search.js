import { getWordsVariants } from '../../../core/utils/search';
import { dictionaryLatinConvert } from '../../../core/model/Translator';
import { escapeRegex } from '../../../core/utils/misc';
/**
 * для поиска используем расстояние Левенштейна
 * @param word1 - ключевое слово поиска
 * @param word2 - слово из текста, по которому идёт поиск
 */
export const getLevensteinDistance = (word1, word2) => {
    const levensteinWord1 = ' ' + word1.toLowerCase(); // для того, чтобы матрица расстояний Левенштейна начиналась (верхний левый угол) с 0, добавляем к словам по пробелу
    const levensteinWord2 = ' ' + word2.toLowerCase();
    // стоимости исправлений
    const costChange = 1;
    // матрица расстояний Левенштейна (пока она пуста)
    const matrix = [];
    for (let k = 0; k < levensteinWord1.length; k++) {
        matrix.push([]);
    }
    // заполняем матрицу расстояниями
    for (let i = 0; i < levensteinWord1.length; i++) {
        for (let j = 0; j < levensteinWord2.length; j++) {
            if (i * j === 0) {
                const row = matrix[i];
                if (row) {
                    row[j] = i + j;
                }
            }
            else {
                if (levensteinWord1[i] === levensteinWord2[j]) {
                    const row = matrix[i];
                    const prevRow = matrix[i - 1];
                    if (row && prevRow && typeof prevRow[j - 1] === 'number') {
                        row[j] = prevRow[j - 1] || 0;
                    }
                }
                else {
                    const row = matrix[i];
                    const prevRow = matrix[i - 1];
                    if (row && prevRow) {
                        row[j] =
                            costChange +
                                Math.min(prevRow[j] || 0, row[j - 1] || 0, prevRow[j - 1] || 0);
                    }
                }
            }
        }
    }
    const lastRow = matrix[levensteinWord1.length - 1];
    // если вдруг, по какой-то немыслимой причине мы вывалились за пределы матрицы - возвращаем максимальную дистанцию Левенштейна
    // это гипотетически, практически такой случай исключён
    if (!lastRow)
        return Number.MIN_SAFE_INTEGER;
    const lastMatrixElement = lastRow[levensteinWord2.length - 1];
    // такой же самый гипотетический случай
    return typeof lastMatrixElement === 'number'
        ? lastMatrixElement
        : Number.MIN_SAFE_INTEGER;
};
const getSearchResult = (searchMap) => {
    const { string, searchEntries } = searchMap;
    let unprocessedString = string;
    const acc = [];
    const result = searchEntries.reduceRight((acc, entry) => {
        const { offset, match } = entry;
        const plainTextSubstring = {
            type: 'plain_text',
            text: unprocessedString.slice(offset + match.length, unprocessedString.length),
        };
        const searchMatchSubstring = {
            type: 'search_match',
            text: match,
        };
        unprocessedString = unprocessedString.slice(0, offset);
        acc.unshift(searchMatchSubstring, plainTextSubstring);
        return acc;
    }, acc);
    // так как мы собираем сообщение справа на лево, мы должны убедиться что крайняя левая подстрока не пропала (так как перед ней может не быть выделенного текста)
    if (unprocessedString) {
        const endOfString = {
            type: 'plain_text',
            text: unprocessedString,
        };
        result.unshift(endOfString);
    }
    return result;
};
const PUNCTUATION_MARKS = [
    '\u002E',
    '\u0964',
    '\u0589',
    '\u3002',
    '\u06D4',
    '\u2CF9',
    '\u0701',
    '\u1362',
    '\u166E',
    '\u1803',
    '\u2CFE',
    '\uA4FF',
    '\uA60E',
    '\uA6F3',
    '\u083D',
    '\u1B5F',
    '\u002C',
    '\u060C',
    '\u3001',
    '\u055D',
    '\u07F8',
    '\u1363',
    '\u1808',
    '\uA4FE',
    '\uA60D',
    '\uA6F5',
    '\u1B5E',
    '\u2047',
    '\u2049',
    '\u2048',
    '\u203D',
    '\u2757',
    '\u203C',
    '\u2E18',
    '\u003F',
    '\u037E',
    '\u00BF',
    '\u061F',
    '\u055E',
    '\u0706',
    '\u1367',
    '\u2CFA',
    '\u2CFB',
    '\uA60F',
    '\uA6F7',
    '\u1114',
    '\uAAF1',
    '\u0021',
    '\u00A1',
    '\u07F9',
    '\u1944',
    '\u00B7',
    '\u1039',
    '\u103D',
    '\u1247',
    '\u1361',
    '\u1680',
    '\u1091',
    '\u0830',
    '\u2014',
    '\u2013',
    '\u2012',
    '\u2010',
    '\u2043',
    '\uFE63',
    '\uFF0D',
    '\u058A',
    '\u1806',
    '\u003B',
    '\u0387',
    '\u061B',
    '\u1364',
    '\uA6F6',
    '\u2024',
    '\u003A',
    '\u1365',
    '\uA6F4',
    '\u1B5D',
    '\u2026',
    '\uFE19',
    '\u0EAF',
    '\u00AB',
    '\u2039',
    '\u00BB',
    '\u203A',
    '\u201E',
    '\u201A',
    '\u201C',
    '\u201F',
    '\u2018',
    '\u201B',
    '\u201D',
    '\u2019',
    '\u0022',
];
const ANY_WORD_REGEXP = new RegExp(`[^(${PUNCTUATION_MARKS.join('')}\\s)]+`, 'g'); // выбираем из сообщения отдельные слова исключая пробельные знаки и знаки препинания
const splitSearchStringOntoSearchWords = (searchString) => searchString.match(ANY_WORD_REGEXP) || [];
export const applyFuzzySearch = (string, subString) => {
    const maxLettersDiff = subString.length > 4 ? 3 : 2; // максимально допустимое расхождение в буквах (подбирается эмпирически)
    const maxPercentDiff = subString.length > 4 ? 0.25 : 0.35; // максимально допустимое расхождение в процентном выражении (подбирается эмпирически)
    const searchMap = { string, searchEntries: [] }; // структурка содержащая исходную строку и вхождения результатов поиска
    const searchWords = splitSearchStringOntoSearchWords(subString); // делим поисковый запрос на ключевые слова
    // проходим по строке сообщения и фиксируем вхождения результатов поиска
    string.replace(ANY_WORD_REGEXP, (word, ...args) => {
        const offset = args[args.length - 2];
        // каждое слово в сообщении проверяем на совпадение с ключевыми словами из поискового запроса
        for (const searchWord of searchWords) {
            const searchWordLength = searchWord.length;
            const wordLength = word.length;
            const lettersDiff = Math.abs(searchWordLength - wordLength);
            const lettersPercentDiff = Math.max(lettersDiff / searchWordLength, lettersDiff / wordLength);
            // если кол-во букв (diff) в двух сравниваемых словах сильно отличается, то метод Левенштейна вернёт результат >= diff
            // этот случай мы можем предупредить
            if (lettersDiff > maxLettersDiff || lettersPercentDiff > maxPercentDiff) {
                continue;
            }
            const levensteinDistance = getLevensteinDistance(searchWord, word);
            const levensteinDistancePercentDiff = Math.max(levensteinDistance / searchWordLength, levensteinDistance / wordLength);
            if (levensteinDistance <= maxLettersDiff &&
                levensteinDistancePercentDiff <= maxPercentDiff) {
                // если найдено совпадение то фиксируем этот факт в searchMap
                searchMap.searchEntries.push({ offset, match: word });
                // если слово из сообщения совпало с ключевым словом из поиска, то остальные ключевые слова с ним уже не сравниваем
                break;
            }
        }
        return word; // возвращаем слово из сообщения назад в сообщение
    });
    return getSearchResult(searchMap);
};
export const isMatchFound = (result) => result.some((token) => token.type === 'search_match');
export const getMatchesCount = (result) => result.filter((token) => token.type === 'search_match').length;
export const applyPreviewMode = (searchResult, offsetLeft = 5, offsetRight = 5) => {
    const ELLIPSIS = '…';
    return searchResult.map((token, i, arr) => {
        const { type, text } = token;
        if (type !== 'plain_text') {
            return token;
        }
        const isFirstToken = i === 0;
        if (isFirstToken) {
            const ellipsedText = text.length > offsetLeft
                ? ELLIPSIS + text.slice(-offsetLeft).trimLeft()
                : text;
            return { ...token, text: ellipsedText };
        }
        const isLastToken = i === arr.length - 1;
        if (isLastToken) {
            const ellipsedText = text.length > offsetRight
                ? text.slice(0, offsetRight).trimRight() + ELLIPSIS
                : text;
            return { ...token, text: ellipsedText };
        }
        const ellipsedText = text.length > offsetLeft + offsetRight
            ? text.slice(0, offsetLeft).trimRight() +
                ELLIPSIS +
                text.slice(-offsetRight).trimLeft()
            : text;
        return { ...token, text: ellipsedText };
    });
};
export function doExactSearch({ content, search, }) {
    const escapedSearch = escapeRegex(search);
    const pattern = new RegExp(`(${escapedSearch})`, 'ig');
    const chunks = content.split(pattern);
    return chunks.reduce((acc, chunk) => {
        const isMatch = chunk.toLowerCase() === search.toLowerCase();
        acc.push({
            type: isMatch ? 'search_match' : 'plain_text',
            text: chunk,
        });
        return acc;
    }, []);
}
export function doVariativeSearch({ content, search, withLocalCase, }) {
    const variants = [
        ...getWordsVariants([search], withLocalCase),
        dictionaryLatinConvert({ value: search }),
    ];
    for (let index = 0; index < variants.length; index += 1) {
        const word = variants[index];
        if (!word) {
            // Исключительный сценарий
            continue;
        }
        const matches = doExactSearch({ content, search: word });
        if (!isMatchFound(matches)) {
            continue;
        }
        return matches;
    }
    // Если ничего не найдено, возвращаем исходную строку
    return [
        {
            type: 'plain_text',
            text: content,
        },
    ];
}
export const applyCombinedFuzzyAndExactSearch = (string, subString) => {
    // сначала применяем fuzzy поиск
    let fuzzySearchResult = applyFuzzySearch(string, subString);
    const searchWords = splitSearchStringOntoSearchWords(subString);
    searchWords.forEach((search) => {
        fuzzySearchResult = fuzzySearchResult
            .map((searchResult) => {
            // всё что не попало под fuzzy поиск прогоняем через регулярку
            if (searchResult.type === 'plain_text') {
                return doExactSearch({ content: searchResult.text, search });
            }
            return searchResult;
        })
            .flat();
    });
    return fuzzySearchResult;
};
//# sourceMappingURL=search.js.map