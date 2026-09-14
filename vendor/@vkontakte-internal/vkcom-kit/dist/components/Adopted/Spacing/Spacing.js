import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import styles from './Spacing.module.css';
const modeModifiersMap = {
    horizontal: undefined,
    vertical: styles.rootVertical,
};
const sizeModifiersMap = {
    '3xs': styles.rootSize3Xs,
    '2xs': styles.rootSize2Xs,
    'xs': styles.rootSizeXs,
    's': styles.rootSizeS,
    'm': styles.rootSizeM,
    'l': styles.rootSizeL,
    'xl': styles.rootSizeXl,
    '2xl': styles.rootSize2Xl,
    '3xl': styles.rootSize3Xl,
    '4xl': styles.rootSize4Xl,
};
/**
 * Компонент полностью перебивает Spacing из `@vkontakte/vkui`. В `@vkontakte/vkui` нет поддержки `'vertical'`.
 *
 * Note: в кодовой базе есть использование `<Spacing size={6} style={{ width: 0 }} />`.
 */
export const Spacing = ({ Component = 'div', size = 8, className, style, mode = 'horizontal', getRootRef, ...restProps }) => {
    const [spacingSizeClassName, spacingSizeStyle] = resolveSpacingSize('--vkit_internal--spacing_gap_size', size);
    return (_jsx(Component, { ref: getRootRef, style: spacingSizeStyle ? { ...spacingSizeStyle, ...style } : style, className: classNames(className, styles.root, modeModifiersMap[mode], spacingSizeClassName), ...restProps }));
};
function resolveSpacingSize(cssVariable, size) {
    if (typeof size === 'string') {
        if (size.startsWith('--')) {
            return [undefined, { [cssVariable]: `var(${size})` }];
        }
        else {
            return [sizeModifiersMap[size], undefined];
        }
    }
    return [undefined, typeof size === 'number' ? { [cssVariable]: `${size}px` } : undefined];
}
//# sourceMappingURL=Spacing.js.map