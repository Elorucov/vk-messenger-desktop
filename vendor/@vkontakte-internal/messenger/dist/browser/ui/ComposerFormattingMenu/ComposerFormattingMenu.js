import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { Icon16Clear, Icon20Chain, Icon20CheckAlt, Icon20TextBoldOutline, Icon20TextItalicOutline, 
// Icon20TextStrikethroughOutline,
Icon20TextUnderlineOutline, Icon24ChevronLeftSmallOutline, Icon20ClearDataOutline, } from '@vkontakte/icons';
import cx from 'classnames';
import './ComposerFormattingMenu.css';
import { Button, Separator } from '@vkontakte-internal/vkcom-kit';
import { isValidUrl } from '../../../core/utils/misc';
import { useBrowserEnv } from '../../hooks/misc';
import { browser } from '../../utils/misc';
import { LayerPortal } from '../../ui/Layer/Layer';
import { useRouter } from '../../ui/Router/Router';
export const ComposerFormattingMenu = memo(({ composerFormatting, root, withLinkPreview }) => {
    const { lang } = useBrowserEnv();
    const { modal, rightPanel } = useRouter();
    const $linkInput = useRef(null);
    const [link, setLink] = useState(composerFormatting.linkUrl);
    const [coords, setCoords] = useState(null);
    const [position, setPosition] = useState({
        opacity: 0,
    });
    const [selectionString, setSelectionString] = useState('');
    const [node, setNode] = useState(null);
    const isVisible = !modal &&
        !rightPanel &&
        selectionString.trim() &&
        !composerFormatting.isForciblyClosed;
    const submitLink = useCallback(() => {
        composerFormatting.link(link);
        composerFormatting.closeLinkInput();
    }, [composerFormatting, link]);
    const resetLink = useCallback(() => {
        composerFormatting.link('');
        setLink('');
        $linkInput.current?.focus();
    }, [composerFormatting]);
    const onSelectionChange = useCallback((e) => {
        const s = document.getSelection();
        /**
         * Фикс для Safari https://jira.mvk.com/browse/ME-66297
         * Прилетает некорректный selection со всеми пустыми полями и типом "None"
         * и распознается в дальнейшем коде как клик outside, что приводит к закрытию меню
         */
        if (s?.type === 'None') {
            return;
        }
        if (s && root && root.contains(s.anchorNode)) {
            if (e.target === $linkInput.current) {
                return;
            }
            // Выделение внутри композера -> открываем тултип
            const coords = getCoords(s, root);
            setCoords(coords);
            setSelectionString(s?.toString() || '');
            setLink('');
            composerFormatting.init();
        }
        else if (s && node && node.contains(s.anchorNode)) {
            // Выделение внутри меню форматирования -> ничего не делаем
            return;
        }
        else {
            // Клик outside -> закрываем тултип
            composerFormatting.reset();
            setSelectionString('');
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [root, node]);
    const openLinkInput = useCallback(async () => {
        composerFormatting.openLinkInput();
        if (composerFormatting.linkUrl) {
            setLink(composerFormatting.linkUrl);
        }
        else {
            try {
                /**
                 * Подставляем текст из буффера, если он является валидной ссылкой
                 *
                 * На всякий случай кэтчим возможные ошибки, так как обращаемся к браузерному АПИ
                 * и по сути не конктролируем его поведение и возвращаемое значение
                 * */
                /**
                 * В указанных браузерах автоподставление не делаем, так как в них
                 * оно приводит к нежелательному поведению интерфейса
                 */
                if (browser.firefox || browser.safari) {
                    return;
                }
                const text = await navigator.clipboard.readText();
                if (isValidUrl(text)) {
                    setLink(text);
                }
            }
            catch {
                // Не признаемся пользователю, что пытались подставить что-то из буффера, но не смогли
            }
        }
    }, [composerFormatting]);
    const backFromLinkInput = useCallback(() => {
        if (!link) {
            resetLink();
        }
        composerFormatting.backFromLinkInput();
    }, [link, composerFormatting, resetLink]);
    const canSubmitLink = isValidUrl(link);
    const ref = useCallback((node) => {
        setNode(node);
    }, []);
    useEffect(() => {
        document.addEventListener('selectionchange', onSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', onSelectionChange);
        };
    }, [onSelectionChange]);
    useLayoutEffect(() => {
        if (!node || !coords) {
            setPosition({ opacity: 0 });
            return;
        }
        /**
         * 44 - ширина submit-кнопки
         * 4 - расстояние до submit-кнопки
         */
        const menuWidth = 44 + 4 + node.clientWidth;
        setPosition({
            top: coords.y,
            left: coords.x + menuWidth >= window.innerWidth
                ? window.innerWidth - menuWidth
                : coords.x,
            opacity: 1,
        });
    }, [node, coords, composerFormatting.isLinkInputOpen]);
    const pointerClassName = 'ComposerFormattingMenu--pointerNone';
    useEffect(() => {
        if (!node)
            return;
        const onPressed = (e) => {
            /**
             * если зажата ЛКМ и мы завели курсор на меню форматирования,
             * делаем его pointer-events: none;
             **/
            if ((e.buttons & 1) !== 0 &&
                !node.classList.contains(pointerClassName)) {
                node.classList.add(pointerClassName);
                const off = () => {
                    node.classList.remove(pointerClassName);
                    window.removeEventListener('pointerup', off, true);
                    window.removeEventListener('pointercancel', off, true);
                };
                window.addEventListener('pointerup', off, true);
                window.addEventListener('pointercancel', off, true);
            }
        };
        node.addEventListener('pointerenter', onPressed, true);
        return () => {
            node.classList.remove(pointerClassName);
            node.removeEventListener('pointerenter', onPressed, true);
        };
    }, [node]);
    return (React.createElement(LayerPortal, null,
        React.createElement("div", { ref: ref, className: "ComposerFormattingMenu", style: {
                ...position,
                display: isVisible ? 'flex' : 'none',
            } },
            !composerFormatting.isLinkInputOpen && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: cx('ComposerFormattingMenu__panel') },
                    React.createElement("button", { title: lang.use('me_composer_formatting_menu_bold_title'), className: cx('ComposerFormattingMenu__button', {
                            'ComposerFormattingMenu__button--active': composerFormatting.isBold,
                        }), onClick: composerFormatting.bold },
                        React.createElement(Icon20TextBoldOutline, null)),
                    React.createElement("button", { title: lang.use('me_composer_formatting_menu_italic_title'), className: cx('ComposerFormattingMenu__button', {
                            'ComposerFormattingMenu__button--active': composerFormatting.isItalic,
                        }), onClick: composerFormatting.italic },
                        React.createElement(Icon20TextItalicOutline, null)),
                    React.createElement("button", { title: lang.use('me_composer_formatting_menu_underlined_title'), className: cx('ComposerFormattingMenu__button', {
                            'ComposerFormattingMenu__button--active': composerFormatting.isUnderlined,
                        }), onClick: composerFormatting.underline },
                        React.createElement(Icon20TextUnderlineOutline, null)),
                    React.createElement(Separator, { direction: "vertical" }),
                    composerFormatting.linkUrl && withLinkPreview ? (React.createElement("button", { className: "ComposerFormattingMenu__linkPreview", onClick: openLinkInput },
                        React.createElement(Icon20Chain, { className: "ComposerFormattingMenu__linkPreviewIcon" }),
                        React.createElement("span", { className: "ComposerFormattingMenu__linkPreviewText" }, composerFormatting.linkUrl))) : (React.createElement("button", { title: lang.use('me_composer_formatting_menu_link_title'), className: cx('ComposerFormattingMenu__button', {
                            'ComposerFormattingMenu__button--active': composerFormatting.isLink,
                        }), onClick: openLinkInput },
                        React.createElement(Icon20Chain, null)))),
                composerFormatting.isResettableFormatApplied && (React.createElement("div", { className: cx('ComposerFormattingMenu__panel') },
                    React.createElement("button", { title: lang.use('me_composer_formatting_clear_title'), className: "ComposerFormattingMenu__button", onClick: composerFormatting.clear },
                        React.createElement(Icon20ClearDataOutline, null)))))),
            composerFormatting.isLinkInputOpen && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: cx('ComposerFormattingMenu__panel', 'ComposerFormattingMenu__linkInputPanel') },
                    React.createElement("button", { "aria-label": lang.use('global_back'), className: "ComposerFormattingMenu__linkBackButton", onClick: backFromLinkInput },
                        React.createElement(Icon24ChevronLeftSmallOutline, null)),
                    React.createElement("input", { ref: $linkInput, className: "ComposerFormattingMenu__linkInput", autoFocus: true, type: "text", placeholder: "https://example.com", value: link, onChange: (e) => setLink(e.target.value) }),
                    link.length > 0 && (React.createElement("button", { "aria-label": lang.use('global_cancel'), className: "ComposerFormattingMenu__linkClearButton", onClick: resetLink },
                        React.createElement(Icon16Clear, null)))),
                canSubmitLink && (React.createElement("div", { className: cx('ComposerFormattingMenu__panel', 'ComposerFormattingMenu__linkSubmitPanel') },
                    React.createElement(Button, { "aria-label": lang.use('me_accept'), className: "ComposerFormattingMenu__linkSubmitButton", before: React.createElement(Icon20CheckAlt, null), onClick: submitLink }))))))));
});
const getCoords = (selection, root) => {
    if (!selection?.rangeCount || !selection.toString()) {
        return null;
    }
    const range = adjustRange(selection.getRangeAt(0).cloneRange());
    const selectionRect = range.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    /**
     * Не даем меню улететь наверх, если выделение не умещается
     * в видимой части композера.
     */
    const y = Math.max(selectionRect.y, rootRect.y);
    const viewportTop = window.visualViewport?.pageTop || 0;
    return {
        x: selectionRect.x,
        y: y + viewportTop - getLineBreaksAtStartYOffset(range),
    };
};
/** Хак для Firefox: https://stackoverflow.com/a/21234837 */
function adjustRange(data) {
    const range = data.cloneRange();
    if (range.startContainer.nodeType !== 3) {
        const nodeAfterStart = range.startContainer.childNodes[range.startOffset];
        if (nodeAfterStart && nodeAfterStart.nodeType === 3) {
            range.setStart(nodeAfterStart, 0);
        }
    }
    if (range.endContainer.nodeType !== 3 && range.endOffset >= 1) {
        const nodeBeforeEnd = range.endContainer.childNodes[range.endOffset - 1];
        if (nodeBeforeEnd && nodeBeforeEnd.nodeType === 3) {
            range.setEnd(nodeBeforeEnd, nodeBeforeEnd.data.length);
        }
    }
    return range;
}
const DEFAULT_LINE_HEIGHT = 20;
/**
 * Добавляемый к y-координате отступ, учитывающий переносы
 * строки в начале выделения в случае, если этого не делает
 * браузер.
 * См. https://jira.mvk.com/browse/ME-73617 .
 */
function getLineBreaksAtStartYOffset(range) {
    const lineBreaksCountAtStart = [...range.toString()].findIndex((char) => char !== '\n');
    /**
     * Если выделение начинается не с переносов строки, то ничего
     * не делаем.
     */
    if (lineBreaksCountAtStart <= 0) {
        return 0;
    }
    const rect = range.getBoundingClientRect();
    const clonedRange = range.cloneRange();
    clonedRange.setStart(clonedRange.startContainer, range.startOffset + 1);
    const clonedRangeRect = clonedRange.getBoundingClientRect();
    const isLineBreakRectHandled = clonedRangeRect.y !== rect.y;
    /**
     * Если браузер учитывает перенос строки в начале выделения при
     * расчете координат, то нам не нужно ничего делать.
     */
    if (isLineBreakRectHandled) {
        return 0;
    }
    const element = range.startContainer.parentElement;
    const lineHeight = element
        ? Number.parseInt(getComputedStyle(element).lineHeight)
        : DEFAULT_LINE_HEIGHT;
    return lineBreaksCountAtStart * lineHeight;
}
//# sourceMappingURL=ComposerFormattingMenu.js.map