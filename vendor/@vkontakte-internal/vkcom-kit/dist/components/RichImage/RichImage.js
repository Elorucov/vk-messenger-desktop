import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
// eslint-disable-next-line no-restricted-imports
import { Image as VKUIImage } from '@vkontakte/vkui';
// Прямой импорт чинит циклическую зависимость Adopted/index -> Adopted/IconButton -> этот файл -> Adopted/index -> Adopted/Image
// eslint-disable-next-line no-restricted-imports
import { Image } from '../Adopted/Image/Image';
import styles from './RichImage.module.css';
const shadowModifiers = {
    s: styles.containerShadowS,
    m: styles.containerShadowM,
    l: styles.containerShadowL,
    none: undefined,
};
const paddingModifiers = {
    m: styles.containerPaddingM,
    none: undefined,
};
const appearanceModifiers = {
    contrast: styles.containerContrast,
    neutral: undefined,
};
const borderRadiusModifiers = {
    default: styles.borderRadiusDefault,
    paper: styles.borderRadiusPaper,
    promo: styles.borderRadiusPromo,
    circle: styles.borderRadiusCircle,
};
function assertBorderRadiusHasClass(borderRadius) {
    return typeof borderRadius === 'string' && Object.keys(borderRadiusModifiers).includes(borderRadius);
}
const RichImageComponent = ({ shadow = 'none', padding = 'none', appearance = 'neutral', transparent, className, borderRadius, ...restProps }) => {
    return (_jsx(Image, { className: classNames(shadowModifiers[shadow], paddingModifiers[padding], appearanceModifiers[appearance], assertBorderRadiusHasClass(borderRadius) && borderRadiusModifiers[borderRadius], transparent && styles.containerTransparent, className), borderRadius: assertBorderRadiusHasClass(borderRadius) ? undefined : borderRadius, ...restProps }));
};
export const RichImage = Object.assign(RichImageComponent, VKUIImage);
//# sourceMappingURL=RichImage.js.map