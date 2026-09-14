import { addProtocolToUrl, exhaustivenessCheck } from '../../../core/utils/misc';
import { useCallback, useMemo, useState } from 'react';
import * as Message from '../../../core/model/Message';
import { escape } from '@vkontakte/vkjs';
export const useComposerFormatting = (editor) => {
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStriked, setIsStriked] = useState(false);
    const [isUnderlined, setIsUnderlined] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
    const [linkAnchorNode, setLinkAnchorNode] = useState(null);
    const [selectionStringForLink, setSelectionStringForLink] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isForciblyClosed, setIsForciblyClosed] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [isResettableFormatApplied, setIsResettableFormatApplied] = useState(false);
    const determineResettableFormatsExistence = useCallback((selection, editor) => {
        const formats = getSelectionFormats(selection, editor);
        const resettableFormats = formats.filter((f) => f !== Message.FormatKind.URL);
        if (resettableFormats.length > 0) {
            setIsResettableFormatApplied(true);
        }
        else {
            setIsResettableFormatApplied(false);
        }
    }, []);
    /**
     * Нужно вызывать при каждом открытии тултипа форматирования
     * Цель - определить, какое оформление применено к выделенному тексту,
     * и проставить соответствующие флаги
     *
     * Благодаря этому при выделении части текста, к которой ранее было применено
     * форматирование "жирный текст", в открывшемся тултипе сразу будет выделена
     * опция "жирный текст" как активная */
    const init = useCallback(() => {
        const selection = document.getSelection();
        const selectionString = selection?.toString();
        const node = selection?.anchorNode;
        if (!selection || !selectionString || !node || !editor) {
            return;
        }
        setIsForciblyClosed(false);
        setSelectedRange(selection.getRangeAt(0).cloneRange());
        const formats = getSelectionFormats(selection, editor);
        setIsBold(formats.includes(Message.FormatKind.BOLD));
        setIsItalic(formats.includes(Message.FormatKind.ITALIC));
        // setIsStriked(!!findParent(node, Message.FORMATTING_NODE_NAMES.striked, editor))
        setIsUnderlined(formats.includes(Message.FormatKind.UNDERLINE));
        const parentLink = findParent(node, Message.FORMATTING_NODE_NAMES.url, editor);
        setIsLinkInputOpen(false);
        setIsLink(!!parentLink);
        setLinkUrl(parentLink?.dataset?.url || parentLink?.href || '');
        setLinkAnchorNode(selection.anchorNode);
        setSelectionStringForLink(selectionString || '');
        determineResettableFormatsExistence(selection, editor);
    }, [editor, determineResettableFormatsExistence]);
    const reset = useCallback(() => {
        setIsLinkInputOpen(false);
        setIsBold(false);
        setIsItalic(false);
        setIsStriked(false);
        setIsUnderlined(false);
        setIsLink(false);
        setSelectedRange(null);
        setIsResettableFormatApplied(false);
    }, []);
    const apply = useCallback((format) => {
        const selection = document.getSelection();
        const selectionString = selection?.toString();
        if (!selection || !selectionString || !editor) {
            return;
        }
        const isCurrentlyApplied = !!findParent(selection.anchorNode, Message.FORMATTING_NODE_NAMES[format], editor);
        const setter = (() => {
            switch (format) {
                case 'bold':
                    return setIsBold;
                case 'italic':
                    return setIsItalic;
                // case 'strikethrough':
                //   return setIsStriked
                case 'underline':
                    return setIsUnderlined;
                default:
                    exhaustivenessCheck(format);
            }
        })();
        if (isCurrentlyApplied) {
            setter(false);
        }
        else {
            setter(true);
        }
        /**
         * execCommand deprecated, но прямой замены нет.
         * При вызове происходит багованный скролл, проресерчил и решил запомнинать
         * до вызова execCommand scrollTop
         * и после сразу его назначать
         * https://jira.vk.team/browse/ME-82598
         */
        const scrollTop = editor.scrollTop;
        document.execCommand(format);
        editor.scrollTop = scrollTop;
        /**
         * Фикс для FF, в котором после тыка в меню теряется фокус композера
         * и нажатие backspace закрывает чат вместо того, чтобы удалить выделенный текст
         *
         * https://jira.mvk.com/browse/ME-66326
         */
        editor.focus();
        determineResettableFormatsExistence(selection, editor);
    }, [editor, determineResettableFormatsExistence]);
    const link = useCallback((url) => {
        const selectionString = selectionStringForLink;
        if (!linkAnchorNode || !selectionString || !editor) {
            return;
        }
        const parentLink = findParent(linkAnchorNode, Message.FORMATTING_NODE_NAMES.url, editor);
        const isCurrentlyLink = Boolean(parentLink);
        if (!isCurrentlyLink && !url) {
            return;
        }
        if (isCurrentlyLink && !url) {
            setIsLink(false);
        }
        else {
            setIsLink(true);
        }
        if (selectedRange) {
            document.getSelection()?.removeAllRanges();
            document.getSelection()?.addRange(selectedRange);
        }
        const scrollTop = editor.scrollTop;
        document.execCommand('unlink');
        if (isCurrentlyLink && !url) {
            setLinkUrl('');
            editor.scrollTop = scrollTop;
        }
        else {
            const selection = document.getSelection();
            if (!selection) {
                return;
            }
            const currentFormats = [
                Message.FormatKind.BOLD,
                Message.FormatKind.ITALIC,
                Message.FormatKind.UNDERLINE,
            ].filter((format) => !!findParent(selection.anchorNode, Message.FORMATTING_NODE_NAMES[format], editor));
            const selectionStringWrapped = currentFormats.reduce((acc, format) => `<${Message.FORMATTING_NODE_NAMES[format]}>${acc}</${Message.FORMATTING_NODE_NAMES[format]}>`, escape(selectionString));
            const urlWithProtocol = addProtocolToUrl(escape(url));
            document.execCommand('insertHTML', false, `<a class="ConvoComposer__textAsLink" data-url="${urlWithProtocol}" href="${urlWithProtocol}">${selectionStringWrapped}</a>`);
            editor.scrollTop = scrollTop;
            setLinkUrl(selectionString);
        }
    }, [editor, linkAnchorNode, selectionStringForLink, selectedRange]);
    const openLinkInput = useCallback(() => {
        setIsLinkInputOpen(true);
    }, []);
    const closeLinkInput = useCallback(() => {
        setIsLinkInputOpen(false);
    }, []);
    const backFromLinkInput = useCallback(() => {
        if (selectedRange) {
            document.getSelection()?.removeAllRanges();
            document.getSelection()?.addRange(selectedRange);
        }
        closeLinkInput();
    }, [selectedRange, closeLinkInput]);
    const clear = useCallback(() => {
        reset();
        const scrollTop = editor?.scrollTop;
        document.execCommand('removeFormat');
        if (editor && scrollTop) {
            editor.scrollTop = scrollTop;
        }
    }, [reset, editor]);
    const forciblyClose = useCallback(() => setIsForciblyClosed(true), []);
    return useMemo(() => ({
        isBold,
        isItalic,
        isStriked,
        isUnderlined,
        isLink,
        isLinkInputOpen,
        isForciblyClosed,
        isResettableFormatApplied,
        forciblyClose,
        bold: () => apply('bold'),
        italic: () => apply('italic'),
        // strikethrough: () => apply('strikethrough'),
        underline: () => apply('underline'),
        link,
        linkUrl,
        openLinkInput,
        closeLinkInput,
        backFromLinkInput,
        init,
        reset,
        clear,
    }), [
        apply,
        backFromLinkInput,
        clear,
        closeLinkInput,
        forciblyClose,
        init,
        isBold,
        isForciblyClosed,
        isItalic,
        isLink,
        isLinkInputOpen,
        isResettableFormatApplied,
        isStriked,
        isUnderlined,
        link,
        linkUrl,
        openLinkInput,
        reset,
    ]);
};
/**
 * Функция-хуюнкция
 *
 * Служит для того, чтобы определять, является ли выделенный кусок текста жирным/подчеркнутым/курсивным/зачеркнутым и так далее.
 *
 * Предыстория, почему нужна эта функция:
 *
 * Например, нам нужно определить, применено ли форматирование "жирный текст" к выделенной части текста.
 * Для этого мы смотрим, является ли родительский нод этого текста тегом <b>. То-есть, мы смотрим - если текст заключен
 * в тег <b>, значит, к нему применено жирное форматирование, если не заключен - не применено.
 *
 * Эта проверка выглядит вот так:  selection?.anchorNode?.parentNode.nodeName === NODE_NAME_BOLD
 *
 * Проблема в том, что она работает только в случае, если к выделенной части текста применен только один формат.
 * Потому что если у нас есть <b>test</b>, где мышкой выделен "test", и мы применяем сюда еще и курсивный формат или любой другой,
 * то <b>test</b> превращается в <b><i>test</i></b>, то-есть <b> перестает быть родительской нодой для текста. А это значит,
 * что проверка вида selection?.anchorNode?.parentNode.nodeName === NODE_NAME_BOLD больше для нас не работает.
 *
 * Поэтому применяется рекурсия. На первой итерации мы увидим тег <i> (курсив), пойдем дальше и найдем там тег <b> - так
 * мы поймем, что к выделенной части текста применено форматирование "жирный текст".
 *
 * Но мы должны обязательно передать boundaryNode - это нод, встретив который, функция должна остановиться, вернув false.
 * В нашем случае boundaryNode - это $editor.current.element ($editor.current.getElement()), за рамками которого функция
 * не должна осуществлять поиск. Иначе в негативных сценариях она будет упираться аж в <body>.
 */
