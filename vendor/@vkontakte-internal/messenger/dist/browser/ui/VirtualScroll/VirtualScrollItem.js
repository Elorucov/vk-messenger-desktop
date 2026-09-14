import { useVirtualList } from '../../ui/VirtualScroll/VirtualScrollList';
import '../../ui/VirtualScroll/VirtualScrollItem.css';
import React, { useCallback, useLayoutEffect, useRef, } from 'react';
import cx from 'classnames';
const DEFAULT_HEIGHT = 100;
export const VirtualScrollItem = ({ itemKey, children, className, shouldRender }) => {
    const $ref = useRef(null);
    const $height = useRef(DEFAULT_HEIGHT);
    const virtualizerCore = useVirtualList();
    const slice = virtualizerCore.getSliceArea();
    const index = virtualizerCore.findVirtualItemIndex(itemKey);
    const notInSlice = !slice || index < slice.upperIndex || index > slice.bottomIndex;
    const hideContent = !shouldRender && notInSlice;
    const onIntersectionChanged = useCallback((entry) => {
        $height.current = entry.boundingClientRect.height;
    }, []);
    useLayoutEffect(() => {
        if (!$ref.current) {
            return;
        }
        return virtualizerCore.registerVirtualItem($ref.current, onIntersectionChanged);
    }, [onIntersectionChanged, virtualizerCore]);
    return (React.createElement("div", { ref: $ref, "data-itemkey": itemKey, className: cx(className, 'VirtualScrollItem') }, hideContent ? (React.createElement("div", { style: {
            height: $height.current,
        } })) : (children)));
};
VirtualScrollItem.displayName = 'VirtualScrollItem';
//# sourceMappingURL=VirtualScrollItem.js.map