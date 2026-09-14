import '../../ui/Popper/Popper.css';
import React, { useCallback, useState, useLayoutEffect, forwardRef, useRef, useImperativeHandle, } from 'react';
import cx from 'classnames';
import { ColorSchemeProvider, useColorScheme } from '@vkontakte/vkui';
import { Portal } from '../../ui/Portal/Portal';
import { useCombinedRefs } from '../../hooks/misc';
import { browser, getOffsetRect } from '../../utils/misc';
import { useLayer } from '../../ui/Layer/Layer';
import { useResizeObserver, } from '../../hooks/useResizeObserver';
import { isNumber } from '@vkontakte/vkjs';
/**
 * Компонент предназначен для того, чтобы привязывать какой-то контент в портале
 * к позиции элемента (children) на странице или координатам курсора (cursor)
 * С его помощью можно делать тултипы, дропдауны, селекты, подсказки и прочее.
 */
export const Popper = forwardRef(function Popper({ open = true, position = 'auto', mode = 'side', align = 'auto', adaptation, content, portalClassName, children, portalTarget, cursor, watchContentChange = false, verticalShiftPadding = 16, handleRef, onAlignTypeChange, onPositionTypeChange, onContentChange, pointerEvents = true, ...props }, ref) {
    const layer = useLayer();
    const [contentNode, setContentNode] = useState(null);
    const appearance = useColorScheme();
    const $ref = useRef(null);
    const combinedRefsCallback = useCombinedRefs(ref, $ref);
    const [styles, setStyles] = useState(null);
    const [alignType, setAlignType] = useState(null);
    const [positionType, setPositionType] = useState(null);
    const { observe } = useResizeObserver();
    const verticalShiftValue = useRef(0);
    const updatePopperStyles = useCallback((skipSizeRecalc = false) => {
        if (!open) {
            return;
        }
        if (mode === 'side' &&
            $ref.current &&
            /**
             * Не применяем стили к элементу с display: none
             */
            !isDisplayNone($ref.current)) {
            const [styles, alignType, positionType] = calcPopperSideStyles($ref.current, contentNode, position, align, adaptation, portalTarget?.current || undefined, skipSizeRecalc, verticalShiftPadding, verticalShiftValue.current);
            onAlignTypeChange?.(alignType);
            onPositionTypeChange?.(positionType);
            setStyles(styles);
            setAlignType(alignType);
            setPositionType(positionType);
        }
        if (mode === 'cursor' && cursor) {
            const [styles, alignType, positionType] = calcPopperCursorStyles(cursor, contentNode, position, align);
            onAlignTypeChange?.(alignType);
            onPositionTypeChange?.(positionType);
            setStyles(styles);
            setAlignType(alignType);
            setPositionType(positionType);
        }
        if (mode === 'bottom-sheet') {
            const [styles, alignType, positionType] = calcPopperBottomSheetStyles();
            onAlignTypeChange?.(alignType);
            onPositionTypeChange?.(positionType);
            setStyles(styles);
            setAlignType(alignType);
            setPositionType(positionType);
        }
    }, [
        open,
        mode,
        $ref,
        cursor,
        contentNode,
        position,
        align,
        adaptation,
        portalTarget,
        verticalShiftPadding,
        onAlignTypeChange,
        onPositionTypeChange,
    ]);
    useImperativeHandle(handleRef, () => ({
        setVerticalShift: (value, skipUpdate) => {
            verticalShiftValue.current = value;
            if (!value || skipUpdate) {
                return;
            }
            updatePopperStyles(true);
        },
        updatePosition: (skipSizeRecalc = false) => {
            updatePopperStyles(skipSizeRecalc);
        },
    }), [updatePopperStyles]);
    useLayoutEffect(() => {
        updatePopperStyles();
        onContentChange?.(contentNode);
        const childContent = Array.from(contentNode?.children || [])?.[0];
        if (!childContent || !watchContentChange) {
            return;
        }
        const onResize = (entry) => {
            if (!entry.borderBoxSize[0]) {
                return;
            }
            updatePopperStyles(true);
        };
        return observe(childContent, onResize);
    }, [
        contentNode,
        contentNode?.children,
        observe,
        updatePopperStyles,
        watchContentChange,
        onContentChange,
    ]);
    return (React.createElement(React.Fragment, null,
        mode !== 'cursor' &&
            children &&
            React.cloneElement(children, {
                ...children.props,
                ref: combinedRefsCallback,
            }),
        open && (React.createElement(ColorSchemeProvider, { value: appearance },
            React.createElement(Portal, { ...props, ref: setContentNode, className: cx('MEPopper', 'MEConfig', `MEPopper--${mode}`, alignType && `MEPopper--align${uppercaseFirst(alignType)}`, positionType && `MEPopper--${positionType}`, !pointerEvents && 'MEPopper--noPointerEvents'), "data-align": alignType, "data-position": positionType, portalClassName: portalClassName, style: styles || undefined, portalTarget: portalTarget?.current || layer }, content)))));
});
const AUTO = 'auto';
const VERTICALS = ['top', 'bottom'];
const HORIZONTALS = ['left', 'right'];
/**
 * Получает стили для элемента и тип выравнивания,
 * чтобы привязать его к положению «родителя»
 */