function findParent(node, searchedParentNodeName, boundaryNode) {
    if (!node) {
        return null;
    }
    if (node === boundaryNode) {
        return null;
    }
    if (node.nodeName === searchedParentNodeName) {
        return node;
    }
    return findParent(node.parentNode, searchedParentNodeName, boundaryNode);
}
/** Возвращает тип формата, соответствующий переданному html-тегу */
function getFormatKindByNodeName(nodeName) {
    if (!nodeName) {
        return undefined;
    }
    return {
        a: Message.FormatKind.URL,
        b: Message.FormatKind.BOLD,
        i: Message.FormatKind.ITALIC,
        u: Message.FormatKind.UNDERLINE,
    }[nodeName.toLowerCase()];
}
/** Возвращает все типы форматов, которые применены к выделенному в композере тексту */
function getSelectionFormats(selection, editor) {
    if (!selection || !editor) {
        return [];
    }
    const formats = new Set();
    /**
     * Обработка кейса, когда формат в выделении только частично
     * so|me *bo|ld* text
     */
    formats.add(getFormatKindByNodeName(selection?.anchorNode?.parentNode?.nodeName));
    formats.add(getFormatKindByNodeName(selection?.focusNode?.parentNode?.nodeName));
    /**
     * Обработка кейса, когда начали и закончили выделение на
     * неотформатированном тексте, но внутри есть формат
     * so|me *bold* te|xt */
    for (const node of editor.childNodes) {
        if (selection.containsNode(node)) {
            formats.add(getFormatKindByNodeName(node.nodeName));
        }
    }
    if (!formats.has(Message.FormatKind.BOLD) && // Проверяем, чтобы избежать лишних вычислений
        (findParent(selection.anchorNode, Message.FORMATTING_NODE_NAMES.bold, editor) ||
            findParent(selection.focusNode, Message.FORMATTING_NODE_NAMES.bold, editor))) {
        formats.add(Message.FormatKind.BOLD);
    }
    if (!formats.has(Message.FormatKind.ITALIC) && // Проверяем, чтобы избежать лишних вычислений
        (findParent(selection.anchorNode, Message.FORMATTING_NODE_NAMES.italic, editor) ||
            findParent(selection.focusNode, Message.FORMATTING_NODE_NAMES.italic, editor))) {
        formats.add(Message.FormatKind.ITALIC);
    }
    if (!formats.has(Message.FormatKind.UNDERLINE) && // Проверяем, чтобы избежать лишних вычислений
        (findParent(selection.anchorNode, Message.FORMATTING_NODE_NAMES.underline, editor) ||
            findParent(selection.focusNode, Message.FORMATTING_NODE_NAMES.underline, editor))) {
        formats.add(Message.FormatKind.UNDERLINE);
    }
    if (!formats.has(Message.FormatKind.URL) && // Проверяем, чтобы избежать лишних вычислений
        (findParent(selection.anchorNode, Message.FORMATTING_NODE_NAMES.url, editor) ||
            findParent(selection.focusNode, Message.FORMATTING_NODE_NAMES.url, editor))) {
        formats.add(Message.FormatKind.URL);
    }
    return Array.from(formats).filter((f) => !!f);
}
//# sourceMappingURL=useComposerFormatting.js.map