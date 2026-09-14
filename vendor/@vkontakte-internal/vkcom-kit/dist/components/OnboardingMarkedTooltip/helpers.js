import { TILT_SIZE } from './constants';
import { markerModeRatioMap, markerSizes } from './types';
export const getAnimationDirection = (animationIn) => {
    return animationIn ? 1 : -1;
};
/*
 Находит ближайший размер лотти анимации для переданного size
 */
export const getNearestMarkerSize = (size) => {
    if (markerSizes.some((markerSize) => markerSize === size)) {
        return size;
    }
    return markerSizes.reduce((prev, curr) => Math.abs(curr - size) < Math.abs(prev - size) ||
        (Math.abs(curr - size) === Math.abs(prev - size) && curr < prev)
        ? curr
        : prev, markerSizes[0]);
};
export const tipPositionMap = {
    'top': 'top',
    'top-left': 'top-end',
    'top-right': 'top-start',
    'bottom': 'bottom',
    'bottom-left': 'bottom-end',
    'bottom-right': 'bottom-start',
};
const getTipOffsetX = (size) => {
    if (size >= 96) {
        return Math.round((44 / 96) * size);
    }
    return size / 2;
};
const getTipOffsetY = (size) => {
    switch (true) {
        case size > 96:
            return size / 10;
        case size === 96:
            return 12;
        default:
            return 10;
    }
};
export const calculateValidMarkerSize = (mode, size) => {
    if (!mode || !size)
        return [0, 0];
    const markerModeRatio = markerModeRatioMap[mode];
    return [size * markerModeRatio, size];
};
const isTopPlacement = (placement) => Boolean(placement?.startsWith('top'));
const isLeftPlacement = (placement) => Boolean(placement?.endsWith('end'));
const isCenterPlacement = (placement) => placement === 'top' || placement === 'bottom';
const getNumberValue = (value, negative = false) => {
    return negative ? -value : value;
};
const getVerticalTiltCorner = (isTop) => {
    return isTop ? 'bottom' : 'top';
};
const getHorizontalTiltCorner = (isLeft, isCenter) => {
    if (isCenter)
        return 'center';
    return isLeft ? 'right' : 'left';
};
export const getOffsetByCrossAxis = (placement, markerSize, markerOffsetX = 0) => {
    if (!markerSize || isCenterPlacement(placement)) {
        return 0;
    }
    const isTipLeft = isLeftPlacement(placement);
    const offset = getTipOffsetX(markerSize) - markerOffsetX;
    return getNumberValue(offset, isTipLeft);
};
export const getOffsetByMainAxis = (markerSize, markerOffsetY = 0) => {
    if (!markerSize) {
        return 0;
    }
    return markerOffsetY - getTipOffsetY(markerSize);
};
const getLeftOffset = (isLeft, isCenter, markerSize) => {
    if (isCenter) {
        return `calc(50% - ${markerSize / 2}px)`;
    }
    return !isLeft ? '0' : 'auto';
};
export const getTipCustomCssProperties = ({ tipPlacement, size, tilt, markerOffsetX, markerOffsetY, }) => {
    if (!size)
        return {};
    const isLeft = isLeftPlacement(tipPlacement);
    const isTop = isTopPlacement(tipPlacement);
    const isCenter = isCenterPlacement(tipPlacement);
    const isTiltLeft = tilt === 'left';
    const tipOffsetX = getOffsetByCrossAxis(tipPlacement, size[0], markerOffsetX);
    const tipOffsetY = getOffsetByMainAxis(size[1], markerOffsetY);
    const tiltDegree = getNumberValue(TILT_SIZE, isTiltLeft);
    const markerLeftOffset = isCenter ? 0 : getNumberValue(markerOffsetX, !isLeft) - tipOffsetX;
    const markerTopOffset = getNumberValue(markerOffsetY, isTop) - getNumberValue(tipOffsetY, isTop);
    return {
        '--onboarding-tooltip-content-tilt-degree': `${tiltDegree}deg`,
        '--onboarding-tooltip-content-animation-start': isTop ? '100%' : '-100%',
        '--onboarding-tooltip-content-transform-origin': `${getVerticalTiltCorner(isTop)} ${getHorizontalTiltCorner(isLeft, isCenter)}`,
        '--onboarding-tooltip-marker-inset': `${isTop ? '100%' : 'auto'} ${isLeft ? '0' : 'auto'} ${!isTop ? '100%' : 'auto'} ${getLeftOffset(isLeft, isCenter, size[0])}`,
        '--onboarding-tooltip-marker-size-x': `${size[0]}px`,
        '--onboarding-tooltip-marker-size-y': `${size[1]}px`,
        '--onboarding-tooltip-marker-left-offset': `${markerLeftOffset}px`,
        '--onboarding-tooltip-marker-top-offset': `${markerTopOffset}px`,
    };
};
//# sourceMappingURL=helpers.js.map