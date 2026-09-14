import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import cx from 'classnames';
import '../../ui/Picker/Picker.css';
import { usePicker, usePickerSearch, } from '../../hooks/usePicker';
import { useDidUpdate } from '../../hooks/misc';
const NO_SELECTION = new Map();
export const Picker = ({ strategy = 'singular', previousStrategy, onSelectionChange, searchRenderer: Search, listRenderer: List, selection = NO_SELECTION, items, total, search, prefetch, isLoading = false, isPristine = false, hasFailed = false, checkDisabledItem, initialQuery, getItemId, className, onQueryChange, onLoadMore, }) => {
    const { toggleSelection, clearSelection, selection: currentSelection, } = usePicker({
        strategy,
        selection,
    });
    const { query, onKeyDown, onQueryUpdate, indexToSelect, forceScrollToLoader, } = usePickerSearch({
        items,
        onSelect: toggleSelection,
        getItemId,
        onQueryChange,
        initialQuery,
        hasMore: total === null || total > items.length,
    });
    useEffect(() => {
        /** Сбрасываем выделение при смене стратегии */
        if (previousStrategy && previousStrategy !== strategy) {
            clearSelection();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [strategy, previousStrategy]);
    useEffect(() => {
        prefetch?.({ query });
        search({ query, offset: 0, count: 50 });
        // Запрос должен отправляться только при смене поискового запроса
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);
    useEffect(() => {
        onSelectionChange(currentSelection);
        /**
         * Исключаем onSelectionChange из зависимостей чтобы не провоцировать лишний вызов эффекта который
         * приведет к неправильному поведению компонента (вызов функции обратного вызова без реального
         * изменения данных). Поскольку ссылка на onSelectionChange всегда актуальна, решаем средствами
         * зависимостей чтобы не создавать лишнюю сложность (usePrevious).
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSelection]);
    const onRemoveSelection = (item) => {
        toggleSelection({
            id: getItemId(item),
            value: item,
        });
    };
    // Адаптер данных из обычной модели в модель данных под список
    const listItems = useMemo(() => {
        return items.map((item, index) => {
            const id = getItemId(item);
            return {
                id,
                item: item,
                selected: currentSelection.has(id),
                disabled: checkDisabledItem ? checkDisabledItem(item) : false,
                focusedWithNavigation: index === indexToSelect,
            };
        });
    }, [getItemId, checkDisabledItem, items, currentSelection, indexToSelect]);
    const loadMore = onLoadMore ||
        (({ offset, count }) => {
            search({
                offset,
                count,
                query,
            });
        });
    useDidUpdate(() => {
        listRef.current?.scrollToItem(indexToSelect);
    }, [indexToSelect]);
    useLayoutEffect(() => {
        if (forceScrollToLoader) {
            listRef.current?.scrollToItem(indexToSelect + 1);
        }
    }, [forceScrollToLoader, indexToSelect]);
    const listRef = useRef(null);
    return (React.createElement("div", { className: cx('RE_Picker', className) },
        React.createElement(Search, { items: items, onQueryChange: onQueryUpdate, selection: currentSelection, onRemove: onRemoveSelection, onSearchInputKeyDown: onKeyDown }),
        React.createElement(List, { items: listItems, total: total, onItemSelection: toggleSelection, loadMore: loadMore, loading: isLoading, pristine: isPristine, failed: hasFailed, listRef: listRef })));
};
//# sourceMappingURL=Picker.js.map