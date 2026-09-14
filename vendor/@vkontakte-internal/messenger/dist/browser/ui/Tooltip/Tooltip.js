import '../../ui/Tooltip/Tooltip.css';
import React, { forwardRef, useCallback, useEffect, useRef, useState, useMemo, useId, } from 'react';
import cx from 'classnames';
import { Popper, } from '../../ui/Popper/Popper';
import { useDidUpdate } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { FloatingArrow, DEFAULT_ICON_ARROW_WIDTH as arrowWidth, DEFAULT_ICON_ARROW_HEIGHT as arrowHeight, DEFAULT_ICON_ARROW_PADDING as arrowPadding, } from '@vkontakte/vkui';
import { exhaustivenessCheck } from '../../../core/utils/misc';
/**
 * Компонент вдохновлен api тултипа https://material-ui.com/ru/components/tooltips/
 * При расширении компонента, подход к формированию api можно подсмотреть там.
 */
export const Tooltip = forwardRef(({ children, content, disabled = false, open = false, onOpen, onClose, delay = 50, pointerEvents = false, showOnTouch = false, align = 'auto', position = 'auto', tooltipClassName, arrowOffset = {}, tooltipOffset = {}, vkuiStyle, watchContentChange, onTargetHover, }, $ref) => {
    const { isMobileLayout } = useLayoutData();
    const id = useId();
    const [status, setStatus] = useState(open ? 'opened' : 'closed');
    const [alignType, setAlignType] = useState();
    const [positionType, setPositionType] = useState();
    const [contentNode, setContentNode] = useState(null);
    const $child = useRef(null);
    const timeoutId = useRef(null);
    const transitionTimeoutId = useRef(null);
    const clearTimers = () => {
        timeoutId.current && clearTimeout(timeoutId.current);
        transitionTimeoutId.current && clearTimeout(transitionTimeoutId.current);
        timeoutId.current = transitionTimeoutId.current = null;
    };
    const handleClose = useCallback(() => {
        setStatus('closed');
        onClose && onClose(id);
    }, [id, onClose]);
    const onHideTimeout = useCallback(() => {
        if (status === 'opened') {
            setStatus('is_closing');
            transitionTimeoutId.current = window.setTimeout(() => {
                transitionTimeoutId.current = null;
                handleClose();
            }, 200);
        }
        else {
            handleClose();
        }
    }, [status, handleClose]);
    const onShow = useCallback(() => {
        onTargetHover?.(id);
        clearTimers();
        timeoutId.current = window.setTimeout(() => {
            timeoutId.current = null;
            setStatus('opened');
            onOpen && onOpen(id);
        }, delay);
    }, [delay, id, onOpen, onTargetHover]);
    const onHide = useCallback(() => {
        clearTimers();
        timeoutId.current = window.setTimeout(() => {
            timeoutId.current = null;
            onHideTimeout();
        }, 0);
    }, [onHideTimeout]);
    /**
     * Навешиваем нативные события на детей
     */
    useEffect(() => {
        const child = $child.current;
        if (child) {
            child.addEventListener('mouseenter', onShow);
            child.addEventListener('mouseleave', onHide);
        }
        return () => {
            if (child) {
                child.removeEventListener('mouseenter', onShow);
                child.removeEventListener('mouseleave', onHide);
            }
        };
    }, [onShow, onHide]);
    /**
     * Не забываем почистить за собой таймеры
     */
    useEffect(() => clearTimers, []);
    /**
     * Меняем статус на изменение open, если работаем в контролируемом снаружи варианте
     */
    useDidUpdate(() => {
        open ? onShow() : onHide();
    }, [open]);
    const arrowCoords = useMemo(() => {
        if (!positionType || !alignType || !contentNode) {
            return { x: 0, y: 0 };
        }
        const bound = contentNode.getBoundingClientRect();
        const x = arrowOffset.x || 0;
        const y = arrowOffset.y || 0;
        switch (alignType) {
            case 'center':
                return positionType === 'top' || positionType === 'bottom'
                    ? { x: Math.floor(bound.width / 2) + (x - arrowWidth / 2) }
                    : { y: Math.floor(bound.height / 2) + (y - arrowHeight / 2) };
            case 'top':
                return {
                    y: Math.floor(bound.height) - y - arrowWidth - arrowPadding,
                };
            case 'left':
            case 'bottom':
                return {
                    x: x + arrowPadding,
                    y: y + arrowPadding,
                };
            case 'right':
                return {
                    x: Math.floor(bound.width) - x - arrowWidth - arrowPadding,
                };
            default:
                exhaustivenessCheck(alignType);
        }
    }, [alignType, arrowOffset.x, arrowOffset.y, positionType, contentNode]);
    const tooltipCoords = useMemo(() => {
        if (!vkuiStyle || !alignType || positionType !== 'top') {
            return {};
        }
        const x = tooltipOffset.x || 0;
        const y = tooltipOffset.y || 0;
        switch (alignType) {
            case 'left':
                return { left: `-${x}px`, bottom: `${y}px` };
            case 'right':
                return { right: `-${x}px`, bottom: `${y}px` };
            case 'top':
                return { top: `-${y}px` };
            case 'bottom':
                return { bottom: `-${y}px` };
            case 'center':
                return { bottom: `${y}px` };
            default:
                exhaustivenessCheck(alignType);
        }
    }, [alignType, positionType, tooltipOffset.x, tooltipOffset.y, vkuiStyle]);
    const tooltipContent = (React.createElement("div", { className: cx('METooltip', tooltipClassName, {
            'METooltip--removed': status === 'is_closing',
            'METooltip--vkuiStyle': vkuiStyle,
        }), style: {
            '--arrowOffsetX': (arrowOffset.x || 0) + 'px',
            '--arrowOffsetY': (arrowOffset.y || 0) + 'px',
            ...tooltipCoords,
        } },
        content,
        vkuiStyle && positionType && arrowCoords && (React.createElement(FloatingArrow, { placement: positionType, 
            // Координаты будут использоваться прямиком в css,
            // поэтому можно воспользоваться calc и процентами
            coords: arrowCoords, iconClassName: "METooltip__arrow" }))));
    if (!showOnTouch && isMobileLayout) {
        return children;
    }
    return (React.createElement(Popper, { content: tooltipContent, open: !disabled && status !== 'closed', ref: (node) => {
            $child.current = node;
            if (typeof $ref === 'function') {
                $ref(node);
            }
            else if ($ref) {
                $ref.current = node;
            }
        }, portalClassName: "MEConfig", mode: "side", align: align, position: position, onAlignTypeChange: setAlignType, onPositionTypeChange: setPositionType, onContentChange: setContentNode, watchContentChange: watchContentChange, pointerEvents: pointerEvents }, children));
});
//# sourceMappingURL=Tooltip.js.map