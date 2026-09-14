import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Avatar.Badge":["Adopted",{"className":1,"style":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Avatar } from '../../Adopted';
import styles from './Badge.module.css';
export const placementModifiersMap = {
    'top-left': styles.rootTopLeft,
    'top-right': styles.rootTopRight,
    'bottom-left': styles.rootBottomLeft,
    'bottom-center': styles.rootBottomCenter,
    'bottom-right': styles.rootBottomRight,
};
export const RichAvatarBadge = ({ visibility = 'always', placement = 'bottom-right', zIndex, className, style, children, ...restProps }) => {
    const isRasterIcon = typeof children.type !== 'string' && 'isRasterIcon' in children.type;
    return (_jsx(Avatar.Badge, { className: classNames(styles.root, isRasterIcon && styles.rootRaster, visibility === 'on-hover' && styles.rootOnHover, placementModifiersMap[placement], className), style: {
            zIndex: zIndex ?? style?.zIndex,
            ...style,
        }, ...restProps, children: children }));
};
//# sourceMappingURL=Badge.js.map