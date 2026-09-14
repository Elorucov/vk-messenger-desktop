import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"TouchComponent":["@vkontakte-internal/vkcom-kit",{"className":1,"style":1}]} */
import { useCallback, useRef, useState, useEffect, } from 'react';
import { Touch as TouchComponent } from '@vkontakte-internal/vkcom-kit';
import { validateCoord, checkIgnoredSelectors } from './utils';
import { useRefRect } from './useRefRect';
import { useViewport } from './useViewport';
const defaultPadding = { bottom: 0, left: 0, right: 0, top: 0 };
const defaultStartCoords = [15, -15];
/**
 * компонент для поддержки "перетаскивания" контейнера
 *
 * пока поддерживает перетаскивание только с _левого-нижнего_ угла,
 * (тк изначально создавался под `CollapsedCallContainer`), для
 * большей универсальности нужно допилить расчет `validateCoords`
 *
 * если нужны отступы (типа, `padding`), то в css прибивайте контейнер
 * в `left: 0; bottom: 0` и делайте смещение через свойство `transform: translate`,
 * и передайте это значение в пропсы
 */
export const Touch = ({ children, style, startCoords = defaultStartCoords, padding = defaultPadding, className, onUpdateStartCoords, ignoredSelectors, }) => {
    const refContainer = useRef(null);
    const preventDrag = useRef(false);
    const [vh, vw] = useViewport();
    const [width, height] = useRefRect(refContainer);
    const [[shiftX, shiftY], setShift] = useState([0, 0]);
    const [[x, y], setStart] = useState(startCoords);
    const validateCoords = useCallback((x, y) => {
        const minX = 0 + padding.left;
        const maxY = 0 - padding.top;
        return [
            validateCoord(minX, vw - width - padding.right, x, 10),
            validateCoord(-vh + height + padding.bottom, maxY, y, 10),
        ];
    }, [vw, vh, width, height, padding]);
    useEffect(() => {
        setStart(validateCoords(x, y));
    }, [validateCoords]);
    useEffect(() => {
        onUpdateStartCoords?.([x, y]);
    }, [x, y, onUpdateStartCoords]);
    const handleMove = useCallback((e) => {
        e.originalEvent.preventDefault();
        if (preventDrag.current) {
            return;
        }
        setShift([e.shiftX, e.shiftY]);
    }, [x, y]);
    const handleEnd = useCallback((e) => {
        e.originalEvent.preventDefault();
        if (preventDrag.current) {
            preventDrag.current = false;
            return;
        }
        setStart(([x, y]) => validateCoords(x + e.shiftX, y + e.shiftY));
        setShift([0, 0]);
    }, [validateCoords]);
    const handleStart = useCallback((e) => {
        if (checkIgnoredSelectors(e, ignoredSelectors)) {
            preventDrag.current = true;
        }
    }, []);
    const [curX, curY] = validateCoords(x + shiftX, y + shiftY);
    return (_jsx(TouchComponent, { className: className, Component: "div", getRootRef: refContainer, style: {
            ...style,
            transform: `translate(${curX}px, ${curY}px)`,
        }, onStart: handleStart, onMove: handleMove, onEnd: handleEnd, children: children }));
};
//# sourceMappingURL=Touch.js.map