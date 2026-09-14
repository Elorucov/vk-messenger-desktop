import React, { Fragment, useCallback, useEffect, useRef, useState, } from 'react';
import cx from 'classnames';
import { debounce } from '@vkontakte/vkjs';
import { Flex } from '@vkontakte-internal/vkcom-kit';
import { BaseAdaptiveItemsLineCounter } from './BaseAdaptiveItemsLineCounter';
import './AdaptiveItemsLine.css';
/**
 * Компонент отображает в виде строки элементы и прячет за счётчиком
 * невошедшие по ширине
 */
export function AdaptiveItemsLine({ className, Counter = BaseAdaptiveItemsLineCounter, Item, items, separator = React.createElement(React.Fragment, null, ",\u00A0"), onChangeCounterVisibility, }) {
    const [visibleItemsCount, setVisibleItemsCount] = useState(items.length);
    const [shouldRenderCounter, setShouldRenderCounter] = useState(false);
    const resizeObserver = useRef();
    const hiddenFullLineRef = useRef(null);
    const containerRef = useRef(null);
    const refreshResizeObserver = (ref) => {
        resizeObserver.current?.disconnect();
        if (!ref) {
            return;
        }
        resizeObserver.current = new ResizeObserver(debounce((entries) => {
            const entry = entries.find((item) => item.target);
            if (entry && hiddenFullLineRef.current) {
                const { width } = entry.contentRect;
                const list = [
                    ...hiddenFullLineRef.current.querySelectorAll('.AdaptiveItemsLine__hiddenItemWrapper'),
                ];
                const counterElement = hiddenFullLineRef.current.querySelector('.AdaptiveItemsLine__hiddenCounter');
                const visibleItemsCount = list.reduce((acc, element, index, array) => {
                    const { offsetLeft, offsetWidth } = element;
                    const isLast = index === array.length - 1;
                    const counterWidth = counterElement?.offsetWidth || 0;
                    const itemsWidth = width - (isLast ? 0 : counterWidth);
                    if (offsetLeft + offsetWidth / 2 <= itemsWidth &&
                        (offsetWidth < counterWidth ||
                            itemsWidth - offsetLeft > counterWidth)) {
                        acc++;
                    }
                    return acc;
                }, 0);
                setVisibleItemsCount(visibleItemsCount);
                setShouldRenderCounter(visibleItemsCount !== items.length);
            }
        }, 100));
        resizeObserver.current.observe(ref);
        return () => {
            resizeObserver.current?.disconnect();
        };
    };
    const setContainerRef = useCallback((ref) => {
        containerRef.current = ref;
        refreshResizeObserver(ref);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        onChangeCounterVisibility?.(shouldRenderCounter);
    }, [shouldRenderCounter, onChangeCounterVisibility]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => refreshResizeObserver(containerRef.current), [items]);
    return (React.createElement("div", { className: cx('AdaptiveItemsLine', className), ref: setContainerRef },
        React.createElement(Flex, { className: "AdaptiveItemsLine__hiddenFullLine", getRootRef: hiddenFullLineRef, noWrap: true },
            items.map((item, index, array) => (React.createElement(Fragment, { key: index },
                React.createElement(Flex.Item, { className: "AdaptiveItemsLine__hiddenItemWrapper" },
                    React.createElement(Item, { isTemplate: true, item: item, items: items })),
                index < array.length - 1 && (React.createElement(Flex.Item, { flex: "fixed" }, separator))))),
            React.createElement(Flex, { className: "AdaptiveItemsLine__hiddenCounter", noWrap: true },
                React.createElement(Flex.Item, { flex: "fixed" }, separator),
                React.createElement(Counter, { count: items.length - visibleItemsCount, isTemplate: true, items: items }))),
        React.createElement(Flex, { noWrap: true }, items.reduce((acc, item, index, array) => {
            if (index < visibleItemsCount) {
                acc.push(React.createElement(Fragment, { key: index },
                    React.createElement(Flex.Item, { className: "AdaptiveItemsLine__itemWrapper", flex: index === visibleItemsCount - 1 ? 'shrink' : 'fixed' },
                        React.createElement(Item, { item: item, items: items })),
                    index < array.length - 1 && (React.createElement(Flex.Item, { flex: "fixed" }, separator))));
            }
            else if (index === visibleItemsCount) {
                acc.push(React.createElement(Counter, { count: array.length - visibleItemsCount, items: items, key: "counter" }));
            }
            return acc;
        }, []))));
}
//# sourceMappingURL=AdaptiveItemsLine.js.map