import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// При изменении синхронизируйте правки с Elephize-версией компонента
// static/js/modules/shared/vkcom-kit/components/Skeleton/SkeletonOverlay/Skeleton.iso.tsx
import { classNames } from '@vkontakte/vkjs';
import { Overlay } from '../../Overlay/Overlay';
import { SkeletonComponent } from '../SkeletonComponent';
import styles from './SkeletonOverlay.module.css';
/**
 * Для изображений (с большими полями), которые хочется отобразить поменьше и сохранить при этом общий размер блока.
 */
export const SkeletonOverlay = ({ children, className, style, width = '100%', height = '100%', ...restProps }) => {
    return (_jsxs("div", { className: classNames(styles.root, className), style: style, "aria-hidden": true, children: [_jsx("span", { className: styles.children, children: children }), _jsx(Overlay, { centered: true, children: _jsx(SkeletonComponent, { ...restProps, width: width, height: height }) })] }));
};
//# sourceMappingURL=SkeletonOverlay.js.map