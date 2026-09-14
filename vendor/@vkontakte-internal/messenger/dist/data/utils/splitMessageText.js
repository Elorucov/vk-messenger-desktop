import { MAX_MESSAGE_SIZE } from '../../core/config/config';
import { getLengthWithEmoji } from '../../core/utils/emoji';
import { EMOJI_REGEX_GLOBAL, getFormatItemsValidated, } from './formatData/common';
/**
 * Разбиение большого текста сообщения на несколько сообщений
 */
export function splitMessageText(message, formatItems) {
    const length = message.length;
    if (length < MAX_MESSAGE_SIZE) {
        return [
            {
                text: message,
                formatItems,
            },
        ];
    }
    const parts = [];
    let originalChunkStart = 0;
    let remainingMessage = message;
    while (getLengthWithEmoji(remainingMessage, true) > 0) {
        let chunk = remainingMessage.slice(0, MAX_MESSAGE_SIZE);
        if (chunk !== remainingMessage) {
            /** Ищем последний пробел, чтобы мягко разбить сообщение по нему, не ломая слова */
            const lastSpaceIndex = chunk.lastIndexOf(' ');
            if (lastSpaceIndex > 0) {
                chunk = remainingMessage.slice(0, lastSpaceIndex);
            }
        }
        /**
         * Здесь остается проблема, что если по пробелу сообщение разделить не удалось (пробелов нет),
         * и по адресу remainingMessage[MAX_MESSAGE_SIZE] лежит эмодзи, в чанк попадет только часть эмодзи, то есть эмодзи ломается.
         *
         * Например, если в remainingMessage[MAX_MESSAGE_SIZE] находится эмодзи 😀 (длина === 2),
         * которое состоит из частей '\uD83D', '\uDE00' (можно получить посредством '😀'.split('')),
         * то в чанк попадёт только первая его часть - '\uD83D'
         *
         * При первой реализации @m.ermokhin решил не усложнять код решением этой проблемы, так как
         * это очень редкий кейс, для воспроизведения которого должны совпасть факторы, которые
         * все вместе не возникнут при обычном использовании мессенджера по назначению:
         * 1. сообщение должно быть больше, чем MAX_MESSAGE_SIZE (4096 на момент написания комментария)
         * 2. в сообщении не должно быть пробелов
         * 3. по адресу remainingMessage[MAX_MESSAGE_SIZE] должен находиться эмодзи
         *
         * */
        const chunkWithFlatEmoji = chunk.replaceAll(EMOJI_REGEX_GLOBAL, (str) => 'E'.repeat(str.length));
        const chunkLength = chunkWithFlatEmoji.length;
        const part = {
            text: chunk,
            formatItems: formatItems &&
                formatItems.reduce(
                // eslint-disable-next-line no-loop-func
                (acc, format) => {
                    const originalFormatStart = format.offset;
                    const originalFormatEnd = format.offset + format.length;
                    const originalChunkEnd = originalChunkStart + chunkLength;
                    // Формат заканчивается левее чанка в оригинальном тексте
                    if (originalFormatEnd <= originalChunkStart) {
                        return acc;
                    }
                    // Формат начинается правее чанка в оригинальном тексте
                    if (originalFormatStart >= originalChunkEnd) {
                        return acc;
                    }
                    // Формат начинается левее чанка и заканчивается правее (или по границам чанка)
                    if (originalFormatStart <= originalChunkStart &&
                        originalFormatEnd >= originalChunkEnd) {
                        return [
                            ...acc,
                            {
                                ...format,
                                offset: 0,
                                length: chunkLength,
                            },
                        ];
                    }
                    // Формат начинается левее чанка и заканчивается в чанке
                    if (originalFormatStart <= originalChunkStart &&
                        originalFormatEnd <= originalChunkEnd) {
                        return [
                            ...acc,
                            {
                                ...format,
                                offset: 0,
                                length: originalFormatEnd - originalChunkStart,
                            },
                        ];
                    }
                    // Формат начинается в чанке и заканчивается правее
                    if (originalFormatStart >= originalChunkStart &&
                        originalFormatEnd >= originalChunkEnd) {
                        return [
                            ...acc,
                            {
                                ...format,
                                offset: originalFormatStart - originalChunkStart,
                                length: originalChunkEnd - originalFormatStart,
                            },
                        ];
                    }
                    // Формат начинается в чанке и заканчивается в чанке
                    if (originalFormatStart >= originalChunkStart &&
                        originalFormatEnd <= originalChunkEnd) {
                        return [
                            ...acc,
                            {
                                ...format,
                                offset: originalFormatStart - originalChunkStart,
                                length: originalFormatEnd - originalFormatStart,
                            },
                        ];
                    }
                    return acc;
                }, []),
        };
        /**
         * Смотрим, сколько пробелов (N) в начале чанка.
         * Если N > 0, корректируем отступ и длину форматов, которые заденет trim()
         */
        const chunkStartSpacesCount = getStartSpacesCount(chunkWithFlatEmoji);
        if (chunkStartSpacesCount > 0) {
            for (const format of part.formatItems || []) {
                if (format.offset < chunkStartSpacesCount) {
                    format.offset = 0;
                    format.length -= chunkStartSpacesCount - format.offset;
                }
                else if (format.offset === chunkStartSpacesCount) {
                    format.offset = 0;
                }
            }
        }
        /**
         * Смотрим, сколько пробелов (N) в конце чанка.
         * Если N > 0, уменьшаем длину всех форматов на кол-во пробелов в нём, которые будут выкинуты из чанка
         */
        const chunkEndSpacesCount = getEndSpacesCount(chunkWithFlatEmoji);
        const chunkLengthWithoutSpaces = chunkLength - chunkEndSpacesCount;
        if (chunkEndSpacesCount > 0) {
            for (const format of part.formatItems || []) {
                const formatEnd = format.offset + format.length;
                const extraSpacesCount = formatEnd - chunkLengthWithoutSpaces;
                format.length -= extraSpacesCount;
            }
        }
        const trimmed = part.text.trim();
        if (trimmed.length > 0) {
            /**
             * Если впоследствии всего множества вычислений, сдвигов и преобразований
             * у нас получается некорректный объект среди айтемов в formatData,
             * бэк его не примет и отправка сообщения упадёт с ошибкой.
             *
             * Поэтому здесь, учитывая сложность кода, мы должны допускать, что могут быть
             * невалидные айтемы, и убирать их из массива formatItems, чтобы они не отправились
             * на бэк и не сломали user experience ошибкой при отправке сообщения
             *
             * Можно гордо считать, что мы не можем сформировать некорректный объект
             * и не хендлить этот сценарий, но лучше признать возможность ошибки, чтобы
             * не сломать пользователю своей уверенностью интерфейс.
             */
            const formatItemsValidated = part.formatItems
                ? getFormatItemsValidated(part.formatItems)
                : undefined;
            parts.push({
                text: trimmed,
                formatItems: formatItemsValidated,
            });
        }
        remainingMessage = remainingMessage.replace(chunk, '');
        originalChunkStart += chunkLength;
    }
    return parts;
    /** FUNCTION DECLARATIONS */
    /** Считает количество пробелов в начале строки */
    function getStartSpacesCount(text) {
        if (text[0] !== ' ') {
            return 0;
        }
        return 1 + getStartSpacesCount(text.slice(1));
    }
    /** Считает количество пробелов в конце строки */
    function getEndSpacesCount(text) {
        if (text.slice(-1) !== ' ') {
            return 0;
        }
        return 1 + getEndSpacesCount(text.slice(0, -1));
    }
    /** END DECLARATIONS */
}
//# sourceMappingURL=splitMessageText.js.map