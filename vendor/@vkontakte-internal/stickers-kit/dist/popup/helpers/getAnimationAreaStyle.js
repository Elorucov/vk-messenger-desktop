import { SCREEN_MODIFICATOR } from '../constants';
import { getAnimationLayerPosition } from './layer';
/**
 * Стили для позиционирования области анимации внутри области воспроизведения
 */
export const getAnimationAreaStyle = ({ width, height }, layer, baseCSS) => {
    const style = { ...baseCSS };
    const { position_y, position_x } = getAnimationLayerPosition(layer);
    const posX = position_x.replace(SCREEN_MODIFICATOR, '').trim();
    const posY = position_y.replace(SCREEN_MODIFICATOR, '').trim();
    style.position = 'absolute';
    if (posX === 'center') {
        style.left = width * 0.5;
        style.transform = 'translateX(-50%)';
    }
    else if (posX === 'left') {
        style.left = 0;
    }
    else {
        style.left = width - parseInt(style.width);
    }
    if (posY === 'middle') {
        style.top = height * 0.5;
        style.transform = 'translateY(-50%)';
    }
    else if (posY === 'top') {
        style.top = 0;
    }
    else {
        style.top = height - parseInt(style.height);
    }
    if (posY === 'middle' && posX === 'center') {
        style.transform = 'translate(-50%, -50%)';
    }
    return style;
};
//# sourceMappingURL=getAnimationAreaStyle.js.map