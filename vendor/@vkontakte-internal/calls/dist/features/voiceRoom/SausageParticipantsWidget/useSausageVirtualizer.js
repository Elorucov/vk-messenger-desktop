import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { useVirtualizer, defaultRangeExtractor } from '@tanstack/react-virtual';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getVoiceRoomListenersTotalCount, getVoiceRoomListenersMaxPage, LISTENERS_PAGE_SIZE, setVoiceRoomListenersPage, getListenersCardWidth, getListenersCardHeight, COUNT_LISTENERS_IN_LINE, MIN_LISTENERS_PAGE, getSpeakersCardWidth, getSpeakersCardHeight, } from '../../../features/voiceRoom';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
export var ROWS;
(function (ROWS) {
    ROWS["SPEAKERS_ROW_HEADER"] = "SPEAKERS_ROW_HEADER";
    ROWS["SPEAKERS_ROW"] = "SPEAKERS_ROW";
    ROWS["LISTENERS_ROW_HEADER"] = "LISTENERS_ROW_HEADER";
    ROWS["LISTENERS_ROW"] = "LISTENERS_ROW";
})(ROWS || (ROWS = {}));
export const HEADER_ROWS = new Set([ROWS.SPEAKERS_ROW_HEADER, ROWS.LISTENERS_ROW_HEADER]);
export const COUNT_SPEAKERS_IN_LINE = 3;
export const COUNT_SPEAKERS_IN_SAUSAGE_LINE = 3;
const COUNT_SPEAKERS_HEADERS = 1;
const COUNT_LISTENERS_HEADERS = 1;
const HEADER_HEIGHT = 42;
const LIST_PADDING_SIZE = 6;
export const useSausageVirtualizer = (speakersCount) => {
    const listenersCardWidth = useTypedSelector(getListenersCardWidth);
    const speakersCardWidth = useTypedSelector(getSpeakersCardWidth);
    const parentRef = useRef(null);
    const { rowKeys, rowsCount, rangeExtractor, getRowSize, rowsListenersOffset, rowsSpeakersOffset, checkActiveSticky, } = useVirtualizerRows(speakersCount);
    const onRowChange = useRowChange({ rowsListenersOffset });
    const rowVirtualizer = useVirtualizer({
        count: rowsCount,
        getScrollElement: () => parentRef.current,
        estimateSize: getRowSize,
        rangeExtractor,
        onChange: onRowChange,
    });
    const columnSpeakersVirtualizer = useVirtualizer({
        horizontal: true,
        paddingStart: LIST_PADDING_SIZE,
        paddingEnd: LIST_PADDING_SIZE,
        count: COUNT_SPEAKERS_IN_LINE,
        estimateSize: () => speakersCardWidth,
        getScrollElement: () => parentRef.current,
    });
    const columnListenersVirtualizer = useVirtualizer({
        horizontal: true,
        paddingStart: LIST_PADDING_SIZE,
        paddingEnd: LIST_PADDING_SIZE,
        count: COUNT_LISTENERS_IN_LINE,
        estimateSize: () => listenersCardWidth,
        getScrollElement: () => parentRef.current,
    });
    return {
        rowVirtualizer,
        columnListenersVirtualizer,
        columnSpeakersVirtualizer,
        checkActiveSticky,
        rowKeys,
        parentRef,
        rowsSpeakersOffset,
        rowsListenersOffset,
    };
};
function useVirtualizerRows(speakersCount) {
    const activeStickyIndexRef = useRef(0);
    // todo - реализовать если вернемся к разработке voiceRooms
    const isGridSpeakersMode = false;
    const listenersCount = useTypedSelector(getVoiceRoomListenersTotalCount);
    const listenersCardHeight = useTypedSelector(getListenersCardHeight);
    const speakersCardHeight = useTypedSelector(getSpeakersCardHeight);
    const countSpeakersRows = !isGridSpeakersMode && !!speakersCount
        ? Math.ceil(speakersCount / COUNT_SPEAKERS_IN_LINE) + COUNT_SPEAKERS_HEADERS
        : 0;
    const countListenersRow = !!listenersCount
        ? Math.ceil(listenersCount / COUNT_LISTENERS_IN_LINE) + COUNT_LISTENERS_HEADERS
        : 0;
    const speakersRowKeys = useMemo(() => {
        return getSectionRowKeys(countSpeakersRows, ROWS.SPEAKERS_ROW_HEADER, ROWS.SPEAKERS_ROW);
    }, [countSpeakersRows]);
    const listenersRowKeys = useMemo(() => getSectionRowKeys(countListenersRow, ROWS.LISTENERS_ROW_HEADER, ROWS.LISTENERS_ROW), [countListenersRow]);
    const rowKeys = useMemo(() => [...speakersRowKeys, ...listenersRowKeys], [speakersRowKeys, listenersRowKeys]);
    const stickyRowIndexes = useMemo(() => rowKeys.reduce((acc, key, index) => {
        if (HEADER_ROWS.has(key)) {
            acc.push(index);
        }
        return acc;
    }, []), [rowKeys]);
    const rangeExtractor = useCallback((range) => {
        if (!stickyRowIndexes.length || !range) {
            return defaultRangeExtractor(range);
        }
        const stickyIndex = [...stickyRowIndexes].reverse().find((index) => range.startIndex >= index);
        if (typeof stickyIndex === 'number') {
            activeStickyIndexRef.current = stickyIndex;
        }
        const next = new Set([activeStickyIndexRef.current, ...defaultRangeExtractor(range)]);
        return [...next].sort((a, b) => a - b);
    }, [stickyRowIndexes]);
    const getRowSize = useCallback((index) => {
        const key = rowKeys[index];
        switch (key) {
            case ROWS.SPEAKERS_ROW_HEADER:
            case ROWS.LISTENERS_ROW_HEADER: {
                return HEADER_HEIGHT;
            }
            case ROWS.SPEAKERS_ROW: {
                return speakersCardHeight;
            }
            case ROWS.LISTENERS_ROW: {
                return listenersCardHeight;
            }
        }
    }, [rowKeys, speakersCardHeight, listenersCardHeight]);
    const checkActiveSticky = (index) => activeStickyIndexRef.current === index;
    return {
        rowKeys,
        rowsCount: countSpeakersRows + countListenersRow,
        rowsListenersOffset: countSpeakersRows + COUNT_LISTENERS_HEADERS,
        rowsSpeakersOffset: COUNT_SPEAKERS_HEADERS,
        stickyRowIndexes,
        rangeExtractor,
        getRowSize,
        checkActiveSticky,
    };
}
function useRowChange({ rowsListenersOffset }) {
    // todo - реализовать если вернемся к разработке voiceRooms
    const isGridSpeakersMode = false;
    const calcNextPage = useCalcNextPage(rowsListenersOffset);
    return useCallback((virtualizer) => {
        calcNextPage(virtualizer);
    }, [calcNextPage, isGridSpeakersMode]);
}
function useCalcNextPage(rowsOffset) {
    const [endIndex, setEndIndex] = useState(0);
    const maxPage = useTypedSelector(getVoiceRoomListenersMaxPage);
    const dispatch = useTypedDispatch();
    useEffect(() => {
        if (!endIndex) {
            return;
        }
        const lastVisibleRow = endIndex - rowsOffset;
        const lastVisibleListener = (lastVisibleRow + 1) * COUNT_LISTENERS_IN_LINE - 1;
        const currentPage = Math.floor(lastVisibleListener / LISTENERS_PAGE_SIZE);
        // Считаем пограничные случаи (не меньше 0 и не больше максимально возможной страницы)
        const nextPage = Math.max(Math.min(currentPage, maxPage), MIN_LISTENERS_PAGE);
        dispatch(setVoiceRoomListenersPage(nextPage));
    }, [rowsOffset, maxPage, endIndex]);
    const calcNextPage = (virtualizerInstance) => {
        if (virtualizerInstance.isScrolling || !virtualizerInstance.range) {
            return;
        }
        setEndIndex(virtualizerInstance.range.endIndex);
    };
    return calcNextPage;
}
function getSectionRowKeys(count, headerKey, rowKey) {
    const result = new Array(count).fill(rowKey);
    if (result.length) {
        result[0] = headerKey;
    }
    return result;
}
//# sourceMappingURL=useSausageVirtualizer.js.map