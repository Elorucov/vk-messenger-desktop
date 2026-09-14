import { useCallback, useEffect, useState } from 'react';
import { exhaustivenessCheck } from '../../../../core/utils/misc';
import { getSizeSwapped, getValidSize } from '../../../ui/MediaViewer/utils';
import { isWindows } from '../../../utils/misc';
const MIN_SCALE = 1;
const MAX_SCALE = 5;
/* Величина, на которую будет увеличиваться transform: scale внутри модалки */
const SCALE_STEP = 1;
export const usePhotoScaler = ({ imageContainer, isSidesSwapped, maxViewportSize, modalSize, setModalSize, }) => {
    const [scale, setScale] = useState(1);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [originalModalSize, setOriginalModalSize] = useState(null);
    const [isPointerMovingHandling, setIsPointerMovingHandling] = useState(false);
    /* С помощью этой функции "ходим" по зазумленной фотке в любую сторону */
    const updateCoords = useCallback((update, reversed = false) => {
        /* Ничего не делаем, если фотка не зазумлена */
        if (scale === MIN_SCALE) {
            return;
        }
        /* transition здесь замедлит навигацию по картинке, поэтому отключаем */
        setTransition(imageContainer, '');
        /*
          Получаем корректные (фактические) ширину и высоту с учетом поворота
  
          Просто свапа за счет getSizeSwapped недостаточно, т.к. после свапа
          может оказаться, что теперешняя высота (прежняя ширина) слишком большая
          для максимальной высоты вьюпорта, поэтому в getValidSize происходит валидация
        */
        const { w: width, h: height } = getValidSize({
            size: getSizeSwapped({
                size: modalSize,
                isSidesSwapped,
            }),
            maxViewportSize,
            isSidesSwapped,
        });
        setCoords(({ x, y }) => {
            const coordsToWant = {
                x: reversed ? x + update.x : x - update.x,
                y: reversed ? y + update.y : y - update.y,
            };
            switch (scale) {
                case 2:
                    return getCoordsToSet(coordsToWant, {
                        w: width / 2,
                        h: height / 2,
                    });
                case 3:
                    return getCoordsToSet(coordsToWant, {
                        w: width,
                        h: height,
                    });
                case 4:
                    return getCoordsToSet(coordsToWant, {
                        w: width * 1.5,
                        h: height * 1.5,
                    });
                case 5:
                    return getCoordsToSet(coordsToWant, {
                        w: width * 2,
                        h: height * 2,
                    });
                default:
                    exhaustivenessCheck(scale);
            }
        });
    }, [scale, modalSize, maxViewportSize, isSidesSwapped, imageContainer]);
    const zoomOut = useCallback(() => {
        if (!originalModalSize) {
            return;
        }
        /* Включаем анимирование tranform для плавного зума */
        setTransition(imageContainer, ZOOM_TRANSITION);
        /* Если есть, куда отдаляться внутри картинки, делаем это */
        const nextScale = Math.max(scale - SCALE_STEP, MIN_SCALE);
        /* Сопоставляем новые координаты прошлым */
        setCoords(({ x, y }) => ({
            x: x - x / nextScale,
            y: y - y / nextScale,
        }));
        setScale(resolveInsideScale(nextScale));
    }, [imageContainer, originalModalSize, scale]);
    const zoomIn = useCallback(() => {
        if (!originalModalSize) {
            return;
        }
        if (scale >= MAX_SCALE) {
            return;
        }
        /* Включаем анимирование tranform для плавного зума */
        setTransition(imageContainer, ZOOM_TRANSITION);
        const nextScale = Math.min(scale + SCALE_STEP, MAX_SCALE);
        /* Сопоставляем новые координаты прошлым */
        const nextCoords = {
            x: coords.x + coords.x / nextScale,
            y: coords.y + coords.y / nextScale,
        };
        setCoords(nextCoords);
        setScale(resolveInsideScale(nextScale));
    }, [coords, imageContainer, originalModalSize, scale]);
    /*
      Функции, реализующие навигацию по зазумленной фотке в формате "зажал-потащил-отпустил"
    */
    const onMouseDown = () => {
        if (scale === MIN_SCALE) {
            return;
        }
        setIsPointerMovingHandling(true);
    };
    const [prevScreenX, setPrevScreenX] = useState(0);
    const [prevScreenY, setPrevScreenY] = useState(0);
    const onTouchStart = (e) => {
        if (scale === MIN_SCALE) {
            return;
        }
        const touch = e.touches[0] || e.changedTouches[0];
        if (touch) {
            setPrevScreenX(touch.screenX || 0);
            setPrevScreenY(touch.screenY || 0);
        }
        setIsPointerMovingHandling(true);
    };
    /* Обработка движения курсора, если он зажат */
    const onMouseMove = useCallback((e) => {
        e.preventDefault();
        if (!isPointerMovingHandling) {
            return;
        }
        updateCoords({ x: e.movementX, y: e.movementY }, true);
    }, [updateCoords, isPointerMovingHandling]);
    const onTouchMove = useCallback((e) => {
        e.preventDefault();
        if (!isPointerMovingHandling) {
            return;
        }
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) {
            return;
        }
        const x = (touch.screenX || 0) - prevScreenX;
        setPrevScreenX(touch.screenX || 0);
        const y = (touch.screenY || 0) - prevScreenY;
        setPrevScreenY(touch.screenY || 0);
        updateCoords({ x, y }, true);
    }, [updateCoords, isPointerMovingHandling, prevScreenX, prevScreenY]);
    /* Обработка поднятия (отпускания) курсора */
    const onMouseUp = () => {
        setIsPointerMovingHandling(false);
    };
    const onTouchEnd = (e) => {
        const touch = e.touches[0] || e.changedTouches[0];
        if (touch) {
            setPrevScreenX(touch.screenX || 0);
            setPrevScreenY(touch.screenY || 0);
        }
        setIsPointerMovingHandling(false);
    };
    /* Обработка колёсика мыши или тачпад-скролла */
    const onWheel = useCallback((e) => {
        e.preventDefault();
        const isHotkeyPressed = getIsHotkeyPressed(e, isWindows);
        if (isHotkeyPressed) {
            if (e.deltaY > 0) {
                zoomOut();
            }
            else {
                zoomIn();
            }
        }
        else {
            updateCoords({ x: e.deltaX, y: e.deltaY });
        }
    }, [zoomOut, zoomIn, updateCoords]);
    /* Сбрасываем увеличение и зум по двойному клику (только для суровых ребят) */
    const onDoubleClick = () => {
        setScale(MIN_SCALE);
        if (originalModalSize) {
            setModalSize(originalModalSize);
        }
        setCoords({ x: 0, y: 0 });
    };
    /* Сброс для внешнего использования */
    const reset = (newSize) => {
        setTransition(imageContainer, '');
        setOriginalModalSize(newSize);
        setCoords({ x: 0, y: 0 });
        setScale(MIN_SCALE);
    };
    useEffect(() => {
        if (!imageContainer) {
            return;
        }
        imageContainer.addEventListener('wheel', onWheel, {
            passive: false,
        });
        return () => {
            imageContainer.removeEventListener('wheel', onWheel);
        };
    }, [onWheel, imageContainer]);
    /* Запоминаем изначальный размер модалки */
    useEffect(() => {
        /* Не перезаписываем, если уже установлен */
        if (originalModalSize) {
            return;
        }
        setOriginalModalSize(modalSize);
    }, [originalModalSize, modalSize]);
    return {
        scale,
        pos: coords,
        isMoving: isPointerMovingHandling,
        canZoomIn: scale < MAX_SCALE,
        canZoomOut: scale > MIN_SCALE,
        zoomOut,
        zoomIn,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onDoubleClick,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        reset,
    };
};
const ZOOM_TRANSITION = 'transform 0.2s ease-in-out';
const setTransition = (el, transition) => {
    el && (el.style.transition = transition);
};
const resolveInsideScale = (scale) => {
    if (scale >= MIN_SCALE && scale <= MAX_SCALE) {
        return scale;
    }
    return MIN_SCALE;
};
/* Не позволяет убегать в зазумленной фотке за края */
const getCoordsToSet = (toWant, size) => {
    const coordsToSet = { x: toWant.x, y: toWant.y };
    if (toWant.x < 0 && Math.abs(toWant.x) >= size.w) {
        coordsToSet.x = -size.w;
    }
    else if (toWant.x > 0 && toWant.x >= size.w) {
        coordsToSet.x = size.w;
    }
    if (toWant.y < 0 && Math.abs(toWant.y) >= size.h) {
        coordsToSet.y = -size.h;
    }
    else if (toWant.y > 0 && toWant.y >= size.h) {
        coordsToSet.y = size.h;
    }
    return coordsToSet;
};
const getIsHotkeyPressed = (e, isWindows) => {
    return isWindows ? e.ctrlKey : e.metaKey || e.ctrlKey;
};
//# sourceMappingURL=usePhotoScaler.js.map