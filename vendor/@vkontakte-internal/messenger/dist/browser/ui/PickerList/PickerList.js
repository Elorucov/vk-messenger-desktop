import React, { useCallback, useEffect, useRef, useState, } from 'react';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import '../../ui/PickerList/PickerList.css';
import { FixedSizeList as VirtualList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import cx from 'classnames';
const DEFAULT_PAGE_LIMIT = 20;
export const PickerList = ({ items, total, loading, failed, pristine, onItemSelection, itemRenderer: Item, itemHeight, loaderNode, emptyNode, errorNode, loadMore, header, footer, listRef, }) => {
    // Ссылку на контейнер устанавливаем через состояние чтобы компонент рендерился при изменении DOM и пересчитывал высоту
    const [containerEl, setContainerEl] = useState(null);
    const scrollableEl = useRef(null);
    const currentHeight = useRef(null);
    const previousHeight = useRef(null);
    const [, forceRender] = useState({});
    const hasMore = total === null || total > items.length;
    const itemRenderer = useCallback(
    // @todo Какое-то сложное расхождение по типам между Picker, PickerList, PeersPicker, PeersPickerList
    // Нужно детальнее погрузиться в цепочку вложенности компонентов и привести типы в порядок.
    ({ index, style, data: { loaderNode, loading, items } }) => {
        const entry = items[index];
        if (!entry) {
            if (index === items.length && loading && loaderNode) {
                return (React.createElement("li", { style: style, className: "PickerList__item" }, loaderNode));
            }
            return null;
        }
        return (React.createElement("li", { style: style, key: entry.id, className: cx('PickerList__item', {
                'PickerList__item--disabled': entry.disabled,
                'PickerList__item--selected': entry.focusedWithNavigation,
            }) },
            React.createElement(Item, { ...entry })));
    }, [Item]);
    useEffect(() => {
        if (!containerEl) {
            return;
        }
        currentHeight.current = containerEl.offsetHeight;
        /*
          Слушатель изменения размера контейнера списка чтобы выполнить скролл списка на дельту изменения видимой
          высоты списка и таким образом избежать визуального артефакта в форме "прыжка" списка.
    
          <AutoSizer> не подходит, поскольку передает новое значение высоты уже после painting что исключает
          возможность агрегировать рендер нескольких изменений что приводит к визуальному артефакту.
    
          Поэтому слушаем изменения размера напрямую, чтобы изменять размер как поискового поля, так и списка одновременно.
         */
        const instance = new ResizeObserver((changes) => {
            if (changes.length === 0) {
                return;
            }
            changes.forEach((change) => {
                const rect = change.contentRect;
                if (currentHeight.current) {
                    previousHeight.current = currentHeight.current;
                }
                currentHeight.current = rect.height;
            });
            if (!previousHeight.current ||
                !currentHeight.current ||
                !scrollableEl.current ||
                !listRef.current) {
                return;
            }
            const delta = previousHeight.current - currentHeight.current;
            listRef.current.scrollTo(scrollableEl.current.scrollTop + delta);
            forceRender({});
        });
        instance.observe(containerEl);
        return () => instance.disconnect();
    }, [containerEl, scrollableEl, listRef, forceRender]);
    const isItemLoaded = useCallback((index) => !!items[index], [items]);
    const loadItems = useCallback(async (startIndex, stopIndex) => {
        loadMore({ offset: startIndex, count: stopIndex - startIndex });
    }, [loadMore]);
    const renderEmptyState = () => {
        if (loading) {
            return loaderNode;
        }
        if (pristine) {
            return null;
        }
        if (failed) {
            return errorNode;
        }
        if (emptyNode) {
            return emptyNode;
        }
        return null;
    };
    if (items?.length === 0) {
        return (React.createElement(React.Fragment, null,
            header,
            renderEmptyState(),
            footer));
    }
    const itemData = {
        loaderNode,
        loading,
        items: items.map((item) => ({
            ...item,
            onSelection: onItemSelection,
        })),
    };
    const getItemCount = () => {
        if (total !== null) {
            // Мы уже знаем сколько всего доступно результатов на сервере
            if (loading) {
                // Если мы загружаем данные, выводим все данные + один элемент под лоадер
                return items.length + 1;
            }
            return total;
        }
        // Если не знаем сколько доступно результатов, считаем что это бесконечный список и через InfiniteScroll догрузим данные по потребности
        return items.length + 1;
    };
    return (React.createElement("div", { ref: (ref) => setContainerEl(ref), className: "PickerList" },
        header,
        React.createElement("div", { className: "PickerList__container" },
            React.createElement(InfiniteLoader, { isItemLoaded: isItemLoaded, loadMoreItems: loadItems, itemCount: !hasMore
                    ? items.length
                    : total
                        ? total
                        : items.length + DEFAULT_PAGE_LIMIT }, ({ onItemsRendered, ref }) => (React.createElement(ScrollbarProvider, { style: { width: '100%', height: '100%' }, overflowX: "hidden" }, ({ scrollableRef, contentRef }) => {
                scrollableEl.current = scrollableRef.current;
                return (React.createElement(VirtualList, { ref: (currentListRef) => {
                        // Синхронизация локальной ссылки на список
                        listRef.current = currentListRef;
                        // Синхронизация ссылки InfiniteScroll'а на список
                        ref(currentListRef);
                    }, direction: "ltr", onItemsRendered: onItemsRendered, height: currentHeight.current || 0, width: "100%", overscanCount: 25, itemSize: itemHeight, itemData: itemData, outerRef: scrollableRef, className: "PickerList__list", innerRef: contentRef, itemCount: getItemCount(), innerElementType: "ol" }, itemRenderer));
            })))),
        footer));
};
//# sourceMappingURL=PickerList.js.map