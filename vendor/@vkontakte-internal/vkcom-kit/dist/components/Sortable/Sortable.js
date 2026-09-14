import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { noop } from '@vkontakte/vkjs';
import { browser } from '@vkontakte-internal/browsers-utils';
import { useStableCallback, useValueRef } from '@vkontakte-internal/react-utils';
import { moveArrayElement } from '@vkontakte-internal/utils';
import { useEffect, useState } from 'react';
import SortableJS from 'sortablejs';
import { useAdaptivityWithJSMediaQueries, usePatchChildren, VisuallyHidden, } from '../Adopted';
import { LiveRegion } from '../LiveRegion/LiveRegion';
import { SortableItem } from './SortableItem/SortableItem';
import { useSortableAccessibility } from './hooks/useSortableAccessibility';
import styles from './Sortable.module.css';
const SortableComponent = ({ delay, items, animation = 200, accessibility, onSortChange, onMirrorCreated, children, externRef, ...restProps }) => {
    const [announcement, setAnnouncement] = useState();
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const { onKeyDown } = useSortableAccessibility({
        items,
        onSortChange,
        accessibility,
        setAnnouncement,
    });
    const [ref, child] = usePatchChildren(children, {
        children: (_jsxs(_Fragment, { children: [accessibility && (_jsx(VisuallyHidden, { children: accessibility.screenReaderInstructions.draggable })), _jsx(LiveRegion, { children: announcement }), 'children' in children.props && children.props.children] })),
        ...restProps,
        // @ts-expect-error TS0000: Разобраться, как обновим VKUI
        onKeyDown,
    }, externRef);
    const itemsRef = useValueRef(items);
    const onMirrorCreatedStable = useStableCallback(onMirrorCreated ? onMirrorCreated : noop);
    const onSortChangeStable = useStableCallback(onSortChange);
    useEffect(() => {
        const container = ref.current;
        if (!container) {
            return;
        }
        const root = container.querySelector('[data-sortable-root]') || container;
        const instance = new SortableJS(root, {
            sort: true,
            animation,
            delay: delay ?? (hasPointer ? 0 : 100),
            draggable: '[data-sortable-id]',
            filter: '[data-sortable-disabled]',
            fallbackClass: browser.safari ? styles.fallback : '',
            forceFallback: browser.safari,
            fallbackOnBody: browser.safari,
            onStart: () => {
                document.body.classList.add(styles.bodyDragging);
                onMirrorCreatedStable();
            },
            onMove: function (event) {
                if (event.related.dataset.sortableDisabled || !event.related.dataset.sortableId) {
                    return false;
                }
            },
            onEnd: ({ oldDraggableIndex, newDraggableIndex }) => {
                document.body.classList.remove(styles.bodyDragging);
                if (oldDraggableIndex === undefined || newDraggableIndex === undefined) {
                    return;
                }
                onSortChangeStable(moveArrayElement({ items: itemsRef.current, from: oldDraggableIndex, to: newDraggableIndex }), oldDraggableIndex, newDraggableIndex);
            },
        });
        return () => {
            instance.destroy();
        };
    }, [hasPointer, animation, delay, ref, itemsRef, onMirrorCreatedStable, onSortChangeStable]);
    if (!child) {
        return null;
    }
    return _jsx(_Fragment, { children: child });
};
export const Sortable = Object.assign(SortableComponent, {
    Item: SortableItem,
});
//# sourceMappingURL=Sortable.js.map