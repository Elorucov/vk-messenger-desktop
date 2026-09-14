import { getFilesFromDataTransferItems } from '../../utils/files';
import { browser } from '../../utils/misc';
import { toTextAndEmojiChunks } from '../../../core/utils/emoji';
import { exhaustivenessCheck, isDev } from '../../../core/utils/misc';
import { escape, unescape } from '@vkontakte/vkjs';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { createEmojiElement } from '../../../shared/emoji';
// Не фокусируемся на поле ввода на мобилках, чтобы избежать открытия клавиатуры
export const COMPOSER_AUTOFOCUS_DISABLED = browser.mobile;
export class Editor {
    element;
    prevText = '';
    prevTextSelection = {
        from: 0,
        to: 0,
    };
    handlers = {
        contentChange: new Set(),
    };
    constructor(element) {
        this.element = element;
        if (element.contentEditable !== 'true') {
            throw new Error('Элемент эдитора должен быть contentEditable');
        }
        if (element.tagName !== 'SPAN') {
            console.warn('Используйте элемент span');
        }
        element.translate = false;
    }
    handlePaste = async (event) => {
        event.preventDefault();
        const { clipboardData } = event;
        if (!clipboardData) {
            return;
        }
        const pasteText = clipboardData.getData('text');
        if (pasteText) {
            this.insertAtSelection(pasteText);
            scrollSelectionIntoView();
            return;
        }
        const files = await getFilesFromDataTransferItems(clipboardData.items);
        if (files) {
            this.handlers.paste?.(files);
        }
    };
    onPaste = (handler) => {
        if (!this.handlers.paste) {
            this.element.addEventListener('paste', this.handlePaste);
        }
        this.handlers.paste = handler;
        return () => {
            this.handlers.paste = undefined;
            this.element.removeEventListener('paste', this.handlePaste);
        };
    };
    onKeyCombo = (handler) => {
        if (this.handlers.keyCombo && isDev) {
            throw new Error('Забыли отписаться от предыдущей подписки на keydown в ComposerEditor');
        }
        const handleKeyDown = onElementKeyDownFactory(handler);
        this.element.addEventListener('keydown', handleKeyDown);
        this.handlers.keyCombo = handler;
        return () => {
            this.handlers.keyCombo = undefined;
            this.element.removeEventListener('keydown', handleKeyDown);
        };
    };
    handleFocus = () => {
        this.handlers.focusChange?.(true);
    };
    handleBlur = () => {
        this.handlers.focusChange?.(false);
    };
    onFocusChange = (handler) => {
        if (!this.handlers.focusChange) {
            this.element.addEventListener('focus', this.handleFocus);
            this.element.addEventListener('blur', this.handleBlur);
        }
        this.handlers.focusChange = handler;
        return () => {
            this.handlers.focusChange = undefined;
            this.element.removeEventListener('focus', this.handleFocus);
            this.element.removeEventListener('blur', this.handleBlur);
        };
    };
    checkContentChanged = () => {
        const text = sanitizedText(this.getText());
        const { range } = getSelectionRange(this.element);
        if (!range) {
            return;
        }
        const textSelection = rangeToTextSelection(this.element, range);
        if (text === this.prevText &&
            textSelection.from === this.prevTextSelection.from &&
            textSelection.to === this.prevTextSelection.to) {
            return;
        }
        const shouldResetText = text === '\n' && this.prevText.length > 0;
        this.prevText = text;
        this.prevTextSelection = textSelection;
        /**
         * Хак для устранения проблемы с исчезанием
         * плейсхолдера после стирания текста, так
         * как браузеры сами вставляют переносы строк
         * в этом сценарии.
         * Также проверяем на наличие текста до этого,
         * чтобы сработал перенос строки когда композер
         * пустой.
         */
        if (shouldResetText) {
            this.resetText('');
            return;
        }
        this.handlers.contentChange.forEach((handler) => handler(text, textSelection));
    };
    onContentChange = (handler) => {
        if (this.handlers.contentChange.size === 0) {
            this.element.addEventListener('keyup', this.checkContentChanged);
            document.addEventListener('selectionchange', this.checkContentChanged);
        }
        this.handlers.contentChange.add(handler);
        return () => {
            this.handlers.contentChange.delete(handler);
            if (this.handlers.contentChange.size === 0) {
                this.element.removeEventListener('keyup', this.checkContentChanged);
                document.removeEventListener('selectionchange', this.checkContentChanged);
            }
        };
    };
    /**
     * При нажатии на эмодзи браузер ничего не делает, но нам нужно сделать так,
     * чтобы выставлялась каретка слева или справа от эмодзи
     * (в зависимости от того, к какой стороне ближе находился курсор)
     */
    handleMouseDown = (event) => {
        if (!(event.target instanceof HTMLImageElement)) {
            return;
        }
        const range = new Range();
        const selection = window.getSelection();
        if (!selection) {
            return;
        }
        range.selectNode(event.target);
        range.collapse(event.offsetX <= 8);
        selection.removeAllRanges();
        selection.addRange(range);
    };
    onMouseDown = () => {
        this.element.addEventListener('mousedown', this.handleMouseDown);
        return () => {
            this.element.removeEventListener('mousedown', this.handleMouseDown);
        };
    };
    setSelection = (textSelection) => {
        const { selection } = getSelectionRange(this.element);
        const { startContainer, startOffset, endContainer, endOffset } = textSelectionToRangeOffset(this.element, textSelection);
        const nextRange = document.createRange();
        nextRange.setStart(startContainer, startOffset);
        nextRange.setEnd(endContainer, endOffset);
        selection?.removeAllRanges();
        selection?.addRange(nextRange);
    };
    insertAtSelection = (insertText, textSelection) => {
        if (textSelection) {
            this.setSelection(textSelection);
        }
        const chunks = toTextAndEmojiChunks(escape(insertText));
        for (const chunk of chunks) {
            switch (chunk.kind) {
                case 'Text':
                    /**
                     * Необходимо дополнительно делать возврат декодированного текста, потому что при вставке через insertText
                     * после escape, спецсимволы (&<>'") будут вставлять "как есть", т.е. со сломанной кодировкой.
                     * Если вставлять через insertHtml, кодировка будет правильно, но не будет переноса строки,
                     * так как для корректного переноса, после \n должен идти контент.
                     */
                    document.execCommand('insertText', false, unescape(chunk.text));
                    break;
                case 'Emoji':
                    const emoji = createEmojiElement(chunk.text);
                    if (isTextNode(emoji)) {
                        document.execCommand('insertText', false, emoji.nodeValue || '');
                    }
                    else {
                        document.execCommand('insertHtml', false, emoji.outerHTML);
                    }
                    break;
                default:
                    exhaustivenessCheck(chunk);
            }
        }
        this.checkContentChanged();
    };
    removeFormat = () => {
        document.execCommand('removeFormat');
    };
    resetText = (text, isHtml = false, shouldFocus = true) => {
        const shouldBlurAfterExec = !this.isFocused() && (!shouldFocus || COMPOSER_AUTOFOCUS_DISABLED);
        this.element.innerText = '';
        const prevActiveElement = document.activeElement;
        const prevInputMode = this.element.inputMode;
        if (shouldBlurAfterExec) {
            this.element.inputMode = 'none';
        }
        /**
         * Фокусируем, чтобы команды document.execCommand отработали.
         * Если нам не нужно фокусировать композер, блюрим после
         * выполнения команд и возвращаем фокус туда, где он был.
         * https://jira.mvk.com/browse/ME-75441
         */
        this.element.focus();
        /** Если пользователь стёр весь текст, делаем так,
         * чтобы дальнейший ввод не наследовал формат первого слова прошлого текста
         * https://jira.mvk.com/browse/ME-66316
         */
        document.execCommand('removeFormat');
        if (isHtml) {
            document.execCommand('inserthtml', false, text);
        }
        else {
            this.insertAtSelection(sanitizedText(text || ''));
        }
        if (shouldBlurAfterExec) {
            this.element.blur();
            this.element.inputMode = prevInputMode;
            if (prevActiveElement &&
                'focus' in prevActiveElement &&
                typeof prevActiveElement.focus === 'function') {
                prevActiveElement.focus();
            }
        }
        this.checkContentChanged();
    };
    getText = () => {
        let text = '';
        const walker = document.createTreeWalker(this.element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            text += getRawNodeText(walker.currentNode);
        }
        return sanitizedText(text);
    };
    getHtml = () => {
        return this.element.innerHTML;
    };
    /** То же самое, что getHtml, но возвращает эмодзи в чистом виде, а не темплейтом из Emoji.tsx */
    getHtmlWithEmojisAsText = () => {
        const html = this.element.innerHTML;
        const emojiImageRegex = /<img class="Emoji .+?" src=".+?" alt=".+?">/;
        const emojiAltRegex = /alt=".+?"/;
        function replaceEmojiHtmlToText(messageHtml) {
            const matches = messageHtml.match(emojiImageRegex);
            if (!matches || !matches[0]) {
                return messageHtml;
            }
            const emojiMatches = matches[0].match(emojiAltRegex);
            if (!emojiMatches || !emojiMatches[0]) {
                return messageHtml;
            }
            const emojiAlt = emojiMatches[0].replace('alt=', '').replaceAll('"', '');
            return replaceEmojiHtmlToText(messageHtml.replace(matches[0], emojiAlt));
        }
        return replaceEmojiHtmlToText(html);
    };
    getElement() {
        return this.element;
    }
    focus = (collapseToStart = false) => {
        if (this.isFocused()) {
            return;
        }
        this.element.focus();
        const { selection } = getSelectionRange(this.element);
        if (!selection) {
            return;
        }
        selection.selectAllChildren(this.element);
        if (collapseToStart) {
            selection.collapseToStart();
        }
        else {
            selection.collapseToEnd();
        }
        scrollSelectionIntoView();
    };
    isFocused = () => {
        return document.activeElement === this.element;
    };
    setDisabled = (isDisabled) => {
        this.element.contentEditable = isDisabled ? 'false' : 'true';
    };
}
const sanitizedText = (text) => {
    return text.replace(/&nbsp;/gi, ' ').replace(/<br\s*\/?>/gi, '\n');
};
/**
 * Этот символ не занимает места, но он требует дополнительного нажатия backspace
 * для удаления строки или arrow-клавиши для перехода.
 */
