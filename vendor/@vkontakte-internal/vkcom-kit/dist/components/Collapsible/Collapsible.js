import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useExternRef } from '@vkontakte-internal/react-utils';
import { useCollapsibleHeight } from './useCollabsibleHeight';
import styles from './Collapsible.module.css';
/**
 * Компонент, отвечающий за анимацию сворачивания
 */
export const Collapsible = ({ getRootRef, expanded, children, minHeight, onExpand, onCollapse, className, ...restProps }) => {
    const [childrenHeight, dropdownRef, handleTransitionEnd] = useCollapsibleHeight(Boolean(expanded), minHeight);
    const ref = useExternRef(getRootRef, dropdownRef);
    const onTransitionEnd = (event) => {
        handleTransitionEnd(event);
        expanded ? onExpand?.() : onCollapse?.();
    };
    return (_jsx("div", { ...restProps, ref: ref, className: classNames(styles.container, !expanded && styles.containerCollapsed, className), onTransitionEnd: onTransitionEnd, style: {
            ...restProps.style,
            height: childrenHeight,
        }, "aria-hidden": !expanded && !minHeight, children: children }));
};
//# sourceMappingURL=Collapsible.js.map