function calcPopperSideStyles(
/**
 * Элемент триггера (кнопки)
 */
el, 
/**
 * Элемент всплывающего контента
 */
contentNode, position, align, adaptation, parentEl, skipSizeRecalc, verticalShiftPadding, verticalShiftValue) {
    let positionStyle = 'fixed';
    // Получаем размеры элемента-триггера для компонента
    let triggerRect = el.getBoundingClientRect();
    let { innerWidth: vw, innerHeight: vh } = window;
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
    let scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    if (parentEl) {
        triggerRect = getOffsetRect(el, parentEl);
        vw = parentEl.clientWidth;
        vh = parentEl.clientHeight;
        scrollTop = parentEl.scrollTop;
        scrollLeft = parentEl.scrollLeft;
        positionStyle = 'absolute';
    }
    // Получаем ширину и высоту контента внутри компонента
    const contentSize = contentNode?.getBoundingClientRect();
    const contentWidth = contentSize?.width || 0;
    const contentHeight = contentSize?.height || 0;
    // Размеры всплывашки для позиционирования элементов внутри по средствам flex
    const boundedContentWidth = contentWidth && !skipSizeRecalc
        ? Math.max(triggerRect.width, contentWidth)
        : undefined;
    const boundedContentHeight = contentHeight && !skipSizeRecalc
        ? Math.max(triggerRect.height, contentHeight)
        : undefined;
    // Выбираем автоматически позицию между 'top' и 'bottom' на основе положения элемента
    if (position === AUTO) {
        const topDistance = triggerRect.top - scrollTop;
        const bottomDistance = scrollTop + vh - triggerRect.top - triggerRect.height;
        position = getAutoPosition(topDistance, bottomDistance);
    }
    // Выбираем автоматически выравнивание
    if (align === AUTO) {
        const boxCenter = triggerRect.left + 0.5 * triggerRect.width;
        const leftBorder = scrollLeft + vw / 3;
        const rightBorder = scrollLeft + (2 * vw) / 3;
        align = getAutoAlign(leftBorder, boxCenter, rightBorder);
    }
    // У iOS на сафари при открытии клавиатуры часть контента уезжает вверх
    const viewportTop = browser.safari_mobile
        ? window.visualViewport?.pageTop || 0
        : 0;
    const triggerLeft = triggerRect.left;
    let triggerTop = triggerRect.top + viewportTop;
    const triggerRight = triggerLeft + triggerRect.width;
    const triggerBottom = triggerTop + triggerRect.height;
    const triggerHalfRectWidth = triggerRect.width * 0.5;
    const contentHalfWidth = contentWidth * 0.5;
    const triggerHalfRectHeight = triggerRect.height * 0.5;
    const contentHalfHeight = contentHeight * 0.5;
    const isContentWider = triggerRect.width < contentWidth;
    const isContentHigher = triggerRect.height < contentHeight;
    const isNoSpaceOnTop = triggerTop < contentHeight;
    const isNoSpaceOnBottom = triggerBottom + contentHeight > vh + scrollTop;
    const isNoSpaceOnTopRespectingParent = parentEl && triggerTop - scrollTop < contentHeight;
    const isNoSpaceOnTopForSide = triggerBottom < contentHeight;
    const isNoSpaceOnTopForSideCenter = triggerTop + triggerHalfRectHeight < contentHalfHeight;
    const isNoSpaceOnBottomForSide = triggerTop + contentHeight > vh + scrollTop;
    const isNoSpaceOnBottomForSideCenter = triggerTop + triggerHalfRectHeight + contentHalfHeight > vh + scrollTop;
    const isNoSpaceOnLeft = triggerRight - contentWidth < 0;
    const isNoSpaceOnRight = triggerRect.left + contentWidth > vw;
    const isNoSpaceOnLeftForSide = triggerRight - triggerRect.width < contentWidth;
    const isNoSpaceOnRightForSide = triggerRight + contentWidth > vw + scrollLeft;
    const isNoSpaceOnLeftForCenter = triggerLeft + triggerHalfRectWidth < contentHalfWidth;
    const isNoSpaceOnRightForCenter = triggerLeft + triggerHalfRectWidth + contentHalfWidth > vw + scrollLeft;
    const isHorizontallyAdaptable = adaptation === 'horizontal';
    const isVerticallyAdaptable = adaptation === 'vertical';
    // Не меняем позиции, если будем смещать адаптивно по вертикали
    if (!isVerticallyAdaptable) {
        // Если не хватает места сверху
        if ((position === 'top' && isNoSpaceOnTop) ||
            (align === 'center' && isNoSpaceOnTopForSideCenter) ||
            (HORIZONTALS.includes(align) && isNoSpaceOnTopForSide)) {
            position = 'bottom';
        }
        // Если нет места снизу
        if ((position === 'bottom' && isNoSpaceOnBottom) ||
            (align === 'center' && isNoSpaceOnBottomForSideCenter) ||
            (HORIZONTALS.includes(align) && isNoSpaceOnBottomForSide)) {
            position = 'top';
        }
    }
    // Не меняем позиции, если будем смещать адаптивно по горизонтали
    if (!isHorizontallyAdaptable) {
        // Если не хватает места по бокам, то меняем местами `align`
        if (VERTICALS.includes(position)) {
            if (HORIZONTALS.includes(align)) {
                if (isNoSpaceOnLeft) {
                    align = 'left';
                }
                if (isNoSpaceOnRight) {
                    align = 'right';
                }
            }
            // Если по центру, но с какой-то стороны не влезает
            if (align === 'center') {
                if (isNoSpaceOnRightForCenter) {
                    align = 'right';
                }
                if (isNoSpaceOnLeftForCenter) {
                    align = 'left';
                }
            }
        }
        // Если всплывашка где-то сбоку и не помещается,
        // то нужно сменить и `align`
        if (HORIZONTALS.includes(position)) {
            if (VERTICALS.includes(align)) {
                if (isNoSpaceOnTopForSide) {
                    align = 'bottom';
                }
                if (isNoSpaceOnBottomForSide) {
                    align = 'top';
                }
            }
            if (isNoSpaceOnLeftForSide) {
                position = 'right';
                align = align === 'right' ? 'left' : align;
            }
            if (isNoSpaceOnRightForSide) {
                position = 'left';
                align = align === 'left' ? 'right' : align;
            }
        }
    }
    // Создаем обертку, повторяющую
    // верхнюю, правую, нижнюю или левую границу «родителя»,
    // но если контент больше, то ориентируемся на его размер
    let styles = {};
    switch (position) {
        case 'top':
            styles = { width: boundedContentWidth, top: triggerTop - contentHeight };
            break;
        case 'bottom':
            styles = { width: boundedContentWidth, top: triggerBottom };
            break;
        case 'left':
            styles = {
                height: boundedContentHeight,
                left: triggerLeft - contentWidth,
            };
            break;
        case 'right':
            styles = { height: boundedContentHeight, left: triggerRight };
            break;
        default:
            break;
    }
    // Если контент шире или выше, то смещаем всплывашку;
    // когда триггер больше, flex сделает это автоматически
    if (VERTICALS.includes(position) && isContentWider) {
        if (align === 'right') {
            styles.left = triggerRight - contentWidth;
        }
        if (align === 'center') {
            styles.left = triggerLeft + triggerHalfRectWidth - contentHalfWidth;
        }
        // Адаптивно смещаем
        if (isHorizontallyAdaptable) {
            if ((align === 'center' && isNoSpaceOnLeftForCenter) ||
                (align === 'right' && isNoSpaceOnLeftForSide)) {
                styles.left = 0;
            }
            if ((align === 'center' && isNoSpaceOnRightForCenter) ||
                (align === 'left' && isNoSpaceOnRightForSide)) {
                styles.left = vw - contentWidth + scrollLeft;
            }
        }
    }
    // Выравнивание большого всплывающего контента относительно
    // маленького элемента-триггера
    if (HORIZONTALS.includes(position) && isContentHigher) {
        switch (align) {
            case 'center':
                styles.top = triggerTop + triggerHalfRectHeight - contentHalfHeight;
                break;
            case 'top':
                styles.top = triggerTop - contentHeight + triggerRect.height;
                break;
            default:
        }
        // styles.top = y - contentHeight + rect.height
        // Адаптивно смещаем
        if (isVerticallyAdaptable) {
            if ((align === 'center' && isNoSpaceOnTopForSideCenter) ||
                (HORIZONTALS.includes(align) && isNoSpaceOnTopForSide)) {
                styles.top = 0;
            }
            if (isNoSpaceOnTopRespectingParent && align === 'center') {
                styles.top = scrollTop;
            }
            if ((align === 'center' && isNoSpaceOnBottomForSideCenter) ||
                (HORIZONTALS.includes(align) && isNoSpaceOnBottomForSide)) {
                styles.top = vh - contentHeight + scrollTop;
            }
        }
    }
    if (verticalShiftValue) {
        const currentY = typeof styles.top === 'number' ? styles.top : triggerTop;
        let updatedY = currentY;
        // Если смещённый контент выходит за верхнюю границу вьюпорта, делаем
        // отступ от этой границы, равный заданному смещению.
        if (currentY + verticalShiftValue <= 0) {
            updatedY = Math.abs(verticalShiftPadding) + Math.abs(verticalShiftValue);
        }
        if (typeof styles.top === 'number') {
            styles.top = updatedY;
        }
        else {
            triggerTop = updatedY;
        }
    }
    return [
        roundPosition({
            top: triggerTop,
            left: triggerLeft,
            ...styles,
            position: positionStyle,
        }),
        align,
        position,
    ];
}
/**
 * TODO: Добавить adaptation для вертикали
 */
