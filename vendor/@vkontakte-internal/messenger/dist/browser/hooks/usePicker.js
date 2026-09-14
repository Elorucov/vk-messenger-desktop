import { useCallback, useEffect, useState } from 'react';
import { exhaustivenessCheck, isDev } from '../../core/utils/misc';
import { useTabListNavigation } from './useKeyboardNavigation';
export const usePicker = ({ selection, strategy, }) => {
    const [currentSelection, setSelection] = useState(selection);
    if (strategy === 'singular' && selection.size > 1 && isDev) {
        console.error('В режиме выбора одной единицы данных должно быть не более одного элемента по умолчанию');
    }
    useEffect(() => {
        setSelection(selection);
    }, [selection]);
    return {
        toggleSelection(entry) {
            let items;
            switch (strategy) {
                case 'singular':
                    items = new Map(currentSelection.has(entry.id) ? [[entry.id, entry.value]] : []);
                    break;
                case 'multiple':
                    items = new Map(currentSelection);
                    break;
                default:
                    exhaustivenessCheck(strategy);
            }
            if (items.has(entry.id)) {
                items.delete(entry.id);
            }
            else {
                items.set(entry.id, entry.value);
            }
            setSelection(items);
        },
        clearSelection() {
            setSelection(new Map());
        },
        selection: currentSelection,
    };
};
/**
 * Хук возвращает обработчики для поля ввода.
 */
export function usePickerSearch({ items, onSelect, getItemId, onQueryChange, initialQuery, hasMore, }) {
    const { setTabsCount, setSelectHandler, resetIndexToSelect, onKeyDown: onTabNavigationKeyDown, indexToSelect, forceScrollToLoader, } = useTabListNavigation({ hasMore });
    const selectHandler = useCallback((index) => {
        resetIndexToSelect(index);
        const selected = items[index];
        if (selected !== undefined) {
            onSelect({
                id: getItemId(selected),
                value: selected,
            });
        }
    }, [resetIndexToSelect, items, onSelect, getItemId]);
    useEffect(() => {
        setSelectHandler(selectHandler);
    }, [setSelectHandler, selectHandler]);
    useEffect(() => {
        setTabsCount(items.length);
    }, [items.length, setTabsCount]);
    const [query, setQuery] = useState(initialQuery);
    const onQueryUpdate = useCallback((query) => {
        resetIndexToSelect();
        setQuery(query);
        onQueryChange(query);
    }, [resetIndexToSelect, setQuery, onQueryChange]);
    const onKeyDown = useCallback((keyCombo, event) => {
        if (keyCombo === 'Escape' && query !== initialQuery) {
            event.stopPropagation();
            event.preventDefault();
            onQueryUpdate(initialQuery);
            return;
        }
        onTabNavigationKeyDown(keyCombo, event);
    }, [initialQuery, onQueryUpdate, onTabNavigationKeyDown, query]);
    return {
        query,
        onQueryUpdate,
        onKeyDown,
        indexToSelect,
        forceScrollToLoader,
        resetIndexToSelect: () => resetIndexToSelect(-1),
    };
}
//# sourceMappingURL=usePicker.js.map