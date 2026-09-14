import { jsx as _jsx } from "react/jsx-runtime";
// TODO [@vkontakte/vkui@>=8.0.0]: Компонент должен появится в VKUI https://github.com/VKCOM/VKUI/issues/6924
import { classNames } from '@vkontakte/vkjs';
import { vkuiCssVars } from '../../../../tokens/cssVars';
import styles from './ImageBaseOverlayItem.module.css';
const placementModifiersMap = {
    'center': undefined,
    'center-left': styles.rootCenterLeft,
    'center-right': styles.rootCenterRight,
    'top-left': styles.rootTopLeft,
    'top-center': styles.rootTopCenter,
    'top-right': styles.rootTopRight,
    'bottom-left': styles.rootBottomLeft,
    'bottom-center': styles.rootBottomCenter,
    'bottom-right': styles.rootBottomRight,
};
const visibilityModifiersMap = {
    'always': undefined,
    'on-hover': styles.rootOnHover,
};
const paddingTokensMap = {
    regular: vkuiCssVars.sizeBasePaddingVertical.regular.value,
};
export const ImageBaseOverlayItem = ({ zIndex, placement, left, bottom, visibility = 'always', padding, paddingTop, paddingLeft, paddingRight, paddingBottom, className, style, ...restProps }) => {
    return (_jsx("div", { className: classNames(styles.root, placement && placementModifiersMap[placement], visibilityModifiersMap[visibility], className), style: {
            ...style,
            zIndex: zIndex ?? style?.zIndex,
            ...(left !== undefined ? { left, bottom } : {}),
            ...(padding !== undefined
                ? {
                    padding: style?.padding ?? (padding ? paddingTokensMap[padding] ?? padding : undefined),
                }
                : {
                    paddingTop: style?.paddingTop ?? (paddingTop ? paddingTokensMap[paddingTop] ?? paddingTop : undefined),
                    paddingLeft: style?.paddingLeft ??
                        (paddingLeft ? paddingTokensMap[paddingLeft] ?? paddingLeft : undefined),
                    paddingRight: style?.paddingRight ??
                        (paddingRight ? paddingTokensMap[paddingRight] ?? paddingRight : undefined),
                    paddingBottom: style?.paddingBottom ??
                        (paddingBottom ? paddingTokensMap[paddingBottom] ?? paddingBottom : undefined),
                }),
        }, ...restProps }));
};
//# sourceMappingURL=ImageBaseOverlayItem.js.map