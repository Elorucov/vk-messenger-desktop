import { CustomPopUpLayerTypes, DEFAULT_LOOP_LIMIT, DEFAULT_POSITION_X, DEFAULT_POSITION_Y, DEFAULT_SCALE_RATIO, MIN_SIZE_FOR_PLAY, MIN_SIZE_FOR_SCALE, PopUpLayerTypes, SCREEN_MODIFICATOR, } from '../constants';
export const getAnimationLayerPosition = (layer) => {
    const { position_x, position_y } = layer;
    return {
        position_x: position_x || DEFAULT_POSITION_X,
        position_y: position_y || DEFAULT_POSITION_Y,
    };
};
export const getAnimationLayerLoopsLimit = (layer) => {
    const { loops_limit = DEFAULT_LOOP_LIMIT } = layer;
    return loops_limit;
};
export const getAnimationLayerScaleRatio = (layer) => {
    const { scale_ratio = DEFAULT_SCALE_RATIO } = layer;
    return scale_ratio;
};
export const isGradientLayer = (layer) => layer.type === PopUpLayerTypes.Gradient;
export const isBackgroundLayer = (layer) => layer.type === CustomPopUpLayerTypes.Background;
export const isBackgroundAnimationLayout = (layer) => layer.type === PopUpLayerTypes.FullScreen;
export const isMainAnimationLayout = (layer) => layer.type === PopUpLayerTypes.Fixed;
export const isAnimationLayer = (layer) => isBackgroundAnimationLayout(layer) || isMainAnimationLayout(layer);
export const isTopFullScreenLayer = (layer) => {
    if (!isMainAnimationLayout(layer)) {
        return false;
    }
    const { position_x, position_y } = getAnimationLayerPosition(layer);
    return !position_x.includes(SCREEN_MODIFICATOR) && position_y === `${SCREEN_MODIFICATOR} top`;
};
export const isFullScreenLayer = (layer) => {
    if (isBackgroundLayer(layer) || isBackgroundAnimationLayout(layer)) {
        return true;
    }
    if (isGradientLayer(layer)) {
        return layer.position.includes(SCREEN_MODIFICATOR);
    }
    if (isMainAnimationLayout(layer)) {
        const { position_x, position_y } = getAnimationLayerPosition(layer);
        return position_x.includes(SCREEN_MODIFICATOR) && position_y.includes(SCREEN_MODIFICATOR);
    }
    return false;
};
/**
 * Анимация может быть полноэкранная или частично полноэкранная даже если она fullscreen только с одной стороны
 */
export const isFullOrPartiallyFullScreenLayer = (layer) => {
    // Возможно тут надо проверять не только top а еще и другие стороны, но пока таких анимаций не планируется
    return isFullScreenLayer(layer) || isTopFullScreenLayer(layer);
};
export const changeLayerPosition = (layer) => {
    const { position_x, position_y } = getAnimationLayerPosition(layer);
    if (isFullOrPartiallyFullScreenLayer(layer)) {
        return {
            ...layer,
            position_x: position_x.replace(`${SCREEN_MODIFICATOR} `, ''),
            position_y: position_y.replace(`${SCREEN_MODIFICATOR} `, ''),
        };
    }
    return {
        ...layer,
        position_x: `${SCREEN_MODIFICATOR} ${position_x}`,
        position_y: `${SCREEN_MODIFICATOR} ${position_y}`,
    };
};
export const checkPositionIsEqual = (layer, layer2) => {
    if (isAnimationLayer(layer) && isAnimationLayer(layer2)) {
        return layer2.position_y === layer.position_y && layer.position_x === layer2.position_x;
    }
    if (isGradientLayer(layer) && isGradientLayer(layer2)) {
        return layer2.position === layer.position;
    }
    return false;
};
export const isCanScale = (size) => size >= MIN_SIZE_FOR_SCALE;
export const isCanPlay = (size) => size >= MIN_SIZE_FOR_PLAY;
//# sourceMappingURL=layer.js.map