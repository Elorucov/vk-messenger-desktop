import '../../ui/MarusiaSuggests/MarusiaSuggests.css';
import { useBrowserEnv } from '../../hooks/misc';
import React, { useCallback, useEffect, useRef, useState, } from 'react';
import cx from 'classnames';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
export const MarusiaSuggests = ({ isCompactView, instanceId, }) => {
    const { marusia } = useBrowserEnv();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const [suggests, setSuggests] = useState([]);
    const containerRef = useRef(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const canvasRef = useRef(null);
    const handleSuggestClick = useCallback((suggest) => {
        marusia?.handleAction({
            type: 'click_suggest',
            payload: { suggest, instanceId },
        });
    }, [marusia, instanceId]);
    const handleMoreClick = useCallback(() => {
        setIsCollapsed(false);
    }, [setIsCollapsed]);
    useEffect(() => {
        const container = containerRef.current;
        const onWheel = (e) => {
            if (!container) {
                return;
            }
            e.preventDefault();
            if (e.deltaX === 0) {
                container.scrollLeft += e.deltaY;
            }
            else {
                container.scrollLeft += e.deltaX;
            }
        };
        container?.addEventListener('wheel', onWheel);
        return () => container?.removeEventListener('wheel', onWheel);
    }, []);
    useEffect(() => {
        const unsubscribe = marusia?.subscribe((e) => {
            if (e.type === 'suggest_list_update') {
                if (containerRef.current) {
                    containerRef.current.scrollLeft = 0;
                }
                setSuggests(e.payload.suggests);
            }
        });
        return () => unsubscribe?.();
    }, [marusia]);
    const collapsedSuggests = isCompactView || !isCollapsed
        ? suggests
        : collapse(suggests, containerRef.current, canvasRef);
    return (React.createElement("div", { className: cx('MarusiaSuggests', {
            'MarusiaSuggests--visible': suggests.length > 0,
            'MarusiaSuggests--compact': isCompactView,
            'MarusiaSuggests--withoutBubbles': isWithoutBubblesTheme,
        }) },
        React.createElement("div", { className: "MarusiaSuggests__wrapper", ref: containerRef },
            collapsedSuggests.map((s) => s.type === 'more' ? (React.createElement(ShowMoreSuggest, { key: "more", onClick: handleMoreClick })) : (React.createElement(Suggest, { key: s.text, suggest: s, onClick: handleSuggestClick }))),
            isCompactView && React.createElement("span", { className: "MarusiaSuggests__space" }))));
};
const ShowMoreSuggest = ({ onClick, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "MarusiaSuggests__item", onClick: onClick }, lang.use('me_marusia_suggest_show_more')));
};
const Suggest = ({ suggest, onClick, }) => {
    const handleClick = useCallback(() => {
        onClick(suggest);
    }, [suggest, onClick]);
    return (React.createElement("div", { className: "MarusiaSuggests__item", onClick: handleClick }, replaceSpecialPhrases(suggest.text)));
};
const MORE_SUGGEST_W = 115 + 8;
const SUGGEST_ITEM_MULTIPLIER = 7;
const SUGGEST_PADDING = 34; // padding + gap + border
function getTextWidth(text, canvas, container) {
    const context = canvas.getContext('2d');
    if (!context) {
        return text.length * SUGGEST_ITEM_MULTIPLIER;
    }
    context.font = getContainerFont(container);
    const metrics = context.measureText(text);
    return metrics.width;
}
function getSuggestWidthPx(c, canvas, container) {
    return getTextWidth(c.text, canvas, container) + SUGGEST_PADDING;
}
function collapse(suggests, container, canvasRef) {
    if (!container || suggests.length === 0) {
        return suggests;
    }
    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const containerWidth = container.offsetWidth;
    let rowWidth = containerWidth;
    let rowNum = 3;
    const shortened = [];
    let allCommandsFit = true;
    suggests.forEach((s) => {
        if (rowNum === 0) {
            allCommandsFit = false;
            return;
        }
        const curWidth = getSuggestWidthPx(s, canvas, container);
        rowWidth -= curWidth;
        if (rowWidth >= 0) {
            shortened.push(s);
        }
        else {
            rowNum -= 1;
            if (rowNum === 0) {
                allCommandsFit = false;
                return;
            }
            if (rowNum === 1) {
                rowWidth = containerWidth - curWidth - MORE_SUGGEST_W;
            }
            else {
                rowWidth = containerWidth - curWidth;
            }
            if (rowWidth >= 0) {
                shortened.push(s);
            }
        }
    });
    if (!allCommandsFit) {
        shortened.push({ type: 'more' });
    }
    return shortened;
}
function getContainerFont(suggestList) {
    if (!suggestList) {
        return '';
    }
    const computedStyle = getComputedStyle(suggestList);
    const fontWeight = computedStyle.getPropertyValue('font-weight');
    const fontSize = computedStyle.getPropertyValue('font-size');
    const fontFamily = computedStyle.getPropertyValue('font-family');
    return `${fontWeight} ${fontSize} ${fontFamily}`;
}
function replaceSpecialPhrases(text) {
    return text
        .replace('#DISLIKE#', '\uD83D\uDC4E\uD83C\uDFFB')
        .replace('#LIKE#', '\uD83D\uDC4D\uD83C\uDFFB');
}
//# sourceMappingURL=MarusiaSuggests.js.map