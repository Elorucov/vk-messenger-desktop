import { AnimationState } from './animationState';
import { getPopUpPositionType } from './getPopUpPositionType';
import { getPlayBackAreaStyle } from './getPlayBackAreaStyle';
import { getGradientAreaStyle } from './getGradientAreaStyle';
import { getAnimationAreaStyle } from './getAnimationAreaStyle';
import { checkPositionConflict } from './checkPositionConflict';
import { isCanPlay, isCanScale, isGradientLayer, isFullScreenLayer, isBackgroundLayer, checkPositionIsEqual, getAnimationLayerScaleRatio, isBackgroundAnimationLayout, isMainAnimationLayout, } from './layer';
function getBaseProps(layer, popUpElements, conflictBlocks, lastMainAreaProps) {
    const isGradientLayerFixedToAnimationLayer = !popUpElements.animationFooterElement;
    /**
     * Высота градиентной подложки определяется на основе следующего слоя с основной анимацией (первого встреченного).
     * Для предотвращения ошибок: если такого слоя нет – подложка не отображается.
     *
     * Но если есть deductible-элемент только для анимации, то размеры слоя с градиентом будем считать отдельно
     */
    if (isGradientLayer(layer) && isGradientLayerFixedToAnimationLayer) {
        if (!lastMainAreaProps) {
            return null;
        }
        const basePopUpLayerStyle = {
            ...lastMainAreaProps.popUpLayerStyle,
            top: 'unset',
            left: 'unset',
            transform: 'unset',
        };
        const gradientData = getGradientAreaStyle(layer, basePopUpLayerStyle);
        return {
            layer,
            style: lastMainAreaProps.style,
            animationState: lastMainAreaProps.animationState,
            popUpLayerStyle: gradientData.style,
            popUpLayerStyleData: gradientData.styleData,
        };
    }
    const type = getPopUpPositionType(layer);
    const { playBackAreaStyle, topByViewport } = getPlayBackAreaStyle(type, popUpElements, !isGradientLayer(layer));
    if (isGradientLayer(layer)) {
        if (!lastMainAreaProps || isGradientLayerFixedToAnimationLayer) {
            return null;
        }
        const gradientData = getGradientAreaStyle(layer, {
            height: '100%',
            width: '100%',
        });
        return {
            layer,
            style: playBackAreaStyle,
            animationState: lastMainAreaProps.animationState,
            popUpLayerStyle: gradientData.style,
            popUpLayerStyleData: gradientData.styleData,
        };
    }
    if (isBackgroundLayer(layer)) {
        return {
            layer,
            style: playBackAreaStyle,
            popUpLayerStyle: layer.style,
        };
    }
    const animationState = new AnimationState();
    if (isBackgroundAnimationLayout(layer)) {
        // сделать в рамках VAS-7161
        return null;
    }
    const playBackAreaWidth = parseInt(playBackAreaStyle.width);
    const playBackAreaHeight = parseInt(playBackAreaStyle.height);
    let popUpLayerSize = Math.min(playBackAreaWidth, playBackAreaHeight);
    const scale = getAnimationLayerScaleRatio(layer);
    if (isCanScale(popUpLayerSize)) {
        popUpLayerSize *= scale;
    }
    /**
     * В вебе (vk.com) если в позиционировании по горизонтали И вертикали используется модификатор "screen",
     * то максимальный размер области воспроизведения: 50% от min(witdh, height) вьюпорта (viewport)
     */
    if (isFullScreenLayer(layer)) {
        const availableMaxSize = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth) * 0.5;
        if (popUpLayerSize > availableMaxSize) {
            popUpLayerSize = availableMaxSize;
        }
    }
    if (!isCanPlay(popUpLayerSize)) {
        return null;
    }
    const basePopUpLayerStyle = { height: popUpLayerSize, width: popUpLayerSize };
    const popUpLayerStyle = getAnimationAreaStyle({ width: playBackAreaWidth, height: playBackAreaHeight }, layer, basePopUpLayerStyle);
    const top = topByViewport + parseInt(popUpLayerStyle.top);
    const left = topByViewport + parseInt(popUpLayerStyle.left);
    const bottom = top + popUpLayerSize;
    const right = left + popUpLayerSize;
    const modificatedLayer = checkPositionConflict(conflictBlocks, {
        top,
        left,
        bottom,
        right,
    }, layer);
    if (!modificatedLayer) {
        return null;
    }
    /**
     * Если после проверки конфликтов позиционирования
     * у нашего блока поменялось позиционирование, то идем пересчитывать пропсы
     */
    if (!checkPositionIsEqual(layer, modificatedLayer)) {
        return getBaseProps(modificatedLayer, popUpElements, [], null);
    }
    return {
        animationState,
        layer,
        popUpLayerStyle,
        style: playBackAreaStyle,
    };
}
export const getBasePropsForPlaybackAreas = ({ layers, popUpElements, conflictBlocks, }) => {
    /**
     * Нам нужно градиенту давать высоту ближайшей основной анимации перед ним.
     * Поэтому переворачиваем, чтобы когда мы обрабатывали градиент, уже знали размеры, что ему дать.
     * Если на момент обработки градиента lastMainAreaProps будет null, то мы не показываем градиент.
     */
    const reversedLayers = [...layers].reverse();
    const playBackAreasProps = [];
    let lastMainAreaProps = null;
    for (const layer of reversedLayers) {
        const baseProps = getBaseProps(layer, popUpElements, conflictBlocks, lastMainAreaProps);
        /**
         * Если это слой основной анимации, то запоминаем его, чтобы потом обработать градиент на основе его
         */
        if (isMainAnimationLayout(layer)) {
            lastMainAreaProps = baseProps;
        }
        /**
         * Если это слой градиента, то очищаем данные о слое основной анимации, ибо мы обработали градиент для него
         */
        if (isGradientLayer(layer)) {
            lastMainAreaProps = null;
        }
        if (baseProps) {
            playBackAreasProps.push(baseProps);
        }
    }
    /**
     * Возвращаем позиции слоев в исходный вид
     */
    playBackAreasProps.reverse();
    return playBackAreasProps;
};
//# sourceMappingURL=getBaseProps.js.map