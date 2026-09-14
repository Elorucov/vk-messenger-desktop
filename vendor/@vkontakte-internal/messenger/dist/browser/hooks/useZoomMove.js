import { useCallback, useEffect, useRef, useState, } from 'react';
export function useZoomMove({ maxScale = 1.5, minScale, }) {
    const $wrapper = useRef(null);
    const $viewport = useRef(null);
    const $content = useRef(null);
    const [isDragging, setDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const pointDownPosition = useRef(null);
    const [scaleBoundaries, setScaleBoundaries] = useState({
        min: 1,
        max: maxScale,
    });
    const [transformData, setTransformData] = useState({
        x: 0,
        y: 0,
        scale: 1,
    });
    const $transformBoundaries = useRef({
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    });
    const calcBounds = useCallback((scale) => {
        if (!$content.current || !$wrapper.current) {
            return;
        }
        if ($viewport.current) {
            $transformBoundaries.current = calcBoundsWithViewport($wrapper.current, $viewport.current, $content.current, scale);
        }
        else {
            $transformBoundaries.current = calcBoundsBorders($wrapper.current, $content.current, true, scale);
        }
    }, []);
    const init = useCallback(() => {
        if (!$content.current || !$wrapper.current) {
            return;
        }
        const width = $content.current.offsetWidth;
        const height = $content.current.offsetHeight;
        const contWidth = $wrapper.current.offsetWidth;
        const contHeight = $wrapper.current.offsetHeight;
        let newMinScale = scaleBoundaries.min;
        const newMaxScale = scaleBoundaries.max;
        if ($viewport.current) {
            const vpWidth = $viewport.current.offsetWidth;
            const vpHeight = $viewport.current.offsetHeight;
            newMinScale = Math.max(vpHeight / height, vpWidth / width);
        }
        else {
            newMinScale =
                minScale || Math.max(contHeight / contWidth, contWidth / contHeight);
        }
        setScaleBoundaries({ min: newMinScale, max: newMaxScale });
        const newScale = boundLimiter(Math.max(contWidth / width, contHeight / height), newMinScale, newMaxScale, true);
        calcBounds(newScale);
        const x = ((width * newScale - contWidth) / 2) * -1;
        const y = ((height * newScale - contHeight) / 2) * -1;
        setTransformData({
            x,
            y,
            scale: newScale,
        });
    }, [calcBounds, minScale, scaleBoundaries.max, scaleBoundaries.min]);
    const zoom = useCallback((x, y, scale) => {
        if (!$content.current || !$wrapper.current) {
            return;
        }
        const newScale = boundLimiter(scale, scaleBoundaries.min, scaleBoundaries.max, true);
        calcBounds(newScale);
        const transform = handleZoomToPoint(transformData, newScale, x, y, $transformBoundaries.current, true);
        if (transform) {
            setTransformData(transform);
        }
    }, [calcBounds, scaleBoundaries.max, scaleBoundaries.min, transformData]);
    const zoomToCenter = useCallback((newScale) => {
        if (!$wrapper.current || !$content.current) {
            return;
        }
        const wrapperRect = $wrapper.current.getBoundingClientRect();
        const position = getMousePositionByCoord(wrapperRect.left + wrapperRect.width / 2, wrapperRect.top + wrapperRect.height / 2, $content.current, transformData.scale);
        zoom(position.x, position.y, newScale);
    }, [transformData.scale, zoom]);
    const zoomToPoint = useCallback((event, newScale) => {
        if (!$content.current) {
            return;
        }
        const position = getMousePosition(event, $content.current, newScale);
        zoom(position.x, position.y, newScale);
    }, [zoom]);
    const mouseDown = useCallback((event) => {
        event.preventDefault();
        if (isDragging) {
            return;
        }
        setDragging(true);
        setPos({ x: transformData.x, y: transformData.y });
        pointDownPosition.current = { x: event.pageX, y: event.pageY };
    }, [isDragging, transformData.x, transformData.y]);
    const touchStart = useCallback((event) => {
        event.preventDefault();
        if (isDragging) {
            return;
        }
        setDragging(true);
        const touch = event.touches[0];
        if (touch) {
            setPos(pos);
            pointDownPosition.current = { x: touch.pageX, y: touch.pageY };
        }
    }, [isDragging, pos]);
    /**
     * Слушаем события window, чтобы драг и зум не упирались в края контейнера
     */
    useEffect(() => {
        if (!isDragging) {
            return;
        }
        function handleMove(event) {
            event.preventDefault();
            if (!pointDownPosition.current) {
                return;
            }
            let pageX = 0;
            let pageY = 0;
            // В десктопном Firefox может не быть TouchEvent, поэтому проверяем наличие
            if (window.TouchEvent && event instanceof TouchEvent) {
                const touch = event.touches[0];
                if (!touch) {
                    return;
                }
                pageX = touch.pageX;
                pageY = touch.pageY;
            }
            if (event instanceof MouseEvent) {
                pageX = event.pageX;
                pageY = event.pageY;
            }
            const deltaX = pageX - pointDownPosition.current.x;
            const deltaY = pageY - pointDownPosition.current.y;
            const x = boundLimiter(pos.x + deltaX, $transformBoundaries.current.minX, $transformBoundaries.current.maxX, true);
            const y = boundLimiter(pos.y + deltaY, $transformBoundaries.current.minY, $transformBoundaries.current.maxY, true);
            setTransformData((prev) => ({ ...prev, x, y }));
        }
        function onEnd(event) {
            event.preventDefault();
            if (!isDragging) {
                return;
            }
            setDragging(false);
        }
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchend', onEnd);
        window.addEventListener('mouseup', onEnd);
        return () => {
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchend', onEnd);
            window.removeEventListener('mouseup', onEnd);
        };
    }, [isDragging, pos.x, pos.y]);
    return {
        transform: transformData,
        scaleBoundaries,
        init,
        wrapperRef: $wrapper,
        contentRef: $content,
        viewportRef: $viewport,
        zoom,
        zoomToCenter,
        zoomToPoint,
        mouseDown,
        touchStart,
    };
}
const calcBoundsWithViewport = (container, viewport, content, scale) => {
    const vpWidth = viewport.offsetWidth;
    const vpHeight = viewport.offsetHeight;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;
    const newContentWidth = contentWidth * scale;
    const newContentHeight = contentHeight * scale;
    const maxX = (containerWidth - vpWidth) / 2;
    const minX = newContentWidth * -1 + maxX + vpWidth;
    const maxY = (containerHeight - vpHeight) / 2;
    const minY = newContentHeight * -1 + maxY + vpHeight;
    return {
        minX,
        maxX,
        minY,
        maxY,
    };
};
export function getComponentsSizes(wrapperComponent, contentComponent, newScale) {
    const wrapperWidth = wrapperComponent.offsetWidth;
    const wrapperHeight = wrapperComponent.offsetHeight;
    const contentWidth = contentComponent.offsetWidth;
    const contentHeight = contentComponent.offsetHeight;
    const newContentWidth = contentWidth * newScale;
    const newContentHeight = contentHeight * newScale;
    const newDiffWidth = wrapperWidth - newContentWidth;
    const newDiffHeight = wrapperHeight - newContentHeight;
    return {
        wrapperWidth,
        wrapperHeight,
        newContentWidth,
        newDiffWidth,
        newContentHeight,
        newDiffHeight,
    };
}
const getBounds = (wrapperWidth, newContentWidth, diffWidth, wrapperHeight, newContentHeight, diffHeight, centerZoomedOut) => {
    const scaleWidthFactor = wrapperWidth > newContentWidth ? diffWidth * (centerZoomedOut ? 1 : 0.5) : 0;
    const scaleHeightFactor = wrapperHeight > newContentHeight
        ? diffHeight * (centerZoomedOut ? 1 : 0.5)
        : 0;
    const minX = wrapperWidth - newContentWidth - scaleWidthFactor;
    const maxX = scaleWidthFactor;
    const minY = wrapperHeight - newContentHeight - scaleHeightFactor;
    const maxY = scaleHeightFactor;
    return { minX, maxX, minY, maxY };
};
const calcBoundsBorders = (wrapper, content, centerZoomedOut, newScale) => {
    const { wrapperWidth, wrapperHeight, newContentWidth, newDiffWidth, newContentHeight, newDiffHeight, } = getComponentsSizes(wrapper, content, newScale);
    const bounds = getBounds(wrapperWidth, newContentWidth, newDiffWidth, wrapperHeight, newContentHeight, newDiffHeight, Boolean(centerZoomedOut));
    return bounds;
};
function handleZoomToPoint(data, scale, mouseX, mouseY, bounds, limitToBounds) {
    const { x, y } = handleCalculateZoomPositions(data, mouseX, mouseY, scale, bounds, limitToBounds);
    return { scale, x, y };
}
function handleCalculateZoomPositions(data, mouseX, mouseY, newScale, bounds, limitToBounds) {
    const { scale, x, y } = data;
    const scaleDifference = newScale - scale;
    const calculatedPositionX = x - mouseX * scaleDifference;
    const calculatedPositionY = y - mouseY * scaleDifference;
    const newPositions = getMouseBoundedPosition(calculatedPositionX, calculatedPositionY, bounds, limitToBounds, 0, 0, null);
    return newPositions;
}
function getMouseBoundedPosition(positionX, positionY, bounds, limitToBounds, paddingValueX, paddingValueY, wrapperComponent) {
    const { minX, minY, maxX, maxY } = bounds;
    let paddingX = 0;
    let paddingY = 0;
    if (wrapperComponent) {
        paddingX = paddingValueX;
        paddingY = paddingValueY;
    }
    const x = boundLimiter(positionX, minX - paddingX, maxX + paddingX, limitToBounds);
    const y = boundLimiter(positionY, minY - paddingY, maxY + paddingY, limitToBounds);
    return { x, y };
}
const roundNumber = (num, decimal) => {
    return Number(num.toFixed(decimal));
};
const boundLimiter = (value, minBound, maxBound, isActive) => {
    if (!isActive)
        return roundNumber(value, 2);
    if (value < minBound)
        return roundNumber(minBound, 2);
    if (value > maxBound)
        return roundNumber(maxBound, 2);
    return roundNumber(value, 2);
};
function getMousePositionByCoord(x, y, content, scale) {
    const contentRect = content.getBoundingClientRect();
    return {
        x: (x - contentRect.left) / scale,
        y: (y - contentRect.top) / scale,
    };
}
function getMousePosition(event, content, scale) {
    const contentRect = content.getBoundingClientRect();
    let mouseX = 0;
    let mouseY = 0;
    if ('clientX' in event) {
        mouseX = (event.clientX - contentRect.left) / scale;
        mouseY = (event.clientY - contentRect.top) / scale;
    }
    else {
        const touch = event.touches[0];
        if (touch) {
            mouseX = (touch.clientX - contentRect.left) / scale;
            mouseY = (touch.clientY - contentRect.top) / scale;
        }
    }
    return {
        x: mouseX,
        y: mouseY,
    };
}
//# sourceMappingURL=useZoomMove.js.map