import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// При изменении синхронизируйте правки с Elephize-версией компонента
// static/js/modules/shared/vkcom-kit/components/Skeleton/SkeletonText/SkeletonText.iso.tsx
import { classNames } from '@vkontakte/vkjs';
import { Overlay } from '../../Overlay/Overlay';
import { TextClamp } from '../../TextClamp/TextClamp';
import { SkeletonComponent } from '../SkeletonComponent';
import styles from './SkeletonText.module.css';
/**
 * Для скелетонов текста.
 * Позволяет сохранить установленный родителем line-height и отрисовать скелетон с line-height: 1.
 */
export const SkeletonText = ({ className, lines = 1, preserveWhitespaces, children, ...restProps }) => {
    return (_jsxs(TextClamp, { Component: "span", className: classNames(styles.root, className), lines: lines, "aria-hidden": true, children: [_jsx("span", { className: styles.children, children: children }), _jsx(Overlay, { children: _jsx("div", { className: styles.skeletons, children: Array(lines)
                        .fill(0)
                        .map((_, i) => (_jsx("span", { children: _jsx(SkeletonComponent, { width: "100%", ...restProps }) }, i))) }) })] }));
};
//# sourceMappingURL=SkeletonText.js.map