import '../../ui/ComposerDraggableAttach/ComposerDraggableAttach.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Touch } from '@vkontakte/vkui';
import { useDraggableList } from '../../ui/ComposerDraggableList/ComposerDraggableList';
import cx from 'classnames';
import { getOffsetRect } from '../../utils/misc';
/**
 * Задержка перемещения через тач
 * (Нужна для того, чтобы оставалась возможность скроллить лист)
 */
const TOUCH_MOVE_DELAY = 500;
/**
 * Идея состоит в том, что элементы будут позиционироваться средствами
 * flex, однако их свап местами будет делаться через высчитывание отступов
 * только двух элементов и, соответственно, перерисовкой только двух элементов.
 *
 * После анимации следует незамедлительный свап в стейте аттачей, ввиду чего
 * визуально присутствует анимация, а на деле происходит ререндер по стейту
 * аттачей
 */
export const ComposerDraggableAttach = ({ children, className, type, index, }) => {
    const { parentContainerRef, itemState: { status, type: itemsType, nextIndex, index: movingIndex, rearrangeOffset, }, setItemState, doScroll, onPositionChange, } = useDraggableList();
    /**
     * Реф на Touch элемент
     */
    const elementRef = useRef(null);
    /**
     * Реф для сброса таймаута анимации при анмаунте
     */
    const animationRef = useRef(null);
    /**
     * Состояния локального элемента, с помощью них сетится transform
     */
    const [isMoving, setIsMoving] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    /**
     * Координаты отступов от изначального положения для перемещения аттача
     */
    const [{ x, y }, setPosition] = useState({ x: 0, y: 0 });
    /**
     * Координаты для возвращения аттача на старое место.
     * Если элемент спрятан под скроллом, то добавляется относительный
     * отступ для покрытия кейсов overflow
     */
    const returnPositionRef = useRef(0);
    /**
     * Реф для элемента, с которым будем свапаться.
     * Для получения отступов этого элементов
     */
    const nextItem = useRef(null);
    /**
     * Небольшой хак: когда элемент перемещается внутри скролла, нужно
     * грамотно его позиционировать относительно курсора (при появлении
     * отступа overflow)
     */
    const dragOffsetDiff = useMemo(() => getOffset(elementRef.current, parentContainerRef.current), 
    /**
     * При перетаскивании обновляются x и y, однако элемент с точки зрения
     * позиционирования flex остается на своем месте, ввиду чего отступ
     * пересчитывать не нужно. Пересчитать нужное в случае нового свапа
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parentContainerRef, status]);
    /**
     * Таймаут для перемещения аттачей посредством тача
     */
    const touchMoveTimeoutRef = useRef();
    const [isTouchMoveAllowed, setIsTouchMoveAllowed] = useState(false);
    /**
     * В зависимости от координаты x делаем скролл влево или вправо
     */
    const handleScroll = useCallback((clientX) => {
        if (!parentContainerRef.current) {
            return;
        }
        const OFFSET = 50;
        const { left, width } = parentContainerRef.current.getBoundingClientRect();
        if (left + OFFSET >= clientX) {
            doScroll('left');
        }
        else if (left + width - OFFSET <= clientX) {
            doScroll('right');
        }
    }, [doScroll, parentContainerRef]);
    const handleFindNextItem = useCallback((clientX, clientY) => {
        if (!elementRef.current) {
            return;
        }
        /**
         * Чтобы выбрать элемент под тем, который в данный момент в драг-н-дропе,
         * нужно драг-н-дроп элемент на мгновение сделать нечувствительным к поинтер
         * событиям
         */
        elementRef.current.style.pointerEvents = 'none';
        const itemBelow = document.elementFromPoint(clientX, clientY);
        /**
         * А затем вернуть все, как было
         */
        elementRef.current.style.pointerEvents = 'all';
        if (itemBelow) {
            /**
             * Ищем элемент того же типа
             */
            nextItem.current = itemBelow.closest(`[data-item-type=${type}]`);
        }
        /**
         * Апдейтим стейт, устанавливая индекс элемента для свапа, чтобы
         * через контекст повесить на него класс
         */
        setItemState({
            status: 'moving',
            type,
            index,
            nextIndex: +(nextItem.current?.dataset?.itemIndex || -1),
            rearrangeOffset: 0,
        });
    }, [index, setItemState, type]);
    const calculateOffsetForSwapItems = useCallback(() => {
        /**
         * Здесь нужно пересчитывать отступ в скролле, так как элемент позиционируется
         * и его отсутп изменяется вместе с координатами
         */
        const returnOffset = getOffset(elementRef.current, parentContainerRef.current);
        /**
         * Если элемент просто дернули, но не навели на новый элемент, то красиво
         * возвращаем его на место
         */
        if (!elementRef.current || !nextItem.current) {
            returnPositionRef.current = returnOffset;
            return;
        }
        const { offsetLeft: nextItemOffset } = nextItem.current;
        const { offsetLeft: elementOffset } = elementRef.current;
        returnPositionRef.current = elementOffset - nextItemOffset + returnOffset;
        /**
         * Апдейтим стейт, чтобы заставить элементы, находящиеся между,
         * занять новые позиции
         */
        setItemState((prev) => {
            const { index, nextIndex } = prev;
            return {
                ...prev,
                status: 'rearranging',
                /**
                 * Единичный отступ для каждого элемента
                 */
                rearrangeOffset: (returnPositionRef.current - dragOffsetDiff) /
                    Math.abs(nextIndex - index),
            };
        });
    }, [dragOffsetDiff, parentContainerRef, setItemState]);
    const onStart = useCallback(({ originalEvent: { touches } }) => {
        if (touches && !isTouchMoveAllowed) {
            touchMoveTimeoutRef.current = window.setTimeout(() => {
                setIsTouchMoveAllowed(true);
            }, TOUCH_MOVE_DELAY);
            return;
        }
    }, [isTouchMoveAllowed]);
    const onMove = useCallback(({ shiftX: x, shiftY: y, originalEvent }) => {
        const { touches } = originalEvent;
        let clientX;
        let clientY;
        if (touches && !isTouchMoveAllowed) {
            return;
        }
        if (touches && touches[0]) {
            ;
            ({ clientX, clientY } = touches[0]);
            originalEvent.preventDefault();
            originalEvent.stopPropagation();
        }
        else {
            ;
            ({ clientX, clientY } = originalEvent);
        }
        handleScroll(clientX);
        setPosition({
            x: x - dragOffsetDiff,
            y,
        });
        setIsReturning(false);
        setIsMoving(true);
        handleFindNextItem(clientX, clientY);
    }, [dragOffsetDiff, handleFindNextItem, handleScroll, isTouchMoveAllowed]);
    const onEnd = useCallback(({ originalEvent: { touches } }) => {
        calculateOffsetForSwapItems();
        setIsReturning(true);
        animationRef.current = window.setTimeout(() => {
            /**
             * Ресетим все
             */
            setIsMoving(false);
            setIsReturning(false);
            onPositionChange(type, index, +(nextItem.current?.dataset?.itemIndex || -1));
            nextItem.current = null;
            setItemState({
                status: 'ready',
                type: null,
                index: -1,
                nextIndex: -1,
                rearrangeOffset: 0,
            });
        }, 150);
        if (!touches) {
            return;
        }
        if (touchMoveTimeoutRef.current) {
            clearTimeout(touchMoveTimeoutRef.current);
        }
        setIsTouchMoveAllowed(false);
    }, [calculateOffsetForSwapItems, index, onPositionChange, setItemState, type]);
    useEffect(() => () => {
        if (animationRef.current) {
            clearTimeout(animationRef.current);
        }
        if (touchMoveTimeoutRef.current) {
            clearTimeout(touchMoveTimeoutRef.current);
        }
    }, []);
    /**
     * Если какой-то элемент двигается, то остальные того же типа ждут
     */
    const isWaiting = !isMoving &&
        !isReturning &&
        (status === 'moving' || status === 'rearranging') &&
        itemsType !== type;
    const isNextItem = itemsType === type && nextIndex === index;
    const isItemBetween = itemsType === type &&
        index > Math.min(movingIndex, nextIndex) &&
        index < Math.max(movingIndex, nextIndex);
    const isHovering = isNextItem && status === 'moving';
    const isMovingOver = (isItemBetween || isNextItem) && status === 'rearranging';
    return (React.createElement(Touch, { getRootRef: elementRef, className: cx('ComposerDraggableAttach', className, {
            'ComposerDraggableAttach--hovering': isHovering,
            'ComposerDraggableAttach--waiting': isWaiting,
        }), onMove: onMove, onStart: onStart, onEnd: onEnd, Component: "li", "data-item-type": type, "data-item-index": index },
        React.createElement("div", { className: cx({
                'ComposerDraggableAttach--moving': isMoving,
                'ComposerDraggableAttach--returning': isReturning || isMovingOver,
            }), style: {
                ...(isMoving
                    ? {
                        transform: isReturning
                            ? `translate(${-returnPositionRef.current}px, 0)`
                            : `translate(${x}px, ${y}px)`,
                    }
                    : {}),
                ...(isItemBetween || isNextItem
                    ? {
                        transform: isMovingOver
                            ? `translate(${rearrangeOffset}px, 0)`
                            : `translate(0, 0)`,
                    }
                    : {}),
            } }, children)));
};
/**
 * Функция для получения правильного отступа во время горизонтального скролла
 */
function getOffset(element, parentContainer) {
    if (!element || !parentContainer) {
        return 0;
    }
    const { offsetLeft } = element;
    const { left } = getOffsetRect(element, parentContainer);
    return offsetLeft - left;
}
//# sourceMappingURL=ComposerDraggableAttach.js.map