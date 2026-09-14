import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}],"Icon16Search":["@vkontakte/icons",{"className":1}],"input":["global",{"className":1}],"Icon24Filter":["@vkontakte/icons",{"className":1}],"Icon24Cancel":["@vkontakte/icons",{"className":1}]} */
import { useCallback, useRef } from 'react';
import { Icon24Filter, Icon16Search, Icon24Cancel } from '@vkontakte/icons';
import { Button, Spinner, Popover, Div } from '@vkontakte-internal/vkcom-kit';
import { Token } from '../Token/Token';
import { classNames as cx } from '@vkontakte/vkjs';
import { useLang } from '../../hooks/useLang';
export const SearchBar = ({ loading, dropdownRows, tokens, onDeleteToken, onClearFilters, setText, text, }) => {
    const { getLang } = useLang();
    const inputRef = useRef(null);
    const onClearText = useCallback(() => {
        setText('');
        inputRef.current?.focus();
    }, []);
    const onChangeText = useCallback((e) => {
        setText(e.target.value);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "CallsSearchBar", children: [_jsx(Icon16Search, { className: "CallsSearchBarLoupIcon" }), _jsx("input", { ref: inputRef, className: "CallsSearchBar__input", "data-testid": "calls_watch_together_search_field", type: "text", value: text, onChange: onChangeText, placeholder: getLang('calls_movie_player_search') }), !!text && (_jsx(Popover, { placement: "bottom-end", content: ({ onClose }) => (_jsx(Div, { children: dropdownRows.map((item, i) => (_jsx(Div, { mode: "vertical", paddingBottom: 8, paddingTop: 8, onClick: () => (item.onClick ? (onClose(), item.onClick()) : undefined), onMouseDown: () => (item.onClick ? (onClose(), item.onClick()) : undefined), children: item.text }, typeof item.id !== 'undefined' ? item.id : i))) })), children: _jsx("div", { className: cx('CallsSearchBar__input__settings', {
                                ['CallsSearchBar__input__settings--invisible']: loading,
                            }), "data-testid": "calls_watch_together_search_filters", children: _jsx(Icon24Filter, { className: "CallsSearchBarIcon" }) }) })), text && !loading && (_jsx(Icon24Cancel, { "data-testid": "calls_watch_together_search_clear", className: "CallsSearchBarIcon", onClick: onClearText })), loading && _jsx(Spinner, { stretched: false })] }), !!text && !!tokens.length && (_jsxs("div", { className: "CallsSearchBar__filters", children: [_jsx("div", { className: "CallsSearchBar__filters__tokens", children: tokens.map((token) => (_jsx(Token, { ...token, onDelete: onDeleteToken }, token.id))) }), _jsx("div", { className: "CallsSearchBar__filters__clear", children: _jsx(Button, { mode: "link", onClick: onClearFilters, children: getLang('calls_movie_player_clear_filters') }) })] }))] }));
};
//# sourceMappingURL=SearchBar.js.map