function calcPopperCursorStyles(cursor, contentNode, position, align) {
    const { innerWidth: vw, innerHeight: vh } = window;
    const { x, y } = cursor;
    // Получаем ширину и высоту контента внутри компонента
    const contentSize = contentNode?.getBoundingClientRect();
    const contentWidth = contentSize?.width || 0;
    const contentHeight = contentSize?.height || 0;
    const w = contentWidth || undefined;
    const h = contentHeight || undefined;
    if (position === AUTO) {
        const topDistance = y;
        const bottomDistance = vh - y;
        position = getAutoPosition(topDistance, bottomDistance);
    }
    if (align === AUTO) {
        const rightDistance = vw - x;
        align = getAutoAlign(x, x, rightDistance);
    }
    const isNoSpaceOnTop = y < contentHeight;
    const isNoSpaceOnBottom = vh - y < contentHeight;
    const isNoSpaceOnTopForCenter = y < contentHeight / 2;
    const isNoSpaceOnBottomForCenter = vh - y < contentHeight / 2;
    const isNoSpaceOnLeft = x < contentWidth;
    const isNoSpaceOnRight = vw - x < contentWidth;
    if ((position === 'top' && isNoSpaceOnTop) ||
        (align === 'center' && isNoSpaceOnTopForCenter)) {
        position = 'bottom';
    }
    if ((position === 'bottom' && isNoSpaceOnBottom) ||
        (align === 'center' && isNoSpaceOnBottomForCenter)) {
        position = 'top';
    }
    if (HORIZONTALS.includes(align)) {
        // На маленьких экранах может не хватать места по горизонтали, поэтому
        // обрабатываем этот кейс отдельно - вмещаем как можно больше контента.
        if (isNoSpaceOnLeft && isNoSpaceOnRight) {
            align = 'auto';
        }
        else if (isNoSpaceOnLeft) {
            align = 'left';
        }
        else if (isNoSpaceOnRight) {
            align = 'right';
        }
    }
    const styles = {};
    switch (position) {
        case 'top':
            styles.top = y - contentHeight;
            break;
        case 'bottom':
            styles.top = y;
            break;
        default:
            break;
    }
    switch (align) {
        // Обрабатываем случаи, когда не хватает места по горизонтали.
        case 'auto': {
            const [left, alignType] = calcConstrainedAxisValue(x, contentWidth);
            styles.left = left;
            align = alignType;
            break;
        }
        case 'left':
            styles.left = contstrainAxisToWindowBoundary(x, contentWidth, vw);
            break;
        case 'right':
            styles.left = contstrainAxisToWindowBoundary(x - contentWidth, contentWidth, vw);
            break;
        default:
            break;
    }
    return [
        roundPosition({
            position: 'fixed',
            left: x,
            top: y,
            height: h,
            width: w,
            ...styles,
        }),
        align,
        position,
    ];
}
function calcPopperBottomSheetStyles() {
    return [
        roundPosition({
            position: 'fixed',
            left: '8px',
            bottom: '8px',
            width: 'calc(100% - 16px)',
            display: 'block',
        }),
        'bottom',
        'bottom',
    ];
}
function uppercaseFirst(str) {
    return str.length > 0 ? str.slice(0, 1).toUpperCase() + str.slice(1) : '';
}
function isDisplayNone(element) {
    /**
     * getComputedStyle использовать в этом случае неправильно,
     * так как у элемента может и не быть display:none, а вот у его родителя может,
     * тогда через getComputedStyle нельзя бы было получить актуальную информацию.
     * offset'ы отработают как надо и не отправят поппер в космос
     */
    return element.offsetWidth === 0 && element.offsetHeight === 0;
}
function getAutoPosition(top, bottom) {
    return bottom > top ? 'bottom' : 'top';
}
function getAutoAlign(left, center, right) {
    if (center >= left && center <= right) {
        return 'center';
    }
    if (center > right) {
        return 'right';
    }
    return 'left';
}
// Не знаю почему и как, но округление позиции фиксит баг в Сафари ME-46805
function roundPosition(styles) {
    return {
        ...styles,
        top: isNumber(styles.top) ? Math.round(styles.top) : styles.top,
        bottom: isNumber(styles.bottom) ? Math.round(styles.bottom) : styles.bottom,
        left: isNumber(styles.left) ? Math.round(styles.left) : styles.left,
    };
}
/**
 * Увеличивает предел границ, чтобы поппер не отрисовывался прямо у края
 * экрана.
 */