export const ZWJ = '\u2060';
export const sanitizeText = (text) => text
    .replace(RegExp(ZWJ, 'gmi'), '')
    .replace(/^\n{2,}/gim, '\n')
    .trim();
export const getSelectionRange = (root) => {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return {};
    }
    const range = selection.getRangeAt(0);
    if (range && root.contains(range.commonAncestorContainer)) {
        return { range, selection };
    }
    return {};
};
const rangeToTextSelection = (root, range) => {
    const { collapsed } = range;
    const from = rangeBoundToLocation(root, range.startContainer, range.startOffset);
    const to = collapsed
        ? from
        : rangeBoundToLocation(root, range.endContainer, range.endOffset);
    return { from, to };
};
const rangeBoundToLocation = (root, boundNode, pos) => {
    let result = pos;
    if (root === boundNode) {
        result = 0;
        boundNode = root.childNodes[pos];
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        if (walker.currentNode === boundNode) {
            return result;
        }
        result += getRawNodeText(walker.currentNode).length;
    }
    return result;
};
const textSelectionToRangeOffset = (root, textSelection) => {
    const { container: startContainer, offset: startOffset } = locationToRangeBound(root, textSelection.from);
    const { container: endContainer, offset: endOffset } = locationToRangeBound(root, textSelection.to);
    return {
        startContainer,
        startOffset,
        endContainer,
        endOffset,
    };
};
const locationToRangeBound = (root, pos) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const nodeLen = getRawNodeText(walker.currentNode).length;
        if (nodeLen >= pos) {
            if (isElementNode(walker.currentNode) &&
                walker.currentNode.nodeName === 'BR') {
                pos -= 1;
            }
            return {
                container: walker.currentNode,
                offset: Math.max(pos, 0),
            };
        }
        pos -= nodeLen;
    }
    return {
        container: root,
        offset: root.childNodes.length,
    };
};
const getRawNodeText = (node) => {
    if (isTextNode(node)) {
        return node.nodeValue || '';
    }
    if (isElementNode(node) && node.nodeName === 'IMG') {
        return node.getAttribute('alt') || '';
    }
    /**
     * safari и chrome при вводе переноса строки в div[contenteditable] ведут себя по-разному.
     *
     * Пример:
     * 1) ввести "текст"
     * 2) сделать перенос строки Shift + Enter
     *
     * Итог chrome:
     * "текст\n\n"
     * Итог safari:
     * "текст"
     * <div><br/><div>
     * Итог ubuntu Firefox:
     * "текст"
     * <br/>
     *
     * 3) ввести "другой текст"
     *
     * Итог chrome:
     * "текст\nдругой текст"
     * Итог safari:
     * "текст"
     * <div>другой текст<div>
     * Итог ubuntu Firefox:
     * "текст"
     * <br/>
     * "другой текст"
     *
     * Пример 2:
     *
     * 1) вставить текст (копипаста)
     * 2) перевести каретку на новую строку
     * 3) вставить текст (копипаста)
     *
     * Итог chrome:
     * "Вставить текст и сделать отступ."
     * "Вставить текст и сделать отступ."
     * Итог safari:
     * "текст"
     * <div>"Вставить текст и сделать отступ."<br/><div>
     * <div>"Вставить текст и сделать отступ."<br/><div>    (в конце зачем-то выставляется <br/>)
     * Итог ubuntu Firefox:
     * "Вставить текст и сделать отступ."
     * <br/>
     * "Вставить текст и сделать отступ."
     *
     * В chrome последний \n затирается новой текстовой нодой, а в safari затирается <br/> внутри <div>.
     * Так как <div> блочный элемент, то априори выставим перед ним перенос строки \n.
     * Следовательно исключаем из обработки тег <br/> если он находится внутри тега <div/>.
     *
     * Итого: в хроме (фаерфокс, опера, edge) нет никаких <div/> и <br/>, а есть только \n,
     * в сафари - если есть перенос строки, то обязательно будет <div/>, но не обязательно будет <br/>,
     * а в убунту в фаерфокс не будет <div/> , но будет <br/>. Итак что 'DIV',  что 'BR' должны обрабатываться
     * как перенос строки, но 'BR' внутри 'DIV' переносом строки не считается (но надо помнить, что в ubuntu Firefox 'BR' внутри div[contenteditable] учитываться должен).
     */
    if (isElementNode(node) && node.nodeName === 'DIV') {
        return '\n';
    }
    if (isElementNode(node) &&
        node.nodeName === 'BR' &&
        !((node.parentElement &&
            isElementNode(node.parentElement) &&
            node.parentElement.nodeName === 'DIV' &&
            !(node.parentElement.getAttribute('contenteditable') === 'true')) // иначе пропкстим <br/> в убунту в фаерфокс
        )) {
        return '\n';
    }
    return '';
};
const isTextNode = (node) => {
    return node.nodeType === Node.TEXT_NODE;
};
const isElementNode = (node) => {
    return node.nodeType === Node.ELEMENT_NODE;
};
// найдено на просторах стэковерфлоу
// https://stackoverflow.com/questions/47361276/javascript-scroll-to-cursor-post-a-paste-in-contenteditable-div
function scrollSelectionIntoView() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
        return;
    }
    const firstRange = selection.getRangeAt(0);
    if (firstRange.commonAncestorContainer === document) {
        return;
    }
    const container = firstRange.commonAncestorContainer.parentElement;
    if (!container) {
        return;
    }
    const containerBoundingClientRect = container.getBoundingClientRect();
    const firstRangeBoundingClientRect = firstRange.getBoundingClientRect();
    const delta = firstRangeBoundingClientRect.bottom - containerBoundingClientRect.bottom;
    if (delta > 0) {
        container.scrollBy({ top: delta });
    }
    return;
}
//# sourceMappingURL=ComposerEditor.js.map