import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// При изменении синхронизируйте правки с Elephize-версией компонента
// static/js/modules/shared/vkcom-kit/components/Skeleton/Skeleton.iso.tsx
import { classNames } from '@vkontakte/vkjs';
import { isStringOrNumber } from '../../utils/types';
import styles from './SkeletonComponent.module.css';
const modifiersMap = {
    default: styles.borderRadiusDefault,
    paper: styles.borderRadiusPaper,
    promo: styles.borderRadiusPromo,
};
function assertBorderRadiusHasClass(borderRadius) {
    return typeof borderRadius === 'string' && Object.keys(modifiersMap).includes(borderRadius);
}
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-invalid-component-props-name
export const SkeletonComponent = ({ className, width, maxWidth, height, borderRadius, circle, colorFrom, colorTo, noAnimation, duration, style: externalStyle, children, noShrink, ...restProps }) => {
    const style = {};
    if (isStringOrNumber(width)) {
        style.width = width;
    }
    if (isStringOrNumber(maxWidth)) {
        style.maxWidth = maxWidth;
    }
    if (isStringOrNumber(height)) {
        style.height = height;
    }
    if (isStringOrNumber(borderRadius) && !assertBorderRadiusHasClass(borderRadius)) {
        style.borderRadius = borderRadius;
    }
    if (circle) {
        style.borderRadius = '50%';
    }
    if (colorFrom !== undefined) {
        style['--skeleton-from'] = colorFrom;
    }
    if (colorTo !== undefined) {
        style['--skeleton-to'] = colorTo;
    }
    if (Number.isFinite(duration)) {
        style['--animation-duration'] = `${duration}s`;
    }
    return (_jsx("span", { className: classNames(styles.skeleton, noAnimation && styles.skeletonNoAnimation, noShrink && styles.skeletonNoShrink, assertBorderRadiusHasClass(borderRadius) && modifiersMap[borderRadius], !!children && styles.withChildren, className), "data-testid": "loading-skeleton", "aria-hidden": true, style: {
            ...style,
            ...(externalStyle || {}),
        }, ...restProps, children: children ? _jsx("span", { className: styles.skeletonChildren, children: children }) : _jsx(_Fragment, { children: "\u200C" }) }));
};
//# sourceMappingURL=SkeletonComponent.js.map