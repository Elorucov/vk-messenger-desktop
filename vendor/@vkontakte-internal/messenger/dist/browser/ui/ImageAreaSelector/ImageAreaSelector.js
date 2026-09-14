import React, { useCallback, useRef, useEffect } from 'react';
import { classNames } from '@vkontakte/vkjs';
import { Slider } from '@vkontakte/vkui';
import './ImageAreaSelector.css';
import { useZoomMove } from '../../hooks/useZoomMove';
export const ImageAreaSelector = ({ src, mode = 'circle', viewportHeight, viewportWidth, onTransformChange, }) => {
    const $img = useRef(null);
    const $viewport = useRef(null);
    const { transform, scaleBoundaries, wrapperRef, contentRef, viewportRef, init, mouseDown, touchStart, zoomToCenter, } = useZoomMove({
        maxScale: 1.5,
    });
    // Дёргаем колбэк при изменении данных о положении и скейлинге фото
    // Данные вьюпорта нужны, чтобы можно было посчитать положение относительно экрана
    // (требуется для правильного расчёта при обрезании фото)
    useEffect(() => {
        if (!$viewport.current) {
            return;
        }
        onTransformChange?.(transform, {
            x: $viewport.current.offsetLeft,
            y: $viewport.current.offsetTop,
        });
    }, [onTransformChange, transform]);
    const setImageRef = useCallback((el) => {
        $img.current = el;
        contentRef.current = el;
    }, [contentRef]);
    const setViewportRef = useCallback((el) => {
        $viewport.current = el;
        viewportRef.current = el;
    }, [viewportRef]);
    return (React.createElement("div", { className: "ImageAreaSelector", ref: wrapperRef },
        React.createElement("img", { src: src, className: "ImageAreaSelector__image", alt: "", style: {
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            }, ref: setImageRef, onLoad: init }),
        React.createElement("div", { className: classNames('ImageAreaSelector__viewport', `ImageAreaSelector__viewport--${mode}`), style: { width: viewportWidth, height: viewportHeight }, ref: setViewportRef }),
        React.createElement("div", { className: "ImageAreaSelector__overlay", onMouseDown: mouseDown, onTouchStart: touchStart }),
        React.createElement("div", { className: "ImageAreaSelector__slider" },
            React.createElement(Slider, { min: scaleBoundaries.min, max: scaleBoundaries.max, onChange: zoomToCenter, step: 0.01, value: transform.scale }))));
};
//# sourceMappingURL=ImageAreaSelector.js.map