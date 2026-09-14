import { SCREEN_MODIFICATOR } from '../constants';
const DEG_BY_POSITION = {
    bottom: '0deg',
    left: '90deg',
    top: '180deg',
    right: '270deg',
};
/**
 * Стили для позиционирования градиентной подложки внутри области воспроизведения
 */
export const getGradientAreaStyle = ({ position }, baseStyle) => {
    const style = {};
    style.position = 'absolute';
    const positionProperty = position.replace(`${SCREEN_MODIFICATOR} `, '');
    if (positionProperty === 'middle') {
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
        // Градиент зависит от темы, поэтому его будем устанавливать в компоненте GradientLayer по признаку
        return { style: { ...baseStyle, ...style }, styleData: { isRadialGradient: true } };
    }
    if (['top', 'bottom'].includes(positionProperty)) {
        style.width = '100%';
    }
    else {
        style.height = '100%';
    }
    style[positionProperty] = 0;
    // @ts-expect-error TS7053: Element implicitly has an 'any' type because expression of type '"--gradient-deg"' can't be used to index type 'CSSProperties'.
    // Property '--gradient-deg' does not exist on type 'CSSProperties'.
    style['--gradient-deg'] = DEG_BY_POSITION[positionProperty] || DEG_BY_POSITION.top;
    return { style: { ...baseStyle, ...style }, styleData: { isRadialGradient: false } };
};
//# sourceMappingURL=getGradientAreaStyle.js.map