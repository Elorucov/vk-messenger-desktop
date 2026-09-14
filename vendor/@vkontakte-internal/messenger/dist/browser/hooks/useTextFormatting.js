import React from 'react';
import { getFormatsForChunk, getFormatsForOffset, } from '../../data/utils/formatData/display';
import { Highlighter, HighlighterMark, } from '../ui/Highlighter/Highlighter';
import { applyCombinedFuzzyAndExactSearch } from '../ui/Highlighter/search';
import * as Message from '../../core/model/Message';
import { useFeatureFlags } from '../hooks/misc';
/**
 Хук для отрисовки форматирования в чанках. На вход получает объект format_data и
 чанки/текст, возвращает ReactNode, в которой уже расставлены теги форматирования.
 Используется в chunks.map(), где для получения ноды с форматированием в каждом
 `case chunk.kind:` ОБЯЗАТЕЛЬНО дёргается одна из функций:
   - formatting.byChunk - для простых кейсов. По chunk.kind сам знает, какое поле
 нужно для отображения, есть ли поисковая подсветка, как правильно посчитать длину
 этого чанка для сдвигов форматирования
   - formatting.byText - не завязывается на чанке, смотрит подстроку от начала текущего
 prevChunkLength. Полезен для сложных кейсов, когда нет единого рендера чанка (HashtagMention)

 Обе функции возвращают реакт ноду с расставленным форматированием, считают length
 предыдущих чанков, чтобы не впороться на сдвигах форматирования.
 */
export const useTextFormatting = ({ formatData, linkRenderer, multiline, highlightFuzzySearch, highlightColor, highlightColorOpacity, }) => {
    const { vkm_composer_formatting } = useFeatureFlags();
    /**
     * Рекурсивно отрисовываем теги форматирования
     * @param children
     */
    const renderFormattedNodes = (children) => {
        return children.map((element, i) => {
            const content = element.children
                ? renderFormattedNodes(element.children)
                : element.text;
            switch (element.type) {
                case Message.FormatKind.BOLD: {
                    return React.createElement("b", { key: i }, content);
                }
                case Message.FormatKind.ITALIC: {
                    return React.createElement("i", { key: i }, content);
                }
                case Message.FormatKind.UNDERLINE: {
                    return React.createElement("u", { key: i }, content);
                }
                case Message.FormatKind.URL: {
                    if (!element.url) {
                        return React.createElement(React.Fragment, { key: i }, content);
                    }
                    return (React.createElement(React.Fragment, { key: i }, linkRenderer(element.url, content)));
                }
                case 'search': {
                    return (React.createElement(HighlighterMark, { key: i, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity }, content));
                }
                case null:
                default: {
                    return React.createElement(React.Fragment, { key: i }, content);
                }
            }
        });
    };
    /**
     * Возаращаем стилизованный текст чанка и длину текста для того,
     * чтоб корректно сдвинуть индексы форматирования текста для последующих чанков,
     * т.к. в format_data, возвращаемой с бекенда, заложена логика, что меншены
     * и псевдоменшены являются одним символом, т.е. мы должны проверить text
     * на наличие меншенов и вернуть length текста из расчёта, что меншен = 1 символ
     * Пример: text: `Hi @name pal!` => length: 9
     * @param text
     * @param prevChunksLength оффсет текущего чанка
     * @param canBeHighlighted подсвечиваются ли в этом чанке поисковые совпадения
     */
    const getStyledText = (text, prevChunksLength, canBeHighlighted) => {
        const searchFormats = [];
        if (canBeHighlighted && highlightFuzzySearch) {
            if (!formatData || !vkm_composer_formatting) {
                return [
                    React.createElement(Highlighter, { search: highlightFuzzySearch, text: text, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity }),
                    text.length,
                ];
            }
            /**
             * Зажмуриваемся и представляем, что подсветка поиска - просто один из
             * типов format_data. Мы его так же прогоняем через getFormatsForChunk()
             * и рендерим в renderFormattedNodes(), что позволяет нам накладывать
             * фраматы друг на друга при отрисовке
             */
            applyCombinedFuzzyAndExactSearch(text, highlightFuzzySearch).reduce((localCounter, cur) => {
                // случаи, когда text: 'hello hello hello', search: 'hello',
                // и нам нужно подсветить все три hello
                const substring = text.substring(localCounter);
                if (cur.type === 'search_match') {
                    searchFormats.push({
                        type: 'search',
                        offset: substring.indexOf(cur.text) + prevChunksLength + localCounter,
                        length: cur.text.length,
                    });
                }
                return (localCounter += cur.text.length);
            }, 0);
        }
        if (formatData && text && vkm_composer_formatting) {
            const formatDataWithSearch = [...formatData.items, ...searchFormats];
            const { nodes, length } = getFormatsForChunk(text, prevChunksLength, formatDataWithSearch);
            return [renderFormattedNodes(nodes), length];
        }
        return [text, text.length];
    };
    /**
     * Возвращаем стилизованный текст меншена (облегчённая версия функции getStyledText())
     * @param text displayName меншена
     * @param prevChunksLength оффсет текущего чанка
     */
    const getStyledMention = (text, prevChunksLength) => {
        if (formatData && text && vkm_composer_formatting) {
            const nodes = getFormatsForOffset(text, prevChunksLength, formatData.items);
            return renderFormattedNodes(nodes);
        }
        return text;
    };
    /**
     * Тут храним в замыкании prevChunkLength. Выносим всю логику подсчёта длины
     * чанков в этот хук для того, чтобы механизм был единым для всех компонентов,
     * рендерящих чанки
     */
    const formatting = () => {
        let prevChunkLength = 0;
        const byChunk = (chunk) => {
            switch (chunk.kind) {
                case 'Mention':
                case 'MassMention':
                case 'ScreenNameMention': {
                    const nodes = getStyledMention(chunk.displayName, prevChunkLength);
                    prevChunkLength++;
                    return nodes;
                }
                case 'Text': {
                    const [nodes, length] = getStyledText(chunk.text, prevChunkLength, true);
                    prevChunkLength += length;
                    return nodes;
                }
                case 'Email': {
                    const [nodes, length] = getStyledText(chunk.email, prevChunkLength, true);
                    prevChunkLength += length;
                    return nodes;
                }
                case 'Hashtag': {
                    const [nodes, length] = getStyledText(chunk.tag, prevChunkLength, false);
                    prevChunkLength += length;
                    return nodes;
                }
                case 'HashtagMention': {
                    const fullText = `${chunk.tag}@${chunk.screenName}`;
                    const [nodes, length] = getStyledText(fullText, prevChunkLength, false);
                    prevChunkLength += length;
                    return nodes;
                }
                case 'Url': {
                    const [nodes] = getStyledText(chunk.caption, prevChunkLength, true);
                    prevChunkLength += chunk.text.length;
                    return nodes;
                }
                /**
                 * В типах чанков, описанных ниже, нет форматирования, но нам нужно
                 * посчитать и сохранить себе их length
                 */
                case 'Code': {
                    const code = chunk.text;
                    const breaksCount = code.split('\n').length - 1;
                    // \n - 1 символ. В multiline будут вырезаны все переносы,
                    // в !multiline переносы будут заменены на пробелы, т.е. пересчитывать длину не нужно.
                    // 6 - косые скобки вокруг кода, которые скушались парсером
                    // Note: Потенциально тут может быть ошибка, если где-то сверху криво
                    // спустится multiline. Мб стоит не прокидывать сюда multiline с небес,
                    // а вручную непосредственно перед вызовом в компоненте проставлять
                    const breaksLength = multiline ? breaksCount - 6 : 0;
                    prevChunkLength += code.length - breaksLength;
                    return null;
                }
                case 'Emoji': {
                    prevChunkLength += chunk.text.length;
                    return null;
                }
                case 'LineBreak': {
                    prevChunkLength++;
                    return null;
                }
                default: {
                    return null;
                }
            }
        };
        const byText = (text) => {
            const [nodes, length] = getStyledText(text, prevChunkLength, false);
            prevChunkLength += length;
            return nodes;
        };
        return {
            byChunk,
            byText,
        };
    };
    return formatting();
};
//# sourceMappingURL=useTextFormatting.js.map