import { getFirstMention, getFormatItemsValidated } from './common';
/**
 * Возвращаем для кусочка чанка подготовленную для отрисовки formatData
 * @param text rawText чанка
 * @param prevChunksLength offset чанка относительно начала всего сообщения
 * @param formatData полный массив форматов для всего сообщения
 */
export function getFormatsForChunk(text, prevChunksLength, formatData) {
    const { items, length } = __findFormatsForText(text, prevChunksLength, formatData);
    const nodes = __convertFormatsIntoTree(text, [...items].sort(__sortFormats), prevChunksLength);
    return {
        nodes,
        length,
    };
}
/**
 * Облегчённый вариант поиска форматов для меншенов (ScreenNameMention, Mention)
 * Т.к. меншен = 1 символ, то мы проверяем только наличие оффсета меншена где-нибудь
 * в format_data и возвращаем продготовленный TextWithFormat.
 * Помимо более простой логики эта функция существует отдельно потому, что чанки
 * с kind=Mention разобраны по частям, то есть при рендере мы имеем displayName,
 * а в getFormatsForChunk(), использующейся для текстовых чанков, мы ищем меншены
 * по регуляркам (см. getFirstMention()), и, соответственно, только лишь на displayName
 * не отреагируем, и не верно расставим форматы.
 * Поэтому нам бы пришлось склеивать чанк меншена обратно в скобочный вид, чтобы
 * getFormatsForChunk() узнала в нём меншен, а потом ещё как-то вычленять
 * displayName из отрисовки.
 * @param text текст (скорее displayName распаршенного текста)
 * @param offset оффсет, который мы хотим проверить на наличие формата
 * @param formatData полный массив форматов для всего сообщения
 */
export function getFormatsForOffset(text, offset, formatData) {
    const filteredFormats = getFormatItemsValidated(formatData).filter((format) => format.offset <= offset && format.offset + format.length > offset);
    if (filteredFormats.length) {
        const node = filteredFormats.reduce((res, format) => {
            return {
                text,
                type: format.type,
                ...(res !== null ? { children: [res] } : {}),
            };
        }, null);
        if (node) {
            return [node];
        }
    }
    return [
        {
            type: null,
            text,
        },
    ];
}
/**
 * Левые форматы ставим в конец массива.
 * Обратная сортировка выбрана потому, что в алгоритме мы будем поэтапно
 * вырезать значения форматов из массива. Оптимальнее это делать с конца,
 * чтобы массив не переиндексировался.
 */
function __sortFormats(a, b) {
    if (a.offset === b.offset) {
        return a.length - b.length;
    }
    return b.offset - a.offset;
}
/**
 * Считаем кол-во символов меншенов, которые попадают в заданные индексы строки.
 * На offset не опираемся, считаем относительно начала строки text
 */
function __calcMentionsLength(mentions, startIndex, endIndex) {
    return mentions.reduce((res, mention) => {
        if (startIndex <= mention.start && mention.start < endIndex) {
            return (res += mention.length - 1);
        }
        return res;
    }, 0);
}
/**
 * Находим все куски форматирования, которые должны быть применены к передаваемому
 * тексту.
 * Так же проверяем этот текст на наличие псевдоменшенов. Если нужно, то отобранные
 * отрезки форматов подгоняем по offset/length с учётом этих меншенов.
 * Если поехали стили, то ошибка тут.
 * @param text rawText чанка
 * @param offset offset чанка относительно начала всего сообщения
 * @param formatData полный массив форматов для всего сообщения
 */
function __findFormatsForText(text, offset, formatData) {
    if (!formatData.length) {
        return { items: [], length: text.length };
    }
    const formatDataForChunk = [];
    let textWithoutMentions = text;
    const mentions = [];
    let matches = getFirstMention(textWithoutMentions);
    while (matches && matches?.index !== undefined) {
        mentions.push({
            start: matches.index,
            end: matches.index + matches[0].length,
            length: matches[0].length,
        });
        textWithoutMentions = textWithoutMentions.replace(matches[0], '1');
        matches = getFirstMention(textWithoutMentions);
    }
    for (let i = 0; i < formatData.length; i++) {
        const format = formatData[i];
        if (!format) {
            continue;
        }
        const currentOffset = format.offset - offset;
        const formatEndIndex = format.offset + format.length;
        const textWithoutMentionsEndIndex = offset + textWithoutMentions.length;
        /**
         * Вся строка - Hello #web man
         * Наш чанк - kind: Hashtag, text: #web
         * Хотим выцепить все форматы, которые заезают на #web
         */
        if (format.offset < offset) {
            // Формат до текущего чанка
            if (formatEndIndex < offset) {
                /**
                 * {Hello} #web man -> null
                 */
                continue;
            }
            // Формата начался до, но закончился в нашем чанке.
            // Сдвигаем индексы формата и забираем только ту часть, которая точно
            // ложится на наш отрезок текста
            if (formatEndIndex > offset &&
                formatEndIndex <= textWithoutMentionsEndIndex) {
                /**
                 * {Hello #w}eb man -> {#w}
                 */
                const mentionsLength = __calcMentionsLength(mentions, currentOffset, currentOffset + format.length);
                const formatLength = format.length - (offset - format.offset) + mentionsLength;
                formatDataForChunk.push({
                    ...format,
                    offset,
                    length: formatLength,
                });
            }
            else if (formatEndIndex > textWithoutMentionsEndIndex) {
                /**
                 * {Hello #web man} -> {#web}
                 */
                formatDataForChunk.push({
                    ...format,
                    offset,
                    length: text.length,
                });
            }
        }
        else if (format.offset >= offset &&
            format.offset < textWithoutMentionsEndIndex) {
            // Если есть меншены до нашего формата, запомним сдвиг потому, что в format_data
            // меншен = 1 символ, а нам нужно их развернуть до настоящей длины текста
            const mentionOffset = __calcMentionsLength(mentions, 0, currentOffset);
            // Формат начался и закончился в нашем чанке
            /**
             * Hello #{we}b man -> {we}
             */
            if (formatEndIndex <= textWithoutMentionsEndIndex) {
                // Меншены внутри нашей строки текста прибавятся к length формата,
                // т.к. изначально в формате меншен = 1 символ
                const mentionsLength = __calcMentionsLength(mentions, currentOffset + mentionOffset, currentOffset + format.length + mentionOffset);
                formatDataForChunk.push({
                    ...format,
                    offset: format.offset + mentionOffset,
                    length: format.length + mentionsLength,
                });
            }
            else {
                /**
                 * Hello #w{eb man} -> {eb}
                 */
                // Формат начался в нашем чанке, а закончился за его пределами.
                // Сдвигаем индексы формата и забираем только ту часть, которая точно
                // ложится на наш отрезок текста
                const formatLength = textWithoutMentionsEndIndex - format.offset + mentionOffset;
                formatDataForChunk.push({
                    ...format,
                    offset: format.offset + mentionOffset,
                    length: formatLength,
                });
            }
        }
    }
    return {
        items: formatDataForChunk,
        length: textWithoutMentions.length,
    };
}
/**
 * Перестраиваем массив форматов в древовидную структуру, чтобы потом рекурсивно
 * отрисовать вложенные друг в друга форматы.
 * Алгоритм опирается на то, что передаваемые formats отсортированы функцией
 * __sortFormats и точно попадают в индексы текста.
 * Если поехал текст, то ошибка тут.
 * @param substring подстрока текста чанка
 * @param formats массив форматов только нашей подстроки
 * @param offset offset текста относительно начала всего сообщения
 */
function __convertFormatsIntoTree(substring, formats, offset = 0) {
    const res = [];
    let currentIndex = 0;
    while (formats.length) {
        const format = formats.pop();
        if (!format) {
            continue;
        }
        const currentOffset = format.offset - offset;
        if (currentOffset > currentIndex) {
            const text = substring.substring(currentIndex, currentOffset);
            res.push({
                type: null,
                text: text,
            });
            currentIndex += text.length;
        }
        const currentText = substring.substring(currentOffset, currentOffset + format.length);
        const childFormats = [];
        // Делаем из плоской структуры дерево
        for (let i = formats.length - 1; i >= 0; i--) {
            const siblingFormat = formats[i];
            if (!siblingFormat) {
                continue;
            }
            if (siblingFormat.offset >= format.offset &&
                siblingFormat.offset + siblingFormat.length <=
                    format.offset + format.length) {
                // Берём следующий формат. Если он полностью помещается в текущий, т.е.
                // является дочерним, то вырезаем его из массива и закидываем в children
                formats.pop();
                childFormats.push(siblingFormat);
            }
            else if (siblingFormat.offset > format.offset &&
                siblingFormat.offset < format.offset + format.length &&
                format.offset + format.length <
                    siblingFormat.offset + siblingFormat.length) {
                // Если следующий формат начинается в нашем, но выходит за его границы,
                // то мы разбиваем его на два - один будет дочерним для текущего формата,
                // второй будет с ним на одном уровне
                const intersectionIndex = format.offset + format.length;
                childFormats.push({
                    ...siblingFormat,
                    length: intersectionIndex - siblingFormat.offset,
                });
                formats[i] = {
                    ...siblingFormat,
                    offset: intersectionIndex,
                    length: siblingFormat.offset + siblingFormat.length - intersectionIndex,
                };
            }
        }
        // Если мы что-то закинули в children, то мы и текущий массив поменяли.
        // Обязательно надо следить за сортировкой - на это опирается алгоритм
        if (childFormats.length) {
            childFormats.sort(__sortFormats);
            formats.sort(__sortFormats);
        }
        const children = childFormats.length
            ? __convertFormatsIntoTree(currentText, childFormats, currentIndex + offset)
            : undefined;
        res.push({
            type: format.type,
            text: currentText,
            ...(format.url && { url: format.url }),
            ...(children && { children }),
        });
        currentIndex += format.length;
    }
    if (currentIndex < substring.length) {
        res.push({
            type: null,
            text: substring.substring(currentIndex),
        });
    }
    return res;
}
//# sourceMappingURL=display.js.map