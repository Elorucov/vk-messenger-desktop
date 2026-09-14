import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"CustomScrollView":["@vkontakte-internal/vkcom-kit",{"className":1}],"div":["global",{"className":2,"style":2}]} */
import { useStore } from 'effector-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { getStickerContext } from '@vkontakte-internal/sticker';
import { useEffect, useMemo, useRef } from 'react';
import { CustomScrollView } from '@vkontakte-internal/vkcom-kit';
import { chunkArray, classNames, createArray, isEqual } from '@vkontakte/vkjs';
import { ViewItem } from '../View/ViewItem/ViewItem';
import { StickersKeyboardRow } from '../StickersKeyboardRow/StickersKeyboardRow';
import { StickersKeyboardGroups } from '../StickersKeyboardGroups/StickersKeyboardGroups';
import { StickersKeyboardHeader } from '../StickersKeyboardHeader/StickersKeyboardHeader';
import { StickersKeyboardUGCRow } from '../StickersKeyboardRow/entries/ugc/StickersKeyboardUGCRow';
import { StickersKeyboardVmojiRow } from '../StickersKeyboardRow/entries/vmoji/StickersKeyboardVmojiRow';
import { StickersKeyboardSelectProvider } from '../StickersKeyboardProvider/StickersKeyboardSelectProvider';
import { $isVisible } from '../../model/visible';
import { $activePackKey } from '../../model/stickers/packs/active';
import { $selectedPackKey } from '../../model/stickers/packs/selected';
import { $packs, ServicePackKey } from '../../model/stickers/packs';
import { $avatarSuggestionTab } from '../../model/helpHint/avatarSuggestionBanner/tab';
import { $stickersHorizontalGap, $stickersSize, $stickersVerticalGap, $stickersKeyboardVerticalOrder, } from '../../model/stickers/variant';
import { useAPI } from '../../hooks/api';
import { useGrid } from '../../hooks/grid';
import { Tab } from '../../utils/cache/types';
import { useSticky } from '../../hooks/sticky';
import { useScrollView } from '../../hooks/scrollView';
import { useAvatarSuggestion } from '../../hooks/useAvatarSuggestion';
import { StickersKeyboardElementType } from './types';
import { useStickersKeyboard } from '../../hooks/stickersKeyboard';
import styles from './StickersKeyboard.module.css';
export function StickersKeyboard({ className, ...props }) {
    const api = useAPI();
    const { setSelectedPack } = useStickersKeyboard();
    const { getAvatarSuggestionStickerRow, bannerPackIndex, avatarSuggestion } = useAvatarSuggestion();
    const { packs } = useStore($packs);
    const isVisible = useStore($isVisible);
    const bannerTab = useStore($avatarSuggestionTab);
    const stickersSize = useStore($stickersSize);
    const activePackKey = useStore($activePackKey);
    const selectedPackKey = useStore($selectedPackKey);
    const stickersVerticalGap = useStore($stickersVerticalGap);
    const stickersHorizontalGap = useStore($stickersHorizontalGap);
    const verticalOrder = useStore($stickersKeyboardVerticalOrder);
    const ref = useRef(null);
    const headerIndexesRef = useRef([]);
    const isPrevActiveTabAppliedRef = useRef(false);
    useScrollView(ref);
    const { setGridRef, columns } = useGrid({
        tab: Tab.STICKERS,
        itemWidth: stickersSize + stickersHorizontalGap,
    });
    const rows = useMemo(() => {
        if (!packs || !columns) {
            return [
                {
                    type: StickersKeyboardElementType.HEADER,
                    element: _jsx(StickersKeyboardHeader, {}, Math.random()),
                    sticky: true,
                },
                ...createArray(6).map((index) => ({
                    type: StickersKeyboardElementType.ROW,
                    element: _jsx(StickersKeyboardRow, { columns: columns }, index),
                })),
            ];
        }
        const rows = [];
        let currentIndex = null;
        const pack = packs?.get(selectedPackKey);
        if (pack?.index !== undefined) {
            currentIndex = pack.index;
        }
        packs.forEach((pack) => {
            const { id, index } = pack;
            const stickers = pack.stickers?.map(getStickerContext);
            rows.push({
                type: StickersKeyboardElementType.HEADER,
                element: _jsx(StickersKeyboardHeader, { pack: pack }, id),
                sticky: true,
            });
            const isNeedShowVmojiBanner = id === ServicePackKey.VMOJI;
            if (isNeedShowVmojiBanner) {
                rows.push({
                    type: StickersKeyboardElementType.ROW,
                    element: _jsx(StickersKeyboardVmojiRow, {}, ServicePackKey.VMOJI),
                });
            }
            const isNeedShowUGCBanner = id === ServicePackKey.UGC && !stickers?.length;
            if (isNeedShowUGCBanner) {
                rows.push({
                    type: StickersKeyboardElementType.ROW,
                    element: _jsx(StickersKeyboardUGCRow, {}, ServicePackKey.UGC),
                });
            }
            const isNeedDisablePromo = isNeedShowVmojiBanner || isNeedShowUGCBanner;
            const indexForBanner = currentIndex || 0;
            if ((bannerPackIndex === null && index === indexForBanner) || bannerPackIndex === index) {
                const avatarSuggestionStickerRow = getAvatarSuggestionStickerRow(indexForBanner, isNeedDisablePromo);
                if (avatarSuggestionStickerRow) {
                    rows.push(avatarSuggestionStickerRow);
                }
            }
            if (stickers) {
                chunkArray(stickers, columns).forEach((stickers, index) => {
                    rows.push({
                        type: StickersKeyboardElementType.ROW,
                        element: (_jsx(StickersKeyboardRow, { stickers: stickers, columns: columns, pack: pack }, `${id}${index}`)),
                    });
                });
            }
        });
        return rows;
    }, [packs, columns, avatarSuggestion]);
    const headerIndexes = useMemo(() => {
        const prevHeaderIndexes = headerIndexesRef.current;
        const headerIndexes = rows.reduce((headerIndexes, { type }, index) => {
            if (type === StickersKeyboardElementType.HEADER) {
                headerIndexes.push(index);
            }
            return headerIndexes;
        }, []);
        const isHeadersEqual = isEqual(headerIndexes, prevHeaderIndexes);
        if (isHeadersEqual || !headerIndexes.length) {
            return prevHeaderIndexes;
        }
        headerIndexesRef.current = headerIndexes;
        return headerIndexes;
    }, [rows]);
    const isHeader = (index) => headerIndexes.includes(index);
    const { rangeExtractor, isSticky } = useSticky({
        rows,
    });
    const virtualizer = useVirtualizer({
        rangeExtractor,
        count: rows.length,
        estimateSize: () => stickersSize,
        getScrollElement: () => ref.current,
    });
    const { range } = virtualizer;
    const scrollToPackHeader = (pack, key, force) => {
        const { index } = pack;
        if (index === undefined) {
            return;
        }
        const stockItemPosition = headerIndexes[index];
        if (selectedPackKey === key && !force) {
            return;
        }
        // Такое может случится если нам вернулись дефолтные rows -> workspaces/sticker-picker/src/components/StickersKeyboard/StickersKeyboard.tsx:59
        if (stockItemPosition === undefined) {
            return;
        }
        virtualizer.scrollToIndex(stockItemPosition, {
            align: 'start',
            behavior: 'auto',
        });
    };
    const selectStockItem = (key) => {
        const pack = packs?.get(key);
        if (!pack) {
            return;
        }
        scrollToPackHeader(pack, key);
        setSelectedPack(key);
    };
    useEffect(() => {
        if (bannerPackIndex !== null && bannerTab === Tab.STICKERS && headerIndexes[bannerPackIndex]) {
            virtualizer.scrollToIndex(headerIndexes[bannerPackIndex], {
                align: 'start',
                behavior: 'auto',
            });
        }
    }, [bannerPackIndex]);
    useEffect(() => {
        const container = ref.current;
        if (!container || packs) {
            return;
        }
        container.style.setProperty('overflow', 'hidden', 'important');
        return () => {
            container.style.removeProperty('overflow');
        };
    }, [packs]);
    useEffect(() => {
        const prevActiveTab = api.cache.stickersActiveTab.get();
        if (!packs) {
            return;
        }
        isPrevActiveTabAppliedRef.current = false;
        if (!activePackKey && !prevActiveTab) {
            isPrevActiveTabAppliedRef.current = true;
            return;
        }
        selectStockItem(activePackKey || prevActiveTab);
        isPrevActiveTabAppliedRef.current = true;
    }, [headerIndexes, packs, activePackKey, isVisible]);
    useEffect(() => {
        const isPrevActiveTabApplied = isPrevActiveTabAppliedRef.current;
        const range = virtualizer.calculateRange();
        if (!range) {
            return;
        }
        const { startIndex, endIndex } = range;
        if ((!startIndex && !endIndex) || !headerIndexes.length || !packs || !isPrevActiveTabApplied) {
            return;
        }
        const contexts = [...packs.values()];
        const startHeaderIndex = headerIndexes.findIndex((index) => index >= startIndex);
        const endHeaderIndex = headerIndexes.findIndex((index) => index >= endIndex);
        // Текущая секция полностью занимает всю зону видимости
        const offset = Number(startHeaderIndex === endHeaderIndex && startIndex !== endIndex);
        const pack = contexts[startHeaderIndex - offset];
        if (!pack) {
            return;
        }
        const { id } = pack;
        setSelectedPack(id);
    }, [range, headerIndexes]);
    const virtualItems = virtualizer.getVirtualItems().filter(Boolean);
    return (_jsx(StickersKeyboardSelectProvider, { selectPack: selectStockItem, children: _jsxs(ViewItem, { getRef: setGridRef, className: classNames(styles.keyboard, className), style: {
                '--stickers-columns': columns,
                '--stickers-size': `${stickersSize}px`,
                '--stickers-vertical-gap': `${stickersVerticalGap}px`,
                '--stickers-horizontal-gap': `${stickersHorizontalGap}px`,
                '--stickers-tab-flex-direction': `${verticalOrder}`,
            }, ...props, children: [_jsx(CustomScrollView, { getRootRef: ref, className: classNames(styles.scroll, {
                        [styles.scrollDisabled]: !packs,
                    }), overscrollBehavior: "none", children: _jsx("div", { className: styles.in, style: {
                            height: virtualizer.getTotalSize(),
                        }, children: virtualItems.map(({ key, index, start }) => (_jsx("div", { "data-index": index, ref: virtualizer.measureElement, className: classNames(styles.item, {
                                [styles.itemHeader]: isHeader(index),
                            }), "data-testid": "stickers-item", style: isSticky(index)
                                ? {
                                    position: 'sticky',
                                }
                                : {
                                    position: 'absolute',
                                    transform: `translateY(${start}px)`,
                                }, children: rows[index].element }, key))) }) }), packs && _jsx(StickersKeyboardGroups, {})] }) }));
}
//# sourceMappingURL=StickersKeyboard.js.map