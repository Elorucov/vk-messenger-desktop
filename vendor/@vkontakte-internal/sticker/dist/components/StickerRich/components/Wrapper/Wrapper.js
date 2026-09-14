import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tappable } from '@vkontakte/vkui';
import { classNames } from '@vkontakte/vkjs';
import styles from './Wrapper.module.css';
export function Wrapper({ icon, children, iconPosition, iconWrapperRef, onContentClick, contentClassName = '', wrapperClassName = '', stickerContainerClassName = '', buttonAriaLabel, }) {
    const modifiedStyles = stylesModifier(iconPosition);
    return (_jsxs("div", { "data-testid": "sticker-rich-wrapper", className: classNames(styles.wrapper, modifiedStyles.wrapper, wrapperClassName), children: [_jsx("div", { "data-testid": "sticker-rich-sticker-wrapper", className: classNames(stickerContainerClassName, modifiedStyles.stickerWrapper), children: children }), _jsx("div", { "data-testid": "sticker-rich-icon-wrapper", className: classNames(styles.icon, modifiedStyles.icon, contentClassName), children: _jsx(Tappable, { hoverMode: "opacity", activeMode: "opacity", disabled: !onContentClick, getRootRef: iconWrapperRef, onClick: onContentClick, "aria-label": buttonAriaLabel, children: icon }) })] }));
}
function stylesModifier(iconPosition = 'rightInset') {
    let defaultStyles = {
        wrapper: '',
        stickerWrapper: '',
        icon: '',
    };
    switch (iconPosition) {
        case 'leftAbsolute':
            return {
                ...defaultStyles,
                icon: classNames(styles.iconAbsolute, styles.iconAbsoluteLeft),
            };
        case 'rightAbsolute':
            return {
                ...defaultStyles,
                icon: classNames(styles.iconAbsolute, styles.iconAbsoluteRight),
            };
        case 'leftInset':
            return {
                ...defaultStyles,
                icon: classNames(styles.iconAbsolute, styles.iconAbsoluteInsetLeft),
            };
        case 'rightInset':
            return {
                ...defaultStyles,
                icon: classNames(styles.iconAbsolute, styles.iconAbsoluteInsetRight),
            };
        case 'leftRelative':
            return {
                ...defaultStyles,
                wrapper: classNames(styles.wrapperFlex, styles.wrapperFlexLeft),
                icon: classNames(styles.iconRelative, styles.iconRelativeLeft),
            };
        case 'rightRelative':
            return {
                ...defaultStyles,
                wrapper: classNames(styles.wrapperFlex, styles.wrapperFlexRight),
                icon: classNames(styles.iconRelative, styles.iconRelativeRight),
            };
        default: {
            return defaultStyles;
        }
    }
}
//# sourceMappingURL=Wrapper.js.map