import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, } from 'react';
import './Thumb.css';
import { cx } from '../utils/cx';
import { isHoveredOver } from '../utils/isHoveredOver';
export const Thumb = forwardRef(({ axis, dispatchScrollAction }, $thumb) => {
    const [height, setHeight] = useState(0);
    const [y, setY] = useState(0);
    const [width, setWidth] = useState(0);
    const [x, setX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const $thumbSize = useRef({ width, height });
    $thumbSize.current = { width, height };
    const $thumbRef = useRef(null);
    const $dragStart = useRef({ x: 0, y: 0 });
    const onDragMove = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        const { clientX, clientY } = event;
        dispatchScrollAction((element) => {
            const { width, height, left, top } = element.getBoundingClientRect();
            const trackSize = axis === 'x' ? width : height;
            const trackOffset = axis === 'x' ? left : top;
            const contentSize = element[axis === 'x' ? 'scrollWidth' : 'scrollHeight'];
            const thumbSize = $thumbSize.current[axis === 'x' ? 'width' : 'height'];
            const offset = axis === 'x' ? clientX : clientY;
            let position = offset - trackOffset - $dragStart.current[axis];
            const ratio = position / (trackSize - thumbSize);
            position = ratio * (contentSize - trackSize);
            element[axis === 'x' ? 'scrollLeft' : 'scrollTop'] = position;
        });
    }, [axis, dispatchScrollAction]);
    const onDragStop = useCallback(() => {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragStop);
        setDragging(false);
    }, [onDragMove]);
    const onDragStart = useCallback((clientX, clientY) => {
        const thumb = $thumbRef.current;
        if (!thumb) {
            return;
        }
        const { left, top } = thumb.getBoundingClientRect();
        $dragStart.current[axis] =
            axis === 'x' ? clientX - left : clientY - top;
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragStop);
        setDragging(true);
    }, [axis, onDragMove, onDragStop]);
    useEffect(() => onDragStop, [onDragStop]);
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setScrolling(false);
        }, 1000);
        setScrolling(true);
        return () => {
            window.clearTimeout(timer);
        };
    }, [x, y]);
    useImperativeHandle($thumb, () => ({
        setX,
        setWidth,
        setHeight,
        setY,
        onDragStart,
        isHoveredOver: isHoveredOver($thumbRef),
        ref: $thumbRef,
    }), [onDragStart]);
    return (_jsx("div", { ref: $thumbRef, "data-scrollbar": `thumb thumb${axis.toUpperCase()}`, style: {
            position: 'absolute',
            ...(axis === 'x'
                ? {
                    width,
                    left: 0,
                    bottom: 0,
                    transform: `translate3d(${x}px, 0px, 0)`,
                }
                : {
                    height,
                    top: 0,
                    right: 0,
                    transform: `translate3d(0, ${y}px, 0)`,
                }),
        }, className: cx(`sbarThumb sbarThumb${axis.toUpperCase()}`, dragging && 'sbarThumb--dragging', scrolling && 'sbarThumb--scrolling') }));
});
Thumb.displayName = 'Thumb';
