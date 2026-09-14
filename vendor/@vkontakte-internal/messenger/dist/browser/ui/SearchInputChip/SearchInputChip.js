import React, { useEffect, useState, useRef, useLayoutEffect, } from 'react';
import './SearchInputChip.css';
import { useBrowserEnv, usePrevious } from '../../hooks/misc';
import { Icon16SearchOutline, Icon20Search } from '@vkontakte/icons';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { getModuleKeyCombo } from '../../utils/keyBoardCombos';
import cx from 'classnames';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
export const SearchInputChip = ({ children, onQueryChange, onRemove, query, selection, placeholder, autoFocus = true, secondary, onSearchInputKeyDown, disabled, }) => {
    const { lang } = useBrowserEnv();
    const inputRef = useRef(null);
    const previousSelection = usePrevious(selection);
    const { isMobileLayout } = useLayoutData();
    const [isMODPressed, setMODPressed] = useState(false);
    // при добавлении пира сбрасываем значение инпута
    useEffect(() => {
        const isItemAdded = (previousSelection?.length ?? 0) < selection.length;
        if (isItemAdded && !isMODPressed) {
            onQueryChange('');
        }
    }, [previousSelection, selection.length, isMODPressed, onQueryChange]);
    const onChange = (event) => {
        onQueryChange(event.currentTarget.value);
    };
    useEffect(() => {
        const input = inputRef.current;
        if (!input) {
            return;
        }
        if (previousSelection && previousSelection.length >= selection.length) {
            return;
        }
        input.scrollIntoView({
            block: 'nearest',
        });
    }, [previousSelection, selection]);
    /**
     * Возвращаем фокус после изменения списка
     */
    useEffect(() => {
        if (!inputRef.current) {
            return;
        }
        if (isMobileLayout) {
            return;
        }
        inputRef.current.focus();
    }, [selection.length, isMobileLayout]);
    /**
     * Этот эффект тут на самом деле грязный хак в попытке избавиться
     * от утечки памяти, описанной в https://github.com/facebook/react/issues/26069
     * К сожалению, никакими другими способами пока пофиксить ее не удается,
     * даже теми, которые описаны там в комментариях.
     */
    useLayoutEffect(() => {
        const input = inputRef.current;
        return () => input?.remove();
    }, []);
    const onContentSelection = (event) => {
        const isContentClicked = event.currentTarget === event.target;
        if (!isContentClicked || !inputRef.current) {
            return;
        }
        inputRef.current.focus();
    };
    const onMouseDown = (event) => {
        const input = inputRef.current;
        if (!input) {
            return;
        }
        if (document.activeElement !== input) {
            return;
        }
        // Обрываем событие чтобы не провоцировать визуальные артефакты
        event.stopPropagation();
    };
    const getPlaceholder = () => {
        if (selection.length > 0) {
            return;
        }
        if (placeholder) {
            return placeholder;
        }
        return lang.use('me_picker_peer_search_placeholder');
    };
    const onInputKeyUp = (event) => {
        const keyCombo = getModuleKeyCombo(event);
        if (keyCombo === 'Mod') {
            setMODPressed(false);
        }
    };
    const onInputKeyDown = (keyCombo, event) => {
        switch (keyCombo) {
            case 'Mod':
                setMODPressed(true);
                event.stopPropagation();
                return;
            case 'Backspace':
                event.stopPropagation();
                const last = selection[selection.length - 1];
                if (last && !query) {
                    event.preventDefault();
                    onRemove(last);
                }
                return;
            case 'Escape':
                event.preventDefault();
                if (query) {
                    event.stopPropagation();
                    onQueryChange('');
                }
                return;
            default:
        }
        onSearchInputKeyDown(keyCombo, event);
    };
    return (React.createElement("div", { className: cx('SearchInputChip', {
            'SearchInputChip--secondary': secondary,
        }), "data-testid": "PeerChipsSearchInput" },
        React.createElement(ScrollbarProvider, { style: { maxHeight: 134 }, overflowX: "hidden" },
            React.createElement("div", { className: "SearchInputChip__content", onMouseDown: onMouseDown, onClick: onContentSelection },
                selection.length === 0 && (React.createElement("div", { className: "SearchInputChip__icon" }, secondary ? React.createElement(Icon16SearchOutline, null) : React.createElement(Icon20Search, null))),
                selection.length > 0 &&
                    selection.map((id) => children({
                        id,
                        onRemove: () => onRemove(id),
                        className: 'SearchInputChip__item',
                    })),
                React.createElement("div", { className: "SearchInputChip__inputContainer" },
                    React.createElement("input", { "data-testid": "PeerChipsSearchInput__input", className: "SearchInputChip__input", ref: inputRef, onChange: onChange, value: query, "aria-label": lang.use('me_picker_peer_search_input_arialabel'), placeholder: getPlaceholder(), onKeyDown: onElementKeyDownFactory(onInputKeyDown), onKeyUp: onInputKeyUp, disabled: disabled, autoFocus: autoFocus }))))));
};
//# sourceMappingURL=SearchInputChip.js.map