const SAFE_ZONE_SIZE = 24;
/**
 * Не позволяет значению выходить за пределы определённой границы по оси.
 *
 * @param value Текущее значение оси.
 * @param size Текущий размер элемента по выбранной оси.
 * @param boundaryValue Ограничивающее значение для выбранной оси.
 * @returns left
 */
function contstrainAxisToWindowBoundary(value, size, boundaryValue) {
    if (value < SAFE_ZONE_SIZE)
        return SAFE_ZONE_SIZE;
    const safeBoundaryValue = boundaryValue - SAFE_ZONE_SIZE;
    if (value > safeBoundaryValue) {
        return safeBoundaryValue - size;
    }
    return value;
}
function calcConstrainedAxisValue(x, contentWidth) {
    const { innerWidth: vw } = window;
    let result = x;
    let align = 'right';
    // Поппер открывается справа от курсора (насколько возможно).
    if (x < vw / 2) {
        const offsetLeft = x + contentWidth;
        if (offsetLeft > vw)
            result = x - (offsetLeft - vw);
        align = 'left';
    }
    // Поппер открывается слева от курсора (насколько возможно).
    const offsetLeft = x - contentWidth;
    if (offsetLeft < 0)
        result = -offsetLeft;
    return [contstrainAxisToWindowBoundary(result, contentWidth, vw), align];
}
//# sourceMappingURL=Popper.js.map