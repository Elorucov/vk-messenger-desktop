import '../../ui/Highlighter/Highlighter.css';
import React, { memo, useMemo } from 'react';
import { applyCombinedFuzzyAndExactSearch, applyFuzzySearch, doExactSearch, doVariativeSearch, } from './search';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import cx from 'classnames';
const DEFAULT_SEARCH_STRATEGY = 'fuzzy_and_exact';
export const HIGHLIGHTER_STYLES_ACCENT = {
    highlightColor: 'var(--vkui--color_background_accent_themed)',
    highlightColorOpacity: 0.2,
};
export const HIGHLIGHTER_STYLES_TERTIARY = {
    highlightColor: 'var(--vkui--color_background_tertiary)',
    highlightColorOpacity: 1,
};
export const Highlighter = memo(({ text, search, strategy = DEFAULT_SEARCH_STRATEGY, highlightColor, highlightColorOpacity, }) => {
    const searchResult = useMemo(() => {
        switch (strategy) {
            case 'fuzzy':
                return applyFuzzySearch(text, search);
            case 'fuzzy_and_exact':
                return applyCombinedFuzzyAndExactSearch(text, search);
            case 'exact':
                return doExactSearch({ content: text, search });
            case 'variative':
                return doVariativeSearch({ content: text, search });
            default:
                return exhaustivenessCheck(strategy);
        }
    }, [text, search, strategy]);
    return (React.createElement(HighlighterRenderer, { searchResult: searchResult, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity }));
});
export const HighlighterRenderer = ({ searchResult, highlightColor, highlightColorOpacity }) => {
    return (React.createElement(React.Fragment, null, searchResult.map((el, i) => {
        const { type, text } = el;
        const key = i + text + type;
        return type === 'search_match' ? (React.createElement(HighlighterMark, { key: key, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity }, text)) : (text);
    })));
};
export const HighlighterMark = ({ children, 
/**
 * По умолчанию используем цвет VKUI и opacity=0.2
 * так сделано по дизайну
 */
highlightColor = 'var(--vkui--color_background_accent_themed)', highlightColorOpacity = 0.2, }) => {
    const colorWithOpacity = highlightColorOpacity < 1;
    return (React.createElement("mark", { className: cx('highlighted', {
            'highlighted--withOpacity': colorWithOpacity,
        }), style: {
            ...{
                backgroundColor: colorWithOpacity ? 'transparent' : highlightColor,
            },
            ...{
                '--highlightColor': highlightColor,
                '--highlightColorOpacity': highlightColorOpacity,
            },
        } }, children));
};
//# sourceMappingURL=Highlighter.js.map