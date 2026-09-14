import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"HorizontalScroll":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { useLayoutEffect, useRef } from 'react';
import { vkuiCssVars } from '../../../tokens/cssVars';
import { HorizontalScroll } from '../../Adopted';
import { useGridContext } from '../GridContext';
import styles from './GridHorizontalScroll.module.css';
const paddingModifiersMap = {
    base: vkuiCssVars.sizeBasePaddingHorizontal.regular.value,
};
export const GridHorizontalScroll = ({ padding, centered, children, className, scrollSnap, ...restProps }) => {
    const { setHasHorizontalScroll } = useGridContext();
    const itemsRef = useRef(null);
    useLayoutEffect(() => {
        setHasHorizontalScroll(true);
        return () => {
            setHasHorizontalScroll(false);
        };
    }, [setHasHorizontalScroll]);
    const paddingVar = (padding && paddingModifiersMap[padding]) || padding;
    const style = {
        '--grid-padding': typeof paddingVar === 'string' ? paddingVar : `${paddingVar}px`,
    };
    const getScrollToLeft = scrollSnap
        ? (initial) => {
            if (!itemsRef.current)
                return initial;
            return getClosestRightItem(itemsRef.current.children, initial - itemsRef.current.offsetWidth);
        }
        : undefined;
    const getScrollToRight = scrollSnap
        ? (initial) => {
            if (!itemsRef.current)
                return initial;
            return getClosestLeftItem(itemsRef.current.children, initial + itemsRef.current.offsetWidth);
        }
        : undefined;
    return (_jsx(HorizontalScroll, { "data-testid": "grid-horizontalscroll", className: classNames(styles.root, centered && styles.rootCentered, className), getScrollToLeft: getScrollToLeft, getScrollToRight: getScrollToRight, ...restProps, children: _jsx("div", { "data-sortable-root": true, className: classNames(styles.items, paddingVar !== undefined && styles.itemsWithPadding), style: style, ref: itemsRef, children: children }) }));
};
function getClosestLeftItem(nodes, position) {
    let first = 0;
    let last = nodes.length - 1;
    while (first !== last) {
        const current = Math.ceil((first + last) / 2);
        const currentPosition = nodes[current].offsetLeft;
        if (currentPosition <= position) {
            first = current;
        }
        if (currentPosition > position) {
            last = current - 1;
        }
    }
    return nodes[first].offsetLeft;
}
function getClosestRightItem(nodes, position) {
    let first = 0;
    let last = nodes.length - 1;
    while (first !== last) {
        const current = Math.floor((first + last) / 2);
        const currentPosition = nodes[current].offsetLeft;
        if (currentPosition >= position) {
            last = current;
        }
        if (currentPosition < position) {
            first = current + 1;
        }
    }
    return nodes[first].offsetLeft;
}
//# sourceMappingURL=GridHorizontalScroll.js.map