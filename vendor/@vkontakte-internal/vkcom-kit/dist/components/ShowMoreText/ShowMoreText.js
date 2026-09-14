import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames, debounce, noop } from '@vkontakte/vkjs';
import { useExternRef, useStableCallback, useSyncUpdateEffect } from '@vkontakte-internal/react-utils';
import { useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { TextClamp } from '../TextClamp/TextClamp';
import styles from './ShowMoreText.module.css';
const modeModifiersMap = {
    block: undefined,
    inline: styles.rootInline,
};
const BLUR_SIZE = 50;
const BLUR_DYNAMIC_SIZE = 20;
export const ShowMoreText = ({ getRef, mode, lines = 0, dynamic, expanded: expandedProp, expandElement, collapseElement, children, className, onExpandChange, expandOnTextClick, onHasOverflowChange, ['data-testid']: testId = 'showmoretext', TypographyComponent, noExpandOnFocusWithin, ...restProps }) => {
    const textRef = useExternRef(getRef);
    const wrapperRef = useRef(null);
    const inRef = useRef(null);
    const afterRef = useRef(null);
    const textClickedRef = useRef(false);
    const [expanded, setExpanded] = useState(expandedProp);
    const [afterLeft, setAfterLeft] = useState();
    const [afterWidth, setAfterWidth] = useState(0);
    const [afterHeight, setAfterHeight] = useState(0);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [textMaxHeight, setTextMaxHeight] = useState('unset');
    const onExpandChangeStable = useStableCallback(onExpandChange ?? noop);
    const onHasOverflowChangeStable = useStableCallback(onHasOverflowChange ?? noop);
    const clickHandler = () => {
        textClickedRef.current = true;
    };
    const focusHandler = () => {
        if (noExpandOnFocusWithin) {
            return;
        }
        if (expanded) {
            return;
        }
        if (!textClickedRef.current) {
            setExpanded(true);
        }
        else {
            textClickedRef.current = false;
        }
    };
    const afterClickHandler = () => {
        if (expandedProp !== undefined) {
            return;
        }
        setExpanded((prev) => !prev);
    };
    useSyncUpdateEffect(() => {
        setExpanded(expandedProp);
    }, [expandedProp]);
    useEffect(() => {
        onExpandChangeStable(!!expanded);
    }, [onExpandChangeStable, expanded]);
    useEffect(() => {
        if (dynamic && hasOverflow && !expanded) {
            const { height: afterElHeight = 0 } = afterRef.current?.getBoundingClientRect() || {};
            const { height: wrapperHeight = 0 } = wrapperRef.current?.getBoundingClientRect() || {};
            setTextMaxHeight(wrapperHeight - afterElHeight);
        }
        else {
            setTextMaxHeight('unset');
        }
    }, [hasOverflow, dynamic, expanded]);
    useLayoutEffect(() => {
        const onResize = () => {
            const wrapperContainer = wrapperRef.current;
            const inContainer = inRef.current;
            const textContainer = textRef.current;
            const afterContainer = afterRef.current;
            if (!inContainer || !textContainer) {
                return;
            }
            if (dynamic && wrapperContainer?.parentElement) {
                const { height: textHeight } = textContainer.getBoundingClientRect();
                const { height: wrapperHeight } = wrapperContainer.getBoundingClientRect();
                const newHasOverflow = textHeight > wrapperHeight;
                setHasOverflow(newHasOverflow);
                onHasOverflowChangeStable(newHasOverflow);
                const { width = 0, height = 0 } = afterContainer?.getBoundingClientRect() || {};
                setAfterWidth(width);
                setAfterHeight(height);
                return;
            }
            const linesRects = getRectsByLines(textContainer);
            const linesEndRects = getRectsByLinesEnd(linesRects);
            const containerHeightByRects = getContainerHeightByRects(linesEndRects);
            const newHasOverflow = (lines > 1 ? linesEndRects.length : uniqueRects(linesRects).length) > lines ||
                containerHeightByRects > textContainer.getBoundingClientRect().height;
            setHasOverflow(newHasOverflow);
            onHasOverflowChangeStable(newHasOverflow);
            if (expanded) {
                return;
            }
            const { width = 0, height = 0 } = afterContainer?.getBoundingClientRect() || {};
            setAfterWidth(width);
            setAfterHeight(height);
            if (!lines || lines >= linesEndRects.length) {
                return;
            }
            // Ширина элемента на следующей строчке нулевая, смещаемся на его место
            if (lines > 1 && !linesEndRects[lines - 2].width && !linesEndRects[lines - 1].width) {
                setAfterLeft(0);
                return;
            }
            // Элемент не влезает по ширине в строчку, рендеримся поверх
            if (!width || linesEndRects[lines - 1].width + width > inContainer.offsetWidth) {
                setAfterLeft(undefined);
                return;
            }
            const rect = linesEndRects[lines - 1];
            // Элемент влезает по ширине в строчку, но текст в строчке меньше длинны блюра
            if (rect.position === 1 && rect.width < BLUR_SIZE) {
                setAfterLeft(0);
                return;
            }
            // Элемент влезает по ширине в строчку, после последнего символа
            setAfterLeft(linesEndRects[lines - 1].width);
        };
        const onResizeDebounced = debounce(onResize, 50);
        onResize();
        window.addEventListener('resize', onResizeDebounced);
        return () => {
            window.removeEventListener('resize', onResizeDebounced);
        };
    }, [textRef, dynamic, onHasOverflowChangeStable, lines, expandElement, expanded, children, hasOverflow]);
    const style = {
        '--show-more-text-blur-size': `${BLUR_SIZE}px`,
        '--show-more-text-blur-dynamic-size': `${BLUR_DYNAMIC_SIZE}px`,
        '--show-more-text-after-left': `${afterLeft ?? 0}px`,
        '--show-more-text-after-width': `${afterWidth}px`,
        '--show-more-text-after-height': `${afterHeight}px`,
    };
    const after = expanded ? collapseElement : hasOverflow && expandElement;
    const isInteractive = expandOnTextClick && hasOverflow && !expanded;
    return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    _jsxs("div", { "data-testid": testId, onClick: isInteractive ? () => setExpanded(true) : undefined, ref: wrapperRef, className: classNames(styles.root, modeModifiersMap[mode], expanded && styles.rootExpanded, dynamic && styles.rootDynamic, hasOverflow && styles.rootHasAfter, isInteractive && styles.rootInteractive, lines === 1 && styles.rootSingleLine, afterLeft !== undefined && styles.rootAfterLeft, className), style: style, ...restProps, children: [_jsx(TextClamp, { "data-testid": `showmoretext-in${expanded ? `-expanded` : ''}`, getRootRef: inRef, className: styles.in, lines: expanded || dynamic ? 0 : lines, style: { maxHeight: textMaxHeight }, TypographyComponent: TypographyComponent, children: _jsx("div", { ref: textRef, className: styles.text, onMouseDownCapture: clickHandler, onTouchStartCapture: clickHandler, onKeyUpCapture: focusHandler, onKeyDownCapture: focusHandler, children: children }) }), Boolean(after) && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            _jsx("div", { "data-testid": "showmoretext-after", ref: afterRef, onClick: afterClickHandler, style: { left: afterLeft }, className: styles.after, children: after }))] }));
};
function getRectsByLines(container) {
    const range = document.createRange();
    range.selectNodeContents(container);
    const rects = range.getClientRects();
    return [...rects];
}
function uniqueRects(rects) {
    const uniqueKeys = new Set();
    return rects.filter((rect) => {
        const rectKey = `${rect.top}-${rect.left}-${rect.right}-${rect.bottom}`;
        if (uniqueKeys.has(rectKey)) {
            return false;
        }
        uniqueKeys.add(rectKey);
        return true;
    });
}
function getRectsByLinesEnd(rects) {
    if (!rects.length)
        return [];
    const lineEndRects = {};
    const usedRectKeys = new Set();
    for (const rect of rects) {
        let rectKey = String(Math.floor(rect.top));
        // Иногда один и тот же rect возвращает значение top +-2px, поэтому приводим к исходному значению
        if (!usedRectKeys.has(rectKey)) {
            [1, 2, -1, -2].forEach((offset) => {
                if (usedRectKeys.has(String(+rectKey + offset))) {
                    rectKey = String(+rectKey + offset);
                }
            });
        }
        usedRectKeys.add(rectKey);
        const endRect = (lineEndRects[rectKey] ??= rect);
        if (rect.left >= endRect.left && rect.width >= endRect.width) {
            rect.position ||= 0;
            rect.position++;
            lineEndRects[rectKey] = rect;
        }
    }
    return Object.values(lineEndRects);
}
function getContainerHeightByRects(rects) {
    if (!rects.length) {
        return 0;
    }
    return Math.floor(rects[rects.length - 1].y - rects[0].y);
}
//# sourceMappingURL=ShowMoreText.js.map