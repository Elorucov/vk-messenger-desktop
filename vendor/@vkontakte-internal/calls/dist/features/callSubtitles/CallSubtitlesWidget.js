import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":4}],"span":["global",{"className":1}]} */
import { classNames as cn } from '@vkontakte/vkjs';
import { useEffect, useRef } from 'react';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { ColorSchemeProvider, Paragraph } from '@vkontakte-internal/vkcom-kit';
import { useIsTextFitsContainer } from './hooks/useIsTextFitsContainer';
import { useLang } from '../../hooks/useLang';
import { isSameExternalId } from '@vkontakte-internal/calls-core';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { observer } from 'mobx-react-lite';
import { CallSubtitlesModelProvider, useCallSubtitlesModel } from './CallSubtitlesModel';
import { createWidget } from '@vkontakte-internal/di';
/** Длина двоеточия с пробелом в символах, разделяющих имя автора и саму реплику */
const NAME_SEPARATOR_LENGTH = 2;
/** Разделитель имени и реплики в строке субтитров */
const NAME_SEPARATOR = ': ';
/** Количество отображаемых строк субтитров */
const SUBTITLES_LINES_COUNT = 3;
/** Период вызова функции очистки истории от старых субтитров */
const SUBTITLES_CLEAR_OLD_INTERVAL_MS = 1000;
/** Блок субтитров внизу оратора/грида */
const CallSubtitles = observer(function CallSubtitles() {
    const { setSubtitlesLines, clearOldSubtitles, subtitleLines, history, props } = useCallSubtitlesModel();
    const { isGridView, isFullScreen, isStub, isShownParticipantsAside } = props.current;
    const { getLang } = useLang();
    const participants = useTypedSelector((state) => state.participants);
    const localExternalId = useTypedSelector((state) => state.externalId);
    /** Контейнер субтитров */
    const subtitleLinesContainer = useRef(null);
    /** DOM элемент для копирования вычисленных стилей для вычисления размера текста */
    const subtitleLineStyleComponent = useRef(null);
    /** Функция для определения, влезает ли переданный текст в контейнер субтитров */
    const isTextFitsContainer = useIsTextFitsContainer({
        containerRef: subtitleLinesContainer,
        styleRef: subtitleLineStyleComponent,
    });
    useEffect(() => {
        let updatedSubtitleLines = [];
        // Разбиваем полные реплики из истории на отображаемые строки субтитров
        for (let transcription of history) {
            const { externalId, text, timestamp } = transcription;
            const participant = participants[externalId.id];
            const isMe = isSameExternalId(externalId, localExternalId);
            if (!participant && !isMe) {
                continue;
            }
            const name = isMe ? getLang('calls_subtitles_self_name') : participant.customName || participant.name;
            /** Строки субтитров из текущей реплики, которые мы в итоге отобразим*/
            let subtitleLinesToAdd = [];
            const words = text.split(' ');
            let currentLineText = '';
            let nextCurrentLineText = '';
            // Собираем строки по словам
            for (let word of words) {
                currentLineText = nextCurrentLineText;
                nextCurrentLineText += word + ' ';
                // После добавления каждого слова проверяем, влезает ли новая строка в контейнер
                // Для первой строки реплики при этом резервируем место под имя и разделитель
                if (!isTextFitsContainer(subtitleLinesToAdd.length > 0 ? nextCurrentLineText : name + NAME_SEPARATOR + nextCurrentLineText)) {
                    // Если не влезает - сохраняем новую строку, без последнего слова, в массив
                    subtitleLinesToAdd.push({
                        externalId,
                        text: currentLineText.slice(0, -1),
                        key: `sl-${timestamp}-${externalId.id}-${subtitleLinesToAdd.length}`,
                    });
                    // Не влезающее слова переносим в следующую строку
                    nextCurrentLineText = nextCurrentLineText.slice(currentLineText.length);
                    currentLineText = '';
                }
            }
            // После прохода по всем словам добавляем в массив оставшуюся строку
            subtitleLinesToAdd.push({
                externalId,
                text: isTextFitsContainer(nextCurrentLineText)
                    ? nextCurrentLineText.slice(0, -1)
                    : currentLineText.slice(0, -1),
                key: `sl-${timestamp}-${externalId.id}-${subtitleLinesToAdd.length}`,
            });
            subtitleLinesToAdd = subtitleLinesToAdd
                // Берем сначала только последние SUBTITLES_LINES_COUNT отображаемых строк текущей реплики
                .slice(-SUBTITLES_LINES_COUNT);
            // Теперь еще отсеиваем строки с учетом уже набранных в обновленный список отображаемых строк
            if (subtitleLinesToAdd.length > SUBTITLES_LINES_COUNT - updatedSubtitleLines.length) {
                subtitleLinesToAdd = subtitleLinesToAdd.slice(updatedSubtitleLines.length - SUBTITLES_LINES_COUNT);
            }
            // К первой отображаемый строке реплики всегда добавляем имя
            subtitleLinesToAdd[0].name = name;
            const firstLineTextWithName = name + NAME_SEPARATOR + subtitleLinesToAdd[0].text;
            // Если оригинальная первая строка не влезает в контейнер вместе с добавленным именем и разделителем -
            // обрезаем ее на нужное количество слов
            if (!isTextFitsContainer(firstLineTextWithName)) {
                let updatedFirstLineText = subtitleLinesToAdd[0].text.slice(name.length + NAME_SEPARATOR_LENGTH);
                const updatedFirstLineTextParts = updatedFirstLineText.split(/^\S+\s/);
                updatedFirstLineText =
                    updatedFirstLineTextParts.length > 1
                        ? updatedFirstLineTextParts[1]
                        : updatedFirstLineTextParts[0].trim();
                subtitleLinesToAdd[0].text = updatedFirstLineText;
            }
            updatedSubtitleLines.unshift(...subtitleLinesToAdd);
            if (updatedSubtitleLines.length === SUBTITLES_LINES_COUNT) {
                break;
            }
        }
        setSubtitlesLines(updatedSubtitleLines);
    }, [history, isTextFitsContainer, participants]);
    // По таймеру очищаем старые строки субтитров
    useEffect(() => {
        clearOldSubtitles(history);
        const clearOldSubtitlesInterval = setInterval(() => {
            clearOldSubtitles(history);
        }, SUBTITLES_CLEAR_OLD_INTERVAL_MS);
        return () => {
            window.clearInterval(clearOldSubtitlesInterval);
        };
    }, [history]);
    return (_jsx(ColorSchemeProvider, { value: "dark", children: _jsx("div", { className: cn('CallsSubtitles', {
                'CallsSubtitles--grid': Boolean(isGridView),
                'CallsSubtitles--fullscreen': Boolean(isFullScreen),
                'CallsSubtitles--aside-hidden': Boolean(!isGridView && !isShownParticipantsAside),
                'CallsSubtitles--stub': Boolean(isStub),
            }), children: _jsx("div", { className: "CallsSubtitles__inner", children: _jsx("div", { className: "CallsSubtitles__content-wrapper", ref: subtitleLinesContainer, children: _jsxs("div", { className: "CallsSubtitles__content", children: [_jsx(Paragraph, { Component: "div", children: _jsx("div", { ref: subtitleLineStyleComponent }) }), subtitleLines.map(({ name, text, key }) => (_jsxs(Paragraph, { Component: "div", children: [name && _jsxs("span", { className: "CallsSubtitles__name", children: [decodeHTMLEntities(name), ": "] }), _jsx("span", { children: text })] }, key)))] }) }) }) }) }));
});
export const CallSubtitlesWidget = createWidget(CallSubtitlesModelProvider, CallSubtitles);
//# sourceMappingURL=CallSubtitlesWidget.js.map