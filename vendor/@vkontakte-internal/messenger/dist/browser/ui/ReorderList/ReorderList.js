import React, { useContext, useMemo, useState, useEffect, useRef, useCallback, } from 'react';
const SortableContext = React.createContext(null);
export const SortableList = ({ children, items, disabled, onChange, }) => {
    const [active, setActive] = useState(null);
    const [hover, setHover] = useState(null);
    const activeIndex = useMemo(() => (active ? items.indexOf(active) : -1), [active, items]);
    const contextValue = useMemo(() => ({
        items,
        active,
        activeIndex,
        hover,
        disabled: disabled === true,
        setActive,
        setHover,
        onChange,
    }), [items, active, activeIndex, hover, disabled, onChange]);
    return (React.createElement(SortableContext.Provider, { value: contextValue }, children));
};
function isBetween(x, min, max) {
    return x >= min && x <= max;
}
export function useSortable({ id, lockAxis }) {
    const context = useContext(SortableContext);
    if (!context) {
        throw new Error('Сортируемые элементы должны быть обёрнуты в SortableList');
    }
    const { active, disabled, activeIndex, hover, items, setActive, setHover, onChange, } = context;
    const index = useMemo(() => items.indexOf(id), [id, items]);
    const nodeRef = useRef(null);
    const [styles, setStyles] = useState({
        transform: `translate(0, 0)`,
    });
    const attrs = useMemo(() => ({
        'data-item-id': id,
    }), [id]);
    const onStart = useCallback(() => {
        if (disabled) {
            return;
        }
        setActive(id);
        setStyles({
            pointerEvents: 'none',
            touchAction: 'none',
        });
        document.body.style.overscrollBehavior = 'contain';
    }, [disabled, id, setActive]);
    const onEnd = useCallback(() => {
        if (hover) {
            const newOrder = [...items];
            const hoverIndex = newOrder.indexOf(hover.id);
            const sameIndex = 
            /**
             * Элемент был перенесен на свою прежнюю позицию:
             *
             * 1) Прежняя позиция = hover сверху, а side = bottom
             * 2) Прежняя позиция = hover снизу, a side = top
             */
            (hoverIndex + 1 === activeIndex && hover.side === 'bottom') ||
                (hoverIndex - 1 === activeIndex && hover.side === 'top');
            if (!sameIndex) {
                const dir = activeIndex < hoverIndex ? 1 : -1;
                let newIndex = hoverIndex;
                if (dir === 1) {
                    newIndex = hover.side === 'top' ? hoverIndex - 1 : hoverIndex;
                }
                else {
                    newIndex = hover.side === 'top' ? hoverIndex : hoverIndex - 1;
                }
                if (id !== undefined) {
                    newOrder.splice(activeIndex, 1);
                    newOrder.splice(newIndex, 0, id);
                    onChange?.(newOrder);
                }
            }
        }
        setStyles({
            transform: `translate(0, 0)`,
        });
        setActive(null);
        setHover(null);
        document.body.style.overscrollBehavior = 'auto';
    }, [activeIndex, hover, id, items, onChange, setActive, setHover]);
    const onMove = useCallback(({ shiftX, shiftY, originalEvent }) => {
        let transform = '';
        switch (lockAxis) {
            case 'x':
                transform = `translateX(${shiftX}px)`;
                break;
            case 'y':
                transform = `translateY(${shiftY}px)`;
                break;
            default:
                transform = `translate(${shiftX}px, ${shiftY}px)`;
                break;
        }
        setStyles({
            transform,
            pointerEvents: 'none',
            touchAction: 'none',
            position: 'relative',
            zIndex: 99999,
        });
        let clientX;
        let clientY;
        const { touches } = originalEvent;
        if (touches && touches[0]) {
            ;
            ({ clientX, clientY } = touches[0]);
            originalEvent.preventDefault();
            originalEvent.stopPropagation();
        }
        else {
            clientX = originalEvent.clientX;
            clientY = originalEvent.clientY;
        }
        const itemBelow = document.elementFromPoint(clientX, clientY);
        if (itemBelow) {
            const item = itemBelow.closest(`[data-item-id]`);
            const hoverId = item?.dataset.itemId
                ? parseInt(item?.dataset.itemId)
                : null;
            if (item && active !== null && active !== hoverId) {
                const rect = item.getBoundingClientRect();
                const side = rect.top + rect.height / 2 < clientY ? 'bottom' : 'top';
                if (hover?.id !== hoverId || hover?.side !== side) {
                    setHover({
                        id: hoverId,
                        side,
                    });
                }
            }
        }
    }, [active, hover, lockAxis, setHover]);
    useEffect(() => {
        if (active === null) {
            setStyles({
                transform: `translateY(0px)`,
                transition: '',
            });
            return;
        }
        if (active !== id && hover && nodeRef.current) {
            const index = items.indexOf(id);
            const hoverIndex = items.indexOf(hover.id);
            const offset = getOffset(index, activeIndex, hoverIndex, hover.side, nodeRef.current.offsetHeight);
            setStyles({
                transform: `translateY(${offset}px)`,
                transition: 'transform 150ms',
            });
        }
    }, [active, activeIndex, hover, id, items]);
    return {
        index,
        setNodeRef: nodeRef,
        active: id === active,
        isDragging: active !== null,
        styles,
        attrs,
        disabled,
        onStart,
        onEnd,
        onMove,
    };
}
const getOffset = (currentIndex, draggingIndex, hoverIndex, hoverSide, height) => {
    if (draggingIndex === null ||
        hoverIndex === null ||
        height === null ||
        draggingIndex === currentIndex) {
        return 0;
    }
    const inRange = draggingIndex > hoverIndex
        ? isBetween(currentIndex, hoverIndex, draggingIndex)
        : isBetween(currentIndex, draggingIndex, hoverIndex);
    if (!inRange) {
        return 0;
    }
    const dir = draggingIndex < hoverIndex ? 1 : -1;
    if (dir === 1) {
        if (hoverSide === 'top' && currentIndex < hoverIndex) {
            return height * -1;
        }
        if (hoverSide === 'bottom') {
            return height * -1;
        }
    }
    else {
        if (hoverSide === 'bottom' && currentIndex > hoverIndex) {
            return height;
        }
        if (hoverSide === 'top') {
            return height;
        }
    }
    return 0;
};
//# sourceMappingURL=ReorderList.js.map