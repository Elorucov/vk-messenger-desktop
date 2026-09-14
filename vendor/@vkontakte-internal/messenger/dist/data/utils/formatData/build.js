import * as Message from '../../../core/model/Message';
import { EMOJI_REGEX_GLOBAL, getFormatItemsValidated, getFirstMention, getFormattingTagsHashes, } from './common';
import { cloneDeep } from '../../../core/utils/misc';
import { unescape } from '@vkontakte/vkjs';
/**
 * Этот символ не занимает места, но он требует дополнительного нажатия backspace
 * для удаления строки или arrow-клавиши для перехода.
 */
const ZWJ = '\u2060';
/**
 * ПОСТРОЕНИЕ FORMAT_DATA ПЕРЕД ОТПРАВКОЙ СООБЩЕНИЯ
 *
 * Изначально вводные такие: в поле вводе (композере) пользователь вводит какой-то текст,
 * свое будущее сообщение. Затем, выделив часть текста, он применяет к ней какие-то форматы,
 * пользуясь соответствующей всплывающей менюшкой (см. ComposerFormattingMenu.tsx, useComposerFormatting.ts).
 *
 * С нашей стороны применение этих форматов реализовано через браузерное АПИ document.execCommand().
 * Да, метод депрекейтнутый, но альтернатив ему нет. Он же используется и в вебе телеги.
 * Суть работы document.execCommand заключается в том, что браузер обрамляет выделенный юзером текст
 * в html-теги, соответствующие выбранному стилю (жирный, курсив, подчеркнутый и тд). То есть он сразу
 * мутирует DOM и мы видим действительно жирный, курсивный, подчеркнутый (и тд) текст.
 *
 * Но на сервер при отправке сообщения мы отправляем чистый текст, а не html-представление из поля ввода,
 * то есть эти html-теги теряются. Поэтому придумана схема, согласно которой мы находим все эти html-теги
 * в html-представлении сообщения, запоминаем их позиции и на основе этих данных строим объект
 * format_data (см. Message.FormatData), который содержит позиции и длины выбранных пользователем стилей.
 *
 * Код в этом файле реализует логику по построению объекта format_data перед отправкой сообщения.
 * */
/**
 *
 * Функция для построения объекта FormatData из html-представления сообщения
 * Нужна для формирования объекта с позициями стилей перед отправкой сообщения
 */
export const buildMessageFormatData = (html) => {
    const stringToParse = __prepareMessageHtmlForParsing(html);
    const dirty = __buildDirtyFormatData(stringToParse);
    const formatData = __shiftFormatDataForMentions(dirty.stringToParse, cloneDeep(dirty.formatData));
    const validatedFormatData = {
        ...formatData,
        items: getFormatItemsValidated(formatData.items),
    };
    /**
     * Если items пуст, значит нет никакого форматирования. При редактировании сообщения проверка на "действительно в сообщении что-то изменилось и нужно послать запрос по сети"
     * будет ложноположительной если бэк отдаёт информацию что нет форматирования (undefined), а мы сетим значение [пустой массив],
     * что по сути тоже означает, что нет форматирования. Но это уже примитив vs массив - совсем разные вещи.
     */
    return validatedFormatData.items.length ? validatedFormatData : undefined;
};
/**
 * Функция подготавливает html-представление сообщения для дальнейшего парсинга с целью построения formatData
 *  */
function __prepareMessageHtmlForParsing(html) {
    /**
     * При отправке сообщения в triggerMessageSend() мы дёргаем sanitizeText(),
     * где вызывается trim(). Отсюда возникает проблема, что если пользователь
     * ввёл `<b>  Hello  </b> user!`, то мы сначала здесь выпишем оффсеты формат даты,
     * а потом бахнем trim() в ConvoComposer, и всё поедет. Поэтому здесь мы
     * пытаемся заранее обрезать пробелы в начале и конце строки в обход тегов форматирования.
     * То есть ` <b>  Hello  </b> ` превратим в `<b>Hello</b>`
     *
     * Так же заменяем все эмодзи на любой символ, чтобы они не корраптили длину (каждый эмодзи имеет разную длину)
     * и вырезаем пустые атрибуты стилей, иногда появляющиеся при пересечении стилей
     */
    return html
        .trim()
        .replace(/^(<b>|<u>|<i>)\s+/, (_str, match) => match)
        .replace(/\s+(<\/b>|<\/u>|<\/i>)$/, (_str, match) => match)
        .replace(RegExp(ZWJ, 'gmi'), '')
        .replaceAll(/\r\n/g, '\n')
        .replace(/^\n{2,}/gim, '\n')
        .replaceAll(EMOJI_REGEX_GLOBAL, (str) => 'E'.repeat(str.length))
        .replaceAll(/\sstyle=""/g, '')
        .replaceAll(/\sstyle="?.+"/g, '');
}
/**
 * Функция строит formatData "как есть", без учёта сдвигов по меншенам
 */
function __buildDirtyFormatData(preparedString) {
    const formatData = { version: '1', items: [] };
    const intervals = {
        [Message.FormatKind.BOLD]: {
            start: null,
            end: null,
        },
        [Message.FormatKind.ITALIC]: {
            start: null,
            end: null,
        },
        [Message.FormatKind.UNDERLINE]: {
            start: null,
            end: null,
        },
        [Message.FormatKind.URL]: {
            start: null,
            end: null,
            href: '',
        },
    };
    const hashes = getFormattingTagsHashes();
    /**
     * Ниже по коду в цикле while происходит поиск тегов оформления.
     * На основе результатов этого поиска вычисляется offset и length каждого формата,
     * которые потом лягут в итоговую format_data.
     *
     * Проблема в том, что строка, с которой мы имеем здесь дело, экранирована.
     * То есть теги, введенные пользователем вручную в тексте сообщения, выглядят
     * не как <b>, а как &lt;b&gt;.
     *
     * Но при этом offset для каждого формата нам нужно посчитать от неэкранированной
     * версии строки, так как именно она будет отображаться по итогу. Итого можно сделать вывод,
     * что решением проблемы служит unescape всей строки перед поиском в ней тегов оформления.
     * Но, сделав unescape, мы перестанем иметь возможность различать настоящий тег оформления от
     * любого тега, введенного пользователем. То-есть допустим XSS.
     *
     * Поэтому применяется замена настоящих тегов оформления на соответствующие им случайные
     * хеши, что позволяет нам сделать unescape, но не "захватывать" вручную введенные
     * пользователем теги, а выполнять поиск исключительно хешей, соответствующих тегам.
     */
    let stringToParse = preparedString
        .replaceAll('<b>', hashes.bold.opening)
        .replaceAll('</b>', hashes.bold.closing)
        .replaceAll('<u>', hashes.underline.opening)
        .replaceAll('</u>', hashes.underline.closing)
        .replaceAll('<i>', hashes.italic.opening)
        .replaceAll('</i>', hashes.italic.closing)
        .replaceAll('</a>', hashes.url.closing);
    /**
     * В случае с ссылкой мы не можем обойтись просто replaceAll, так как нужно искать
     * не просто <a>, а /<a class="ConvoComposer__textAsLink" data-url=".+?" href=".+?">/
     * И затем заменять его не целиком на хеш, а начало (<a) и конец (>) по отдельности.
     */
    let urlMatches = __findUrlOpeningTag(stringToParse);
    while (urlMatches && urlMatches.index !== undefined) {
        const match = urlMatches[0];
        let matchPrepared = match.replace(`<a`, hashes.url.opening);
        matchPrepared = matchPrepared.slice(0, -1) + hashes.url.bracket;
        stringToParse = stringToParse.replace(match, matchPrepared);
        urlMatches = __findUrlOpeningTag(stringToParse);
    }
    /**
     * 1. ищем <b>, </b>, <i>, </i>, <u>, </u>, <a>, </a>
     * 2. берём совпадение с самым маленьким индексом
     * 3. записываем этот индекс в интервалы
     *  - если тег стартовый и его нет в интервалах, записываем
     *  - если тег конечный, то записываем его только при наличии в интервалах стартового
     * 4. вырезаем этот тег из текста
     * 5. возвращаемся в пункт 1
     */
    let matches = __findFormattingTagHash(stringToParse, hashes);
    while (matches && matches.index !== undefined) {
        const match = matches[0];
        /** Делаем unescape, чтобы вычислить индекс по неэкранированной версии строки */
        const matchIndex = unescape(stringToParse).indexOf(unescape(match));
        if (match === hashes.bold.opening) {
            intervals.bold.start = matchIndex;
        }
        else if (match === hashes.bold.closing) {
            const interval = intervals.bold;
            if (typeof interval.start === 'number') {
                interval.end = matchIndex;
                formatData.items?.push({
                    type: Message.FormatKind.BOLD,
                    offset: interval.start,
                    length: interval.end - interval.start,
                });
            }
        }
        else if (match === hashes.italic.opening) {
            intervals.italic.start = matchIndex;
        }
        else if (match === hashes.italic.closing) {
            const interval = intervals.italic;
            if (typeof interval.start === 'number') {
                interval.end = matchIndex;
                formatData.items?.push({
                    type: Message.FormatKind.ITALIC,
                    offset: interval.start,
                    length: interval.end - interval.start,
                });
            }
        }
        else if (match === hashes.underline.opening) {
            intervals.underline.start = matchIndex;
        }
        else if (match === hashes.underline.closing) {
            const interval = intervals.underline;
            if (typeof interval.start === 'number') {
                interval.end = matchIndex;
                formatData.items?.push({
                    type: Message.FormatKind.UNDERLINE,
                    offset: interval.start,
                    length: interval.end - interval.start,
                });
            }
        }
        else if (match.startsWith(hashes.url.opening) &&
            match.endsWith(hashes.url.bracket)) {
            intervals.url.start = matchIndex;
            const hrefMatches = match.match(/href=".+?"/);
            if (hrefMatches && hrefMatches[0]) {
                intervals.url.href = unescape(hrefMatches[0].slice('href="'.length, -1));
            }
        }
        else if (match === hashes.url.closing) {
            const interval = intervals.url;
            if (typeof interval.start === 'number') {
                interval.end = matchIndex;
                formatData.items?.push({
                    type: Message.FormatKind.URL,
                    offset: interval.start,
                    length: interval.end - interval.start,
                    url: intervals.url.href,
                });
            }
        }
        stringToParse = stringToParse.replace(match, '');
        matches = __findFormattingTagHash(stringToParse, hashes);
    }
    return { formatData, stringToParse };
}
/**
 * Функция корректирует formatData с учётом меншенов:
 * 1. сдвигает позиции форматов за границы меншенов, если меншен не входит в формат целиком
 * 2. приравнивает длину каждого меншена к одному символу и корректирует форматы согласно этому правилу
 */
function __shiftFormatDataForMentions(preparedString, formatData) {
    let stringToParse = preparedString;
    if (formatData.items.length > 0) {
        let matches = getFirstMention(stringToParse);
        while (matches && matches?.index !== undefined) {
            /** Делаем unescape, чтобы вычислить индекс по неэкранированной версии строки */
            const matchIndex = unescape(stringToParse).indexOf(matches[0]);
            const mention = {
                start: matchIndex,
                end: matchIndex + matches[0].length,
                length: matches[0].length,
            };
            for (let i = 0; i < formatData.items.length; i += 1) {
                const format = formatData.items[i];
                if (!format) {
                    break;
                }
                const formatEnd = format.offset + format.length;
                /** Входит ли меншен целиком в текущий формат */
                const isWholeMentionFormatted = format.offset <= mention.start && formatEnd >= mention.end;
                if (isWholeMentionFormatted) {
                    format.length = format.length - mention.length + 1;
                }
                else {
                    if (format.offset < mention.start &&
                        formatEnd >= mention.start &&
                        formatEnd <= mention.end) {
                        /**
                         * o{ne @tw}o three
                         * o{ne @}two three
                         * */
                        format.length = mention.start - format.offset;
                    }
                    else if (format.offset >= mention.start &&
                        formatEnd <= mention.end) {
                        /**
                         * one @{t}wo three
                         * */
                        format.offset = 0;
                        format.length = 0;
                    }
                    else if (format.offset >= mention.start &&
                        formatEnd > mention.end &&
                        format.offset < mention.end) {
                        /** one @t{wo thr}ee */
                        format.offset = mention.end;
                        format.length = formatEnd - mention.end;
                    }
                }
                if (format.offset >= mention.end) {
                    format.offset -= mention.length - 1;
                }
            }
            stringToParse = stringToParse.replace(matches[0], '1');
            matches = getFirstMention(stringToParse);
        }
    }
    return formatData;
}
const __findUrlOpeningTag = (source) => source.match(/<a class="ConvoComposer__textAsLink" data-url=".+?" href=".+?">/);
/**
 * Функция находит в html-представлении текста сообщения тег, относящийся к форматированию
 */
function __findFormattingTagHash(source, hashes) {
    return source.match(new RegExp(`${hashes.bold.opening}|${hashes.bold.closing}|${hashes.underline.opening}|${hashes.underline.closing}|${hashes.italic.opening}|${hashes.italic.closing}|${hashes.url.opening} class="ConvoComposer__textAsLink" data-url=".+?" href=".+?"${hashes.url.bracket}|${hashes.url.closing}`));
}
//# sourceMappingURL=build.js.map