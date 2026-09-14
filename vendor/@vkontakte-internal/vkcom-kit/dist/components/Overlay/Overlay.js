import { jsx as _jsx } from "react/jsx-runtime";
// При изменении синхронизируйте правки с Elephize-версией компонента
// static/js/modules/shared/vkcom-kit/components/Overlay/Overlay.iso.tsx
import { classNames } from '@vkontakte/vkjs';
import styles from './Overlay.module.css';
const modeModifiersMap = {
    default: styles.root,
    after: styles.rootAfter,
};
const placementModifiersMap = {
    'top': styles.rootTop,
    'left': styles.rootLeft,
    'bottom': styles.rootBottom,
    'right': styles.rootRight,
    'center': styles.rootCenter,
    'top-left': styles.rootTopLeft,
    'top-right': styles.rootTopRight,
    'bottom-left': styles.rootBottomLeft,
    'bottom-right': styles.rootBottomRight,
};
const calculateOffset = (offset) => {
    if (!offset)
        return [0, 0];
    if (typeof offset === 'number')
        return [offset, offset];
    return offset;
};
export const Overlay = ({ Component = 'div', mode = 'default', getRootRef, children, zIndex, borderRadius, centered, className, placement, stretch, fixed, offset, style, ...restProps }) => {
    const isStringComponent = typeof Component === 'string';
    const ref = isStringComponent
        ? {
            ref: getRootRef,
        }
        : {
            getRootRef,
        };
    const [xOffset, yOffset] = calculateOffset(offset);
    const placementStyle = {
        '--overlay-custom-placement-offset-x': `${xOffset}px`,
        '--overlay-custom-placement-offset-y': `${yOffset}px`,
    };
    return (_jsx(Component, { ...restProps, ...ref, className: classNames(className, modeModifiersMap[mode], centered && styles.rootCentered, placement && styles.rootPlacement, stretch && styles.rootStretch, fixed && styles.rootFixed, placementModifiersMap[placement]), style: { ...style, ...placementStyle, zIndex, borderRadius }, children: children }));
};
//# sourceMappingURL=Overlay.js.map