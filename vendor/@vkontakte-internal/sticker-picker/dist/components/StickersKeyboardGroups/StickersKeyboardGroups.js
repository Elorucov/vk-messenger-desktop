import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":9,"style":2}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte-internal/vkcom-kit';
import { Icon16ChevronOutline } from '@vkontakte/icons';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ShopButton } from './ShopButton/ShopButton';
import { StickersKeyboardGroup } from '../StickersKeyboardGroup/StickersKeyboardGroup';
import { $packs } from '../../model/stickers/packs';
import { $visibleTabState } from '../../model/visibleTab';
import { $selectedPackKey } from '../../model/stickers/packs/selected';
import { useSmoothScroll } from '../../hooks/smoothScroll';
import { useHorizontalScroll } from '../../hooks/horizontalScroll';
import { useStickersKeyboard } from '../../hooks/stickersKeyboard';
import { POPUP_STICKER_CONTAINER_ID } from '../../constants';
import styles from './StickersKeyboardGroups.module.css';
export var HorizontalScrollDirection;
(function (HorizontalScrollDirection) {
    HorizontalScrollDirection["LEFT"] = "left";
    HorizontalScrollDirection["RIGHT"] = "right";
})(HorizontalScrollDirection || (HorizontalScrollDirection = {}));
export function StickersKeyboardGroups({ className, ...props }) {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const { getGroupIndex, isGroupedStockItem, prevSelectedPackKey } = useStickersKeyboard();
    const { packsGroups } = useStore($packs);
    const selectedPackKey = useStore($selectedPackKey);
    const { isStickersVisibleTab } = useStore($visibleTabState);
    const ref = useRef(null);
    const [isLeftChevronShown, setIsLeftChevronShown] = useState(false);
    const [isRightChevronShown, setIsRightChevronShown] = useState(true);
    const groups = useMemo(() => packsGroups?.map((group) => (_jsx(StickersKeyboardGroup, { className: styles.groupIn, group: group }, String(group)))) || [], [packsGroups]);
    const count = groups.length;
    const virtualizer = useVirtualizer({
        count,
        overscan: 5,
        horizontal: true,
        getScrollElement: () => ref.current,
        estimateSize: () => 32,
        onChange: ({ range }) => {
            if (!range) {
                return;
            }
            const { startIndex, endIndex } = range;
            setIsLeftChevronShown(startIndex > 0);
            setIsRightChevronShown(endIndex < groups.length - 1);
        },
    });
    const { scrollTo } = useSmoothScroll(virtualizer);
    const getVirtualItem = (itemIndex) => virtualizer.getVirtualItems().find(({ index }) => index === itemIndex);
    const handleHorizontalScroll = (direction) => () => {
        if (!virtualizer.range) {
            return;
        }
        const { startIndex, endIndex } = virtualizer.range;
        const containerRect = virtualizer.scrollElement?.getBoundingClientRect();
        if (!containerRect) {
            return;
        }
        const { width } = containerRect;
        switch (direction) {
            case HorizontalScrollDirection.LEFT: {
                const item = getVirtualItem(startIndex - 1);
                if (!item) {
                    return;
                }
                const { size, end } = item;
                scrollTo({
                    offset: end + size * 2 - width,
                });
                break;
            }
            case HorizontalScrollDirection.RIGHT: {
                const item = getVirtualItem(endIndex - 1);
                if (!item) {
                    return;
                }
                const { size, start } = item;
                scrollTo({
                    offset: start - size,
                });
                break;
            }
        }
    };
    useHorizontalScroll(ref);
    useEffect(() => {
        if (!selectedPackKey || !packsGroups) {
            return;
        }
        const activeIndex = getGroupIndex(selectedPackKey);
        const prevActiveIndex = getGroupIndex(prevSelectedPackKey);
        const isGroupedPrevIndex = isGroupedStockItem(prevSelectedPackKey);
        if (activeIndex === undefined) {
            return;
        }
        // Возникают проблемы центровки активного таба из-за изменения ширины при закрытии группы
        if (isGroupedPrevIndex && activeIndex > Number(prevActiveIndex)) {
            return;
        }
        virtualizer.scrollToIndex(activeIndex, { align: 'center' });
    }, [virtualizer, selectedPackKey, packsGroups]);
    const popupProps = {
        'data-popup-sticker-deductible': POPUP_STICKER_CONTAINER_ID,
        'data-popup-sticker-deductible-full-screen': POPUP_STICKER_CONTAINER_ID,
    };
    return (_jsxs("div", { ...popupProps, className: classNames(styles.groups, {
            [styles.groupsForced]: isStickersVisibleTab,
        }, className), ...props, children: [_jsx(ShopButton, {}), _jsxs("div", { className: styles.container, children: [hasPointer && (_jsxs(_Fragment, { children: [_jsx("div", { className: classNames(styles.shadow, styles.shadowLeft, {
                                    [styles.shadowVisible]: isLeftChevronShown,
                                }) }), _jsx("div", { className: classNames(styles.shadow, styles.shadowRight, {
                                    [styles.shadowVisible]: isRightChevronShown,
                                }) }), _jsx("div", { "aria-hidden": true, className: classNames(styles.chevron, styles.chevronLeft, {
                                    [styles.chevronActive]: isLeftChevronShown,
                                }), onClick: handleHorizontalScroll(HorizontalScrollDirection.LEFT), children: _jsx(Icon16ChevronOutline, {}) }), _jsx("div", { "aria-hidden": true, className: classNames(styles.chevron, styles.chevronRight, {
                                    [styles.chevronActive]: isRightChevronShown,
                                }), onClick: handleHorizontalScroll(HorizontalScrollDirection.RIGHT), children: _jsx(Icon16ChevronOutline, {}) })] })), _jsx("div", { ref: ref, className: styles.in, children: _jsx("div", { className: styles.items, style: {
                                width: virtualizer.getTotalSize(),
                            }, children: Boolean(groups.length) &&
                                virtualizer.getVirtualItems().map(({ key, index, start }) => (_jsx("div", { "data-index": index, ref: virtualizer.measureElement, className: styles.group, style: {
                                        transform: `translateX(${start}px)`,
                                    }, "data-testid": "stickers-groups-item", children: groups[index] }, key))) }) })] })] }));
}
//# sourceMappingURL=StickersKeyboardGroups.js.map