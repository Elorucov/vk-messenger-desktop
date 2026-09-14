import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"IconButtonNative":["@vkontakte/vkui",{"className":1,"style":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { IconButton as IconButtonNative, } from '@vkontakte/vkui';
import { RichImage } from '../../RichImage/RichImage';
import styles from './IconButton.module.css';
export const IconButton = ({ src, size, width, height, noPadding, className, style, children, ...restProps }) => {
    const hasCustomSize = Boolean(size ?? width ?? height);
    return (_jsx(IconButtonNative, { className: classNames(hasCustomSize && styles.rootCustomSize, noPadding && styles.rootNoPadding, className), style: {
            ...style,
            width: size ?? width ?? style?.width ?? undefined,
            height: size ?? height ?? style?.height ?? undefined,
            minWidth: size ?? width ?? style?.minWidth ?? undefined,
            minHeight: size ?? height ?? style?.minHeight ?? undefined,
        }, ...restProps, children: src && size ? _jsx(RichImage, { alt: "", src: src, size: size, noBorder: true, transparent: true }) : children }));
};
//# sourceMappingURL=IconButton.